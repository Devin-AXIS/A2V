import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 启用图片优化 - 性能优化
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 性能优化配置
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    webpackBuildWorker: false,
  },
  // SWC 压缩在 Next.js 15 中默认启用，无需显式配置
  // 压缩配置
  compress: true,
  // 启用静态优化
  trailingSlash: false,
  // 优化构建输出
  output: 'standalone',
}

export default withBundleAnalyzer(nextConfig)
