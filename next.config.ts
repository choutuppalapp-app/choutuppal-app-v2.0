import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const r2PublicDomain = (process.env.R2_PUBLIC_BASE_URL || "")
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "")
  .trim();

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "sharp",
    "bcryptjs",
    "@aws-sdk/client-s3",
    "pdf-parse",
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "motion",
      "date-fns",
      "sonner",
      "clsx",
      "tailwind-merge",
    ],
  },
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75, 80],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      ...(r2PublicDomain
        ? [
            {
              protocol: "https" as const,
              hostname: r2PublicDomain,
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "media.choutuppal.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.choutuppal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "choutuppal.in",
          },
        ],
        destination: "https://www.choutuppal.in/:path*",
        permanent: false,
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
