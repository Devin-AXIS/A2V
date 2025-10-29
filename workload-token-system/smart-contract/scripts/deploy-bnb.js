const hre = require("hardhat");

async function main() {
    console.log("🚀 开始部署 WorkloadToken 合约到 BNB链...");

    // 获取网络信息
    const network = hre.network.name;
    const chainId = await hre.ethers.provider.getNetwork().then(n => n.chainId);

    console.log(`🌐 目标网络: ${network} (Chain ID: ${chainId})`);

    // 获取合约工厂
    const WorkloadToken = await hre.ethers.getContractFactory("WorkloadToken");

    // 部署参数
    const tokenName = "Workload Token";
    const tokenSymbol = "WLT";
    const initialSupply = 1000000; // 100万代币

    console.log(`📝 代币名称: ${tokenName}`);
    console.log(`🔤 代币符号: ${tokenSymbol}`);
    console.log(`💰 初始供应量: ${initialSupply.toLocaleString()} WLT`);

    // 估算Gas费用
    const gasPrice = await hre.ethers.provider.getGasPrice();
    console.log(`⛽ 当前Gas价格: ${hre.ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);

    // 部署合约
    console.log("📄 正在部署合约...");
    const workloadToken = await WorkloadToken.deploy(
        tokenName,
        tokenSymbol,
        initialSupply,
        {
            gasPrice: gasPrice,
            gasLimit: 5000000 // BSC gas limit
        }
    );

    console.log("⏳ 等待合约部署确认...");
    await workloadToken.deployed();

    console.log("✅ WorkloadToken 合约部署成功!");
    console.log(`📍 合约地址: ${workloadToken.address}`);
    console.log(`🔗 网络: ${network} (Chain ID: ${chainId})`);
    console.log(`⛽ Gas 使用量: ${workloadToken.deployTransaction.gasLimit.toString()}`);

    // 验证合约信息
    const name = await workloadToken.name();
    const symbol = await workloadToken.symbol();
    const decimals = await workloadToken.decimals();
    const totalSupply = await workloadToken.totalSupply();

    console.log("\n📊 合约信息:");
    console.log(`   名称: ${name}`);
    console.log(`   符号: ${symbol}`);
    console.log(`   精度: ${decimals}`);
    console.log(`   总供应量: ${hre.ethers.utils.formatEther(totalSupply)} ${symbol}`);

    // 计算部署费用
    const deployTx = await hre.ethers.provider.getTransaction(workloadToken.deployTransaction.hash);
    const receipt = await hre.ethers.provider.getTransactionReceipt(workloadToken.deployTransaction.hash);
    const gasUsed = receipt.gasUsed;
    const gasPriceUsed = deployTx.gasPrice;
    const deploymentCost = gasUsed.mul(gasPriceUsed);

    console.log(`\n💰 部署费用:`);
    console.log(`   Gas 使用: ${gasUsed.toString()}`);
    console.log(`   Gas 价格: ${hre.ethers.utils.formatUnits(gasPriceUsed, 'gwei')} gwei`);
    console.log(`   总费用: ${hre.ethers.utils.formatEther(deploymentCost)} BNB`);

    // 保存部署信息
    const deploymentInfo = {
        network: network,
        chainId: chainId.toString(),
        contractAddress: workloadToken.address,
        tokenName: name,
        tokenSymbol: symbol,
        decimals: decimals.toString(),
        totalSupply: totalSupply.toString(),
        deployer: await workloadToken.owner(),
        deploymentTime: new Date().toISOString(),
        transactionHash: workloadToken.deployTransaction.hash,
        gasUsed: gasUsed.toString(),
        gasPrice: gasPriceUsed.toString(),
        deploymentCost: deploymentCost.toString(),
        explorerUrl: getExplorerUrl(network, workloadToken.address)
    };

    const fs = require('fs');
    const path = require('path');

    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${network}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log(`💾 部署信息已保存到: ${deploymentFile}`);

    // 等待确认
    if (network !== "localhost" && network !== "hardhat") {
        console.log("\n⏳ 等待区块确认...");
        await workloadToken.deployTransaction.wait(3); // BSC通常3个确认就足够
        console.log("✅ 合约已确认!");
    }

    console.log("\n🎉 部署完成! 现在可以使用以下信息与合约交互:");
    console.log(`   Contract Address: ${workloadToken.address}`);
    console.log(`   Owner: ${await workloadToken.owner()}`);
    console.log(`   Explorer: ${deploymentInfo.explorerUrl}`);

    // 验证合约（如果配置了BSCScan API）
    if (process.env.BSCSCAN_API_KEY && network !== "localhost") {
        console.log("\n🔍 开始验证合约...");
        try {
            await hre.run("verify:verify", {
                address: workloadToken.address,
                constructorArguments: [tokenName, tokenSymbol, initialSupply],
            });
            console.log("✅ 合约验证成功!");
        } catch (error) {
            console.log("⚠️  合约验证失败:", error.message);
        }
    }
}

// 获取区块链浏览器URL
function getExplorerUrl(network, address) {
    const explorers = {
        bscMainnet: `https://bscscan.com/address/${address}`,
        bscTestnet: `https://testnet.bscscan.com/address/${address}`,
        localhost: `本地网络 - 无浏览器`
    };

    return explorers[network] || `未知网络: ${network}`;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });
