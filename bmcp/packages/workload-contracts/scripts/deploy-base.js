const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 开始部署 WorkloadToken 合约到 Base 链...");

    const network = hre.network.name;
    const { chainId } = await hre.ethers.provider.getNetwork();
    console.log(`🌐 目标网络: ${network} (Chain ID: ${chainId})`);

    // 检查 PRIVATE_KEY 是否已加载
    if (!process.env.PRIVATE_KEY) {
        console.warn("⚠️  警告: PRIVATE_KEY 环境变量未设置。确保在 .env 文件中配置了 PRIVATE_KEY。");
    } else {
        const pkPrefix = process.env.PRIVATE_KEY.substring(0, 10);
        console.log(`🔑 PRIVATE_KEY 已加载 (${pkPrefix}...)`);
    }

    // 强制测试网（Base Sepolia: 84532）
    if (chainId !== 84532n && chainId !== 84532) {
        throw new Error(`当前网络 ChainID=${chainId} 非 Base Sepolia(84532)。请使用 --network baseSepolia 或在 hardhat.config.base.js 设为默认网络`);
    }

    // 获取 signer
    const signers = await hre.ethers.getSigners();
    if (signers.length === 0) {
        throw new Error(
            "未找到部署账户。请确保在 .env 文件中配置了 PRIVATE_KEY，或检查 hardhat.config.base.js 中的 accounts 配置。"
        );
    }
    const deployer = signers[0];
    console.log(`👤 部署账户: ${deployer.address}`);

    // 检查余额
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 账户余额: ${hre.ethers.formatEther(balance)} ETH`);
    if (balance === 0n) {
        throw new Error("账户余额为 0，无法支付 gas 费用。请确保账户有足够的 ETH。");
    }

    const WorkloadToken = await hre.ethers.getContractFactory("WorkloadToken", deployer);

    const tokenName = process.env.TOKEN_NAME || "Workload Token";
    const tokenSymbol = process.env.TOKEN_SYMBOL || "WLT";
    const initialSupply = parseInt(process.env.INITIAL_SUPPLY || "1000000", 10);

    console.log(`📝 代币名称: ${tokenName}`);
    console.log(`🔤 代币符号: ${tokenSymbol}`);
    console.log(`💰 初始供应量: ${initialSupply.toLocaleString()} WLT`);

    try {
        const feeData = await hre.ethers.provider.getFeeData();
        if (feeData?.gasPrice) {
            console.log(`⛽ 当前Gas价格: ${hre.ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
        }
    } catch (e) {
        console.log(`⛽ Gas价格查询失败: ${e.message}`);
    }

    console.log("📄 正在部署合约...");
    const workloadToken = await WorkloadToken.deploy(tokenName, tokenSymbol, initialSupply);
    await workloadToken.waitForDeployment();
    const contractAddress = await workloadToken.getAddress();

    console.log("✅ 合约部署成功!");
    console.log(`📍 合约地址: ${contractAddress}`);
    console.log(`🌐 网络: ${network} (Chain ID: ${chainId})`);

    const name = await workloadToken.name();
    const symbol = await workloadToken.symbol();
    const decimals = await workloadToken.decimals();
    const totalSupply = await workloadToken.totalSupply();

    console.log("\n📊 合约信息:");
    console.log(`   名称: ${name}`);
    console.log(`   符号: ${symbol}`);
    console.log(`   精度: ${decimals}`);
    console.log(`   总供应量: ${hre.ethers.formatEther(totalSupply)} ${symbol}`);

    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

    const deployTx = workloadToken.deploymentTransaction();
    const info = {
        network,
        chainId: chainId.toString(),
        contractAddress: contractAddress,
        tokenName: name,
        tokenSymbol: symbol,
        decimals: decimals.toString(),
        totalSupply: totalSupply.toString(),
        deployer: await workloadToken.owner(),
        deploymentTime: new Date().toISOString(),
        transactionHash: deployTx ? deployTx.hash : null,
        explorerUrl: getExplorerUrl(network, contractAddress)
    };
    const file = path.join(deploymentsDir, `${network}-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(info, null, 2));
    console.log(`💾 部署信息已保存到: ${file}`);

    if (process.env.BASESCAN_API_KEY && network !== 'localhost') {
        try {
            console.log("\n🔍 尝试验证合约...");
            await hre.run("verify:verify", {
                address: workloadToken.address,
                constructorArguments: [tokenName, tokenSymbol, initialSupply],
            });
            console.log("✅ 合约验证成功");
        } catch (e) {
            console.log("⚠️  合约验证失败:", e.message);
        }
    }
}

function getExplorerUrl(network, address) {
    const map = {
        baseMainnet: `https://basescan.org/address/${address}`,
        baseSepolia: `https://sepolia.basescan.org/address/${address}`,
        localhost: '本地网络'
    };
    return map[network] || '未知网络';
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌ 部署失败:", e); process.exit(1); });
