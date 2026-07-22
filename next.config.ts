import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Reduce memory pressure during development compiles.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "framer-motion",
    ],
  },
  // Disable image optimization memory churn in dev (images served directly).
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
