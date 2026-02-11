"use client";

import { useEffect } from "react";

export const Eruda = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("eruda").then((eruda) => {
        if (!window.document.getElementById("eruda")) {
          eruda.default.init();
        }
      });
    }
  }, []);

  return null;
};
