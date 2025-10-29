const hre = require("hardhat");

async function main() {
    console.log("🚀 开始部署 WorkloadToken 合约...");

    // 获取合约工厂
    const WorkloadToken = await hre.ethers.getContractFactory("WorkloadToken");

    // 部署参数
    const tokenName = "Workload Token";
    const tokenSymbol = "WLT";
    const initialSupply = 1000000; // 100万代币

    console.log(`📝 代币名称: ${tokenName}`);
    console.log(`🔤 代币符号: ${tokenSymbol}`);
    console.log(`💰 初始供应量: ${initialSupply.toLocaleString()} WLT`);

    // 部署合约
    const workloadToken = await WorkloadToken.deploy(
        tokenName,
        tokenSymbol,
        initialSupply
    );

    await workloadToken.deployed();

    console.log("✅ WorkloadToken 合约部署成功!");
    console.log(`📍 合约地址: ${workloadToken.address}`);
    console.log(`🔗 网络: ${hre.network.name}`);
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

    // 保存部署信息
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: workloadToken.address,
        tokenName: name,
        tokenSymbol: symbol,
        decimals: decimals.toString(),
        totalSupply: totalSupply.toString(),
        deployer: await workloadToken.owner(),
        deploymentTime: new Date().toISOString(),
        transactionHash: workloadToken.deployTransaction.hash,
        gasUsed: workloadToken.deployTransaction.gasLimit.toString()
    };

    const fs = require('fs');
    const path = require('path');

    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log(`💾 部署信息已保存到: ${deploymentFile}`);

    // 如果是测试网络，等待确认
    if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
        console.log("\n⏳ 等待区块确认...");
        await workloadToken.deployTransaction.wait(6);
        console.log("✅ 合约已确认!");
    }

    console.log("\n🎉 部署完成! 现在可以使用以下地址与合约交互:");
    console.log(`   Contract Address: ${workloadToken.address}`);
    console.log(`   Owner: ${await workloadToken.owner()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });
