"use client";

import { useEffect } from "react";

export function Eruda() {
  useEffect(() => {
    let destroyed = false;
    import("eruda")
      .then((eruda) => {
        if (destroyed) return;
        eruda.default.init();
      })
      .catch((err) => console.error("Failed to load eruda:", err));
    return () => {
      destroyed = true;
      import("eruda")
        .then((eruda) => eruda.default.destroy())
        .catch(() => {});
    };
  }, []);

  return null;
}
