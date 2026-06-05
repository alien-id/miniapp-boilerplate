"use client";

import { useAlien, useLaunchParams } from "@alien-id/miniapps-react";
import { Card, CardTitle } from "@/components/ui/card";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export function LaunchParamsCard() {
  const { contractVersion } = useAlien();
  // null when running in a regular browser (dev mode).
  const launchParams = useLaunchParams();

  return (
    <Card>
      <CardTitle>Launch Params</CardTitle>
      {launchParams ? (
        <dl className="space-y-3">
          <Row label="Platform" value={launchParams.platform ?? "unknown"} />
          <Row label="Display mode" value={launchParams.displayMode} />
          <Row label="Host app" value={launchParams.hostAppVersion ?? "unknown"} />
          <Row label="Contract" value={contractVersion ?? "unknown"} />
          <Row label="Start param" value={launchParams.startParam ?? "—"} />
        </dl>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No launch params — running outside the Alien app.
        </p>
      )}
    </Card>
  );
}
