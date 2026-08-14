import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:8081";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${BACKEND_URL}/api/auth/:path*`,
      },
      {
        source: "/api/workspaces/:path*",
        destination: `${BACKEND_URL}/api/workspaces/:path*`,
      },
      {
        source: "/api/memory/:path*",
        destination: `${BACKEND_URL}/api/memory/:path*`,
      },
    ];
  },
};

export default nextConfig;
