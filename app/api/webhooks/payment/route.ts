import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerEnv } from "@/lib/env";
import { WebhookPayload } from "@/features/payments/dto";
import { findPaymentIntentByInvoice } from "@/features/payments/queries";
import { db, schema } from "@/lib/db";

async function verifySignature(
  publicKeyHex: string,
  signatureHex: string,
  body: string,
): Promise<boolean> {
  const publicKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(publicKeyHex, "hex"),
    { name: "Ed25519" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify(
    "Ed25519",
    publicKey,
    Buffer.from(signatureHex, "hex"),
    Buffer.from(body),
  );
}

/** The webhook schema version this handler implements (X-Webhook-Version). */
const SUPPORTED_WEBHOOK_VERSION = "3";

/**
 * Returns the fields of the webhook payload that contradict the stored
 * payment intent. A signed webhook should always match the intent it
 * references — a mismatch means a misrouted or forged notification.
 *
 * `token` is deliberately not compared: the platform sends a normalized
 * value (a mint address or "native"), which differs from the slug used
 * when requesting the payment. Recipient, amount, and network
 * unambiguously pin the payment to the intent.
 * Spec: https://docs.alien.org/react-sdk/payments#webhook-payload
 */
function findIntentMismatches(
  payload: WebhookPayload,
  intent: { recipientAddress: string; amount: string; network: string },
): string[] {
  const mismatches: string[] = [];
  if (payload.recipient !== intent.recipientAddress) mismatches.push("recipient");
  if (payload.amount !== undefined && payload.amount !== intent.amount) mismatches.push("amount");
  if (payload.network !== undefined && payload.network !== intent.network) mismatches.push("network");
  return mismatches;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHex = request.headers.get("x-webhook-signature") ?? "";

  if (!signatureHex) {
    return NextResponse.json(
      { error: "Missing webhook signature" },
      { status: 401 },
    );
  }

  // Reject schema versions we don't implement rather than misreading them.
  const version = request.headers.get("x-webhook-version");
  if (version !== null && version !== SUPPORTED_WEBHOOK_VERSION) {
    console.error(`Unsupported webhook version: ${version}`);
    return NextResponse.json(
      { error: `Unsupported webhook version: ${version}` },
      { status: 400 },
    );
  }

  try {
    const isValid = await verifySignature(
      getServerEnv().WEBHOOK_PUBLIC_KEY,
      signatureHex,
      rawBody,
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const parsed = WebhookPayload.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const intent = await findPaymentIntentByInvoice(payload.invoice);

    if (!intent) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 },
      );
    }

    // Never trust payload values blindly, even with a valid signature —
    // the source of truth for what was sold is the stored intent.
    const mismatches = findIntentMismatches(payload, intent);
    if (mismatches.length > 0) {
      console.error(
        `Webhook for invoice ${payload.invoice} contradicts stored intent (${mismatches.join(", ")})`,
      );
      return NextResponse.json(
        { error: "Payload does not match payment intent" },
        { status: 400 },
      );
    }

    // The status transition is conditional on `pending`, so concurrent
    // re-deliveries of the same webhook race on this single UPDATE: exactly
    // one wins and records the transaction, the rest are acknowledged below.
    const processed = await db.transaction(async (tx) => {
      const [settled] = await tx
        .update(schema.paymentIntents)
        .set({ status: payload.status === "finalized" ? "completed" : "failed" })
        .where(
          and(
            eq(schema.paymentIntents.invoice, payload.invoice),
            eq(schema.paymentIntents.status, "pending"),
          ),
        )
        .returning({ id: schema.paymentIntents.id });

      if (!settled) return false;

      await tx.insert(schema.transactions).values({
        senderAlienId: intent.senderAlienId,
        recipientAddress: intent.recipientAddress,
        txHash: payload.txHash ?? null,
        status: payload.status === "finalized" ? "paid" : "failed",
        amount: intent.amount,
        token: intent.token,
        network: intent.network,
        invoice: payload.invoice,
        test: payload.test ? "true" : null,
        payload,
      });
      return true;
    });

    if (!processed) {
      return NextResponse.json({
        success: true,
        processed: false,
        reason: "already_processed",
      });
    }

    // Fulfill the order here (credit diamonds, unlock content, ...) when
    // payload.status === "finalized".

    return NextResponse.json({ success: true, processed: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
