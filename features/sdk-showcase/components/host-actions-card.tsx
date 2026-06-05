"use client";

import { useClose, useNotificationPermission } from "@alien-id/miniapps-react";
import toast from "react-hot-toast";
import { Card, CardTitle } from "@/components/ui/card";

export function HostActionsCard() {
  const { close, callable: closeCallable } = useClose();
  const {
    requestPermission,
    status,
    isLoading,
    callable: notificationsCallable,
  } = useNotificationPermission();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.ok) {
      // 'rate_limited' = the host's prompt budget (3 per rolling 24h) is spent.
      toast(`Notification permission: ${result.status}`);
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Card>
      <CardTitle>Host Actions</CardTitle>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">Push notifications</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {status ? `Status: ${status}` : "Permission not requested yet"}
            </p>
          </div>
          <button
            onClick={handleRequestPermission}
            disabled={!notificationsCallable || isLoading}
            className="shrink-0 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isLoading ? "Asking..." : "Request"}
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">Close miniapp</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Ask the host to close this app
            </p>
          </div>
          <button
            onClick={close}
            disabled={!closeCallable}
            className="shrink-0 rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
          >
            Close
          </button>
        </div>
      </div>
    </Card>
  );
}
