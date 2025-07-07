import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mtzgnnogqfcwlslweheb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
    ],
  },
  // Ensure Prisma client works in serverless environment
  serverExternalPackages: ["@prisma/client"],
  
  // Add webpack configuration to properly handle Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle @prisma/client for server-side code
      config.externals.push({
        "@prisma/client": "@prisma/client",
      });
    }
    return config;
  },
};

export default nextConfig;