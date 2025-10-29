// Base 链客户端配置
const BASE_CONFIG = {
  baseSepolia: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    chainId: 84532,
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.basescan.org'
  },
  baseMainnet: {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    symbol: 'ETH',
    blockExplorer: 'https://basescan.org'
  }
};

const DEFAULT_CONFIG = {
  mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:3001',
  network: 'baseSepolia',
  ...BASE_CONFIG.baseSepolia
};

module.exports = { BASE_CONFIG, DEFAULT_CONFIG };
