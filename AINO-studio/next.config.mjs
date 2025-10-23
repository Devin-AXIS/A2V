/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 固定端口配置
  env: {
    PORT: '3006',
    NEXT_PUBLIC_API_URL: 'http://47.94.52.142:3007',
  },
}

export default nextConfig
