import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables standalone output for lean Docker production images
  output: "standalone",

  // Allow images from any hostname when running containerized
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
