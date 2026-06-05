import { z } from "zod";
import { PAYMENT_TEST_SCENARIOS } from "./constants";

export const CreateInvoiceRequest = z.object({
  productId: z.string().min(1),
});

export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequest>;

export const CreateInvoiceResponse = z.object({
  invoice: z.string(),
  id: z.string(),
  recipient: z.string(),
  amount: z.string(),
  token: z.string(),
  network: z.string(),
  item: z.object({
    title: z.string(),
    iconUrl: z.string(),
    quantity: z.number(),
  }),
  test: z.enum(PAYMENT_TEST_SCENARIOS).optional(),
});

export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponse>;

/**
 * Payment webhook payload (X-Webhook-Version: 3), Ed25519-signed by the
 * Alien platform. `token` is platform-normalized (a mint address or
 * "native"), not the slug used in payment:request.
 * Spec: https://docs.alien.org/react-sdk/payments#webhook-payload
 */
export const WebhookPayload = z.object({
  invoice: z.string(),
  recipient: z.string(),
  status: z.enum(["finalized", "failed"]),
  txHash: z.string().optional(),
  amount: z.string().optional(),
  decimals: z.number().optional(),
  token: z.string().optional(),
  network: z.string().optional(),
  test: z.boolean().optional(),
});

export type WebhookPayload = z.infer<typeof WebhookPayload>;

export const TransactionDTO = z.object({
  id: z.string(),
  txHash: z.string().nullable(),
  status: z.string(),
  amount: z.string().nullable(),
  token: z.string().nullable(),
  invoice: z.string().nullable(),
  test: z.string().nullable(),
  createdAt: z.string(),
});

export type TransactionDTO = z.infer<typeof TransactionDTO>;

export const TransactionsResponse = z.object({
  transactions: z.array(TransactionDTO),
});

export type TransactionsResponse = z.infer<typeof TransactionsResponse>;
