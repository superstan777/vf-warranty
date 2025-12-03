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
      {
        protocol: "https",
        hostname: "uonbllmneyxpxzfjqrjg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
