/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during build
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
}

module.exports = nextConfig 