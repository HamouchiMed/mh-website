import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    // French is the default language; "/" always lands on /fr.
    return [{ source: "/", destination: "/fr", permanent: true }];
  },
};

export default nextConfig;
