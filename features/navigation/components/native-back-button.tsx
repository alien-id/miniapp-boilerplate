"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBackButton } from "@alien-id/miniapps-react";

/**
 * Wires the host app's native back button to in-app navigation: visible on
 * every route except home, navigating back to home when pressed. The SDK
 * hides the button automatically on unmount.
 *
 * Renders nothing — mount once in the root layout.
 */
export function NativeBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { show, hide, callable } = useBackButton(() => router.push("/"));

  useEffect(() => {
    if (!callable) return;
    if (pathname === "/") {
      hide();
    } else {
      show();
    }
  }, [pathname, callable, show, hide]);

  return null;
}
