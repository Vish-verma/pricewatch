import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pricewatch/schemas", "@pricewatch/db"],
};

export default nextConfig;