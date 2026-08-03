import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "framer-motion",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.choutuppal.in" },
      { protocol: "https", hostname: "*.r2.dev text/html" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "media.choutuppal.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
};

export default nextConfig;
