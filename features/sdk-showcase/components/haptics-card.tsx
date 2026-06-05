"use client";

import { useHaptic } from "@alien-id/miniapps-react";
import type { HapticImpactStyle, HapticNotificationType } from "@alien-id/miniapps-contract";
import { Card, CardTitle } from "@/components/ui/card";

const IMPACT_STYLES: HapticImpactStyle[] = ["light", "medium", "heavy", "soft", "rigid"];
const NOTIFICATION_TYPES: HapticNotificationType[] = ["success", "warning", "error"];

function DemoButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors active:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-800"
    >
      {label}
    </button>
  );
}

export function HapticsCard() {
  const { impactOccurred, notificationOccurred, selectionChanged, callable } = useHaptic();

  return (
    <Card>
      <CardTitle>Haptics</CardTitle>
      {!callable && (
        <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
          Not callable on this host — buttons are disabled.
        </p>
      )}
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs text-zinc-400 dark:text-zinc-500">Impact</p>
          <div className="flex flex-wrap gap-1.5">
            {IMPACT_STYLES.map((style) => (
              <DemoButton
                key={style}
                label={style}
                onClick={() => impactOccurred(style)}
                disabled={!callable}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-zinc-400 dark:text-zinc-500">Notification</p>
          <div className="flex flex-wrap gap-1.5">
            {NOTIFICATION_TYPES.map((type) => (
              <DemoButton
                key={type}
                label={type}
                onClick={() => notificationOccurred(type)}
                disabled={!callable}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-zinc-400 dark:text-zinc-500">Selection</p>
          <DemoButton label="selection changed" onClick={selectionChanged} disabled={!callable} />
        </div>
      </div>
    </Card>
  );
}
