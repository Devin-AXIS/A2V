// 条件导入 bundle analyzer，避免生产环境依赖问题
let withBundleAnalyzer = (config) => config

// 检查是否启用分析且包可用
if (process.env.ANALYZE === 'true') {
  try {
    // 使用动态导入避免生产环境依赖问题
    const bundleAnalyzer = await import('@next/bundle-analyzer')
    withBundleAnalyzer = bundleAnalyzer.default({
      enabled: true,
    })
  } catch (error) {
    console.warn('Bundle analyzer not available, using default config')
  }
}

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
    staticPageGenerationTimeout: 1000,
  },
  // SWC 压缩在 Next.js 15 中默认启用，无需显式配置
  // 压缩配置
  compress: true,
  // 优化构建输出
  output: 'standalone',
  // 禁用静态生成，使用动态渲染
  trailingSlash: false,
  // 跳过有问题的页面
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/:locale/p-:id',
        destination: '/:locale/p/:id',
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)