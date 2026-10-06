import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16.3's Vercel adapter currently conflicts with standalone output:
  // the adapter path skips next-server.js.nft.json while the standalone
  // finalizer still expects it. Vercel does not consume .next/standalone,
  // so keep standalone for Docker/self-hosting and disable it only there.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
