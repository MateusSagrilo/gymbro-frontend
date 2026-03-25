import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
