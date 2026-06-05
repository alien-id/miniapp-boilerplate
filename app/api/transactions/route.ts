import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { getTransactionsByAlienId } from "@/features/payments/queries";

export const GET = withAuth(async (_request, { auth }) => {
  const rows = await getTransactionsByAlienId(auth.sub);

  const transactions = rows.map((tx) => ({
    id: tx.id,
    txHash: tx.txHash,
    status: tx.status,
    amount: tx.amount,
    token: tx.token,
    invoice: tx.invoice,
    test: tx.test,
    createdAt: tx.createdAt.toISOString(),
  }));

  return NextResponse.json({ transactions });
});
