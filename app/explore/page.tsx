import { LaunchParamsCard } from "@/features/sdk-showcase/components/launch-params-card";
import { CapabilitiesCard } from "@/features/sdk-showcase/components/capabilities-card";
import { HapticsCard } from "@/features/sdk-showcase/components/haptics-card";
import { ClipboardCard } from "@/features/sdk-showcase/components/clipboard-card";
import { HostActionsCard } from "@/features/sdk-showcase/components/host-actions-card";

export default function ExplorePage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Explore
        </h1>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          A live playground for the Alien SDK — launch params, capability
          checks, haptics, clipboard, and host actions.
        </p>
      </div>

      <LaunchParamsCard />
      <CapabilitiesCard />
      <HapticsCard />
      <ClipboardCard />
      <HostActionsCard />
    </>
  );
}
