/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized for Vercel deployment
  images: {
    unoptimized: false,
  },
  // Strict mode for development
  reactStrictMode: true,
};

export default nextConfig;
