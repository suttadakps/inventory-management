"use client";

import { useEffect } from "react";

/** Registers the static-asset service worker so the app is installable. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability degrades gracefully if registration fails.
      });
    }
  }, []);
  return null;
}
