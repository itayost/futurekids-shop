import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The games page is retired for now; keep old links and ads landing
      // somewhere useful. Temporary, so it can come back.
      { source: '/games', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
