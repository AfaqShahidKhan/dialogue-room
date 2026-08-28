import type { NextConfig } from "next";

const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1");

const nextConfig: NextConfig = {
  transpilePackages: ["@dialogue-room/shared"],
  images: {
    remotePatterns: [
      {
        protocol: apiOrigin.protocol === "https:" ? "https" : "http",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
