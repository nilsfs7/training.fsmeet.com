import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/stats", destination: "/statistics", permanent: false }];
  },
};

export default nextConfig;
