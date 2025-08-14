import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
