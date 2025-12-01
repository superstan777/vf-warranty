import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "group.vattenfall.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
