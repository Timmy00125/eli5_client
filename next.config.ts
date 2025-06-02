import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "standalone",
  eslint: {
    ignoreDuringBuilds: true, // 💥 this tells Vercel to skip ESLint errors during build
  },
};

export default nextConfig;
