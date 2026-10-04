import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Portuguese is the default language and keeps the URLs without a prefix.
  async rewrites() {
    return [
      { source: "/", destination: "/pt" },
      { source: "/llms.txt", destination: "/pt/llms.txt" },
    ];
  },
  async redirects() {
    return [
      { source: "/pt", destination: "/", permanent: true },
      { source: "/pt/llms.txt", destination: "/llms.txt", permanent: true },
      // The email signature tool was removed; its URL was in the sitemap and in llms.txt.
      { source: "/email-signature", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
