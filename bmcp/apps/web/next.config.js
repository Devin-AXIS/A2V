/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        appDir: true,
    },
    // 允许服务器端请求到本地服务
    async rewrites() {
        return [];
    },
    // 配置运行时环境
    env: {
        NEXT_PUBLIC_BMCP_COMPILER: process.env.NEXT_PUBLIC_BMCP_COMPILER || 'http://127.0.0.1:3006',
        NEXT_PUBLIC_BMCP_REGISTRAR: process.env.NEXT_PUBLIC_BMCP_REGISTRAR || 'http://127.0.0.1:3001',
    },
};

module.exports = nextConfig;


