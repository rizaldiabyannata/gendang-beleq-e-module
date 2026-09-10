import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The module makes no network calls after hydration — all state is local — so it
  // exports to plain static files. That lets a school host it anywhere, and lets the
  // service worker serve it with no connection at all.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
