import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16.3 + the Vercel build adapter currently conflicts with
  // standalone tracing. Vercel does not consume the standalone bundle;
  // keep it for Docker/self-hosted builds only.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
