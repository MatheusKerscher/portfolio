import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // The email signature tool was removed; its URL was in the sitemap and in llms.txt.
      { source: "/email-signature", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
