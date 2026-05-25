import type { NextConfig } from "next";
import path from "path";

const root = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: [],
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@core/capabilities": path.join(root, "core/capabilities"),
      "@shared/i18n": path.join(root, "shared/i18n"),
    };
    return config;
  },
};

export default nextConfig;
