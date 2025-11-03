/** @type {import('next').NextConfig} */
const nextConfig = {
  // 如果需要服务器端使用 MCP SDK，可能需要调整配置
  experimental: {
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },
};

module.exports = nextConfig;
