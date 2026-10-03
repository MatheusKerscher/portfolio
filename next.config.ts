import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // The stylesheet is small (Tailwind) and the site has two pages: inlining it removes the
    // only render-blocking request. Measured in .specs: findings.md of the layout redesign.
    inlineCss: true,
  },
};

export default nextConfig;
