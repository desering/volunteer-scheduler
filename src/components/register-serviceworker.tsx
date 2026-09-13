"use client";

import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported.");
      return;
    }

    async function registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          {
            scope: "/",
            updateViaCache: "none",
          },
        );

        await navigator.serviceWorker.ready;
        console.log("Service worker registered:", registration.scope);
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    }

    void registerServiceWorker();
  }, []);

  return null;
}
