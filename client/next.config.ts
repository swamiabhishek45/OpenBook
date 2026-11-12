import type { NextConfig } from "next";
import { getClientEnv } from "./lib/env";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || getClientEnv().apiUrl;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
