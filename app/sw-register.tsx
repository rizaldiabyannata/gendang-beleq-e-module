"use client";

import { useEffect } from "react";

// Registers the offline shell in production only. In development the dev server
// rebuilds chunk URLs constantly, so a cached shell would point at chunks that no
// longer exist and the page would render without ever hydrating.
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
