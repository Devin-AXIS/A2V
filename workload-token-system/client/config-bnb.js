// BNB链配置
const BNB_CONFIG = {
    // BSC测试网配置
    bscTestnet: {
        name: 'BSC Testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        chainId: 97,
        symbol: 'tBNB',
        blockExplorer: 'https://testnet.bscscan.com',
        gasPrice: 20000000000, // 20 gwei
        gasLimit: 5000000
    },

    // BSC主网配置
    bscMainnet: {
        name: 'BSC Mainnet',
        rpcUrl: 'https://bsc-dataseed1.binance.org/',
        chainId: 56,
        symbol: 'BNB',
        blockExplorer: 'https://bscscan.com',
        gasPrice: 5000000000, // 5 gwei
        gasLimit: 5000000
    }
};

// 默认配置
const DEFAULT_CONFIG = {
    mcpServerUrl: 'http://localhost:3001',
    network: 'bscTestnet', // 默认使用BSC测试网
    ...BNB_CONFIG.bscTestnet
};

module.exports = {
    BNB_CONFIG,
    DEFAULT_CONFIG
};
