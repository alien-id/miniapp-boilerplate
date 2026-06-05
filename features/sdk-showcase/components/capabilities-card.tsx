"use client";

import { useAlien } from "@alien-id/miniapps-react";
import { callability } from "@alien-id/miniapps-bridge";
import type { MethodName } from "@alien-id/miniapps-contract";
import { Card, CardTitle } from "@/components/ui/card";

const SHOWCASED_METHODS: MethodName[] = [
  "payment:request",
  "clipboard:read",
  "haptic:impact",
  "host.back.button:toggle",
  "app:close",
  "notifications:permission.request",
];

export function CapabilitiesCard() {
  const { contractVersion } = useAlien();

  return (
    <Card>
      <CardTitle>Method Callability</CardTitle>
      <div className="space-y-2.5">
        {SHOWCASED_METHODS.map((method) => {
          const c = callability(method, { version: contractVersion });
          const label = c.callable
            ? "callable"
            : c.reason === "no-bridge"
              ? "no bridge"
              : `needs v${c.needs}`;

          return (
            <div key={method} className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {method}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                </span>
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    c.callable ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
