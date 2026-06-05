import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { withAuth } from "@/lib/api/with-auth";
import { CreateInvoiceRequest } from "@/features/payments/dto";
import { createPaymentIntent } from "@/features/payments/queries";
import {
  DIAMOND_PRODUCTS,
  TEST_DIAMOND_PRODUCTS,
} from "@/features/payments/constants";

export const POST = withAuth(async (request, { auth }) => {
  const body = await request.json().catch(() => null);
  const parsed = CreateInvoiceRequest.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { productId } = parsed.data;

  // Never trust client-side amounts — resolve everything from the catalog.
  const allProducts = [...DIAMOND_PRODUCTS, ...TEST_DIAMOND_PRODUCTS];
  const product = allProducts.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  // Invoice IDs must stay below 64 bytes UTF-8 ("inv-" + UUID = 40 bytes).
  const invoice = `inv-${randomUUID()}`;

  const intent = await createPaymentIntent({
    invoice,
    senderAlienId: auth.sub,
    recipientAddress: product.recipientAddress,
    amount: product.amount,
    token: product.token,
    network: product.network,
    productId: product.id,
  });

  return NextResponse.json({
    invoice: intent.invoice,
    id: intent.id,
    recipient: product.recipientAddress,
    amount: product.amount,
    token: product.token,
    network: product.network,
    item: {
      title: product.name,
      iconUrl: product.iconUrl,
      quantity: product.diamonds,
    },
    ...(product.test ? { test: product.test } : {}),
  });
});
