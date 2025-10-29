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
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },
        testnet: {
            url: process.env.TESTNET_RPC_URL || "https://goerli.infura.io/v3/YOUR_PROJECT_ID",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 5
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 1
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD"
    }
};
