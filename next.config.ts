import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // 💥 this tells Vercel to skip ESLint errors during build
  },
};

export default nextConfig;
