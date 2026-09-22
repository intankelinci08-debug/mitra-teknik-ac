import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <--- Tambahkan baris ini
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;