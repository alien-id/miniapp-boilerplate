"use client";

import { useCallback } from "react";
import { useAlien, usePayment } from "@alien-id/miniapps-react";
import { fetchApi } from "@/lib/api/client";
import { CreateInvoiceResponse } from "../dto";

type UseDiamondPurchaseOptions = {
  onPaid?: () => void;
  onCancelled?: () => void;
  onFailed?: () => void;
};

export function useDiamondPurchase({
  onPaid,
  onCancelled,
  onFailed,
}: UseDiamondPurchaseOptions) {
  const { authToken } = useAlien();

  const payment = usePayment({
    onPaid,
    onCancelled,
    onFailed,
  });

  const purchase = useCallback(
    async (productId: string) => {
      if (!authToken) return;

      const data = CreateInvoiceResponse.parse(
        await fetchApi("/api/invoices", authToken, {
          method: "POST",
          body: JSON.stringify({ productId }),
        }),
      );

      await payment.pay({
        recipient: data.recipient,
        amount: data.amount,
        token: data.token,
        network: data.network,
        invoice: data.invoice,
        item: data.item,
        test: data.test,
      });
    },
    [authToken, payment],
  );

  return {
    purchase,
    status: payment.status,
    isLoading: payment.isLoading,
    isPaid: payment.isPaid,
    isCancelled: payment.isCancelled,
    isFailed: payment.isFailed,
    txHash: payment.txHash,
    error: payment.error,
    errorCode: payment.errorCode,
    reset: payment.reset,
    callable: payment.callable,
  };
}
