require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        // 本地开发网络
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },
        // BSC测试网
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            chainId: 97,
            gasPrice: 20000000000,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            timeout: 60000,
            httpHeaders: {}
        },
        // BSC主网
        bscMainnet: {
            url: "https://bsc-dataseed1.binance.org/",
            chainId: 56,
            gasPrice: 5000000000, // 5 gwei
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            timeout: 60000,
            httpHeaders: {}
        },
        // 其他BSC RPC节点
        bscMainnet2: {
            url: "https://bsc-dataseed2.binance.org/",
            chainId: 56,
            gasPrice: 5000000000,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            timeout: 60000
        },
        bscMainnet3: {
            url: "https://bsc-dataseed3.binance.org/",
            chainId: 56,
            gasPrice: 5000000000,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            timeout: 60000
        }
    },
    etherscan: {
        apiKey: {
            bsc: process.env.BSCSCAN_API_KEY,
            bscTestnet: process.env.BSCSCAN_API_KEY
        }
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
        gasPrice: 5, // BSC gas price in gwei
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    // BSC特定配置
    defaultNetwork: "bscTestnet"
};
