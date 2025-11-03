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

    // 生成或使用配置的密钥
    let decryptionKey;
    if (process.env.DECRYPTION_KEY) {
        // 使用环境变量中的密钥（32字节十六进制字符串，带或不带0x前缀）
        let keyHex = process.env.DECRYPTION_KEY;
        if (!keyHex.startsWith('0x')) {
            keyHex = '0x' + keyHex;
        }
        if (keyHex.length !== 66) { // 0x + 64个字符
            throw new Error('DECRYPTION_KEY 必须是64个字符的十六进制字符串（32字节）');
        }
        decryptionKey = keyHex;
        console.log(`🔐 使用配置的解密密钥: ${keyHex.substring(0, 10)}...`);
    } else {
        // 生成随机密钥（仅用于开发/测试）
        const randomBytes = hre.ethers.randomBytes(32);
        decryptionKey = hre.ethers.hexlify(randomBytes);
        console.log(`⚠️  警告: 未配置 DECRYPTION_KEY，已生成随机密钥（仅用于测试）`);
        console.log(`🔐 生成的解密密钥: ${decryptionKey}`);
        console.log(`⚠️  请保存此密钥并设置 DECRYPTION_KEY 环境变量！`);
    }

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
    let workloadToken;
    let deployTx;
    try {
        workloadToken = await WorkloadToken.deploy(tokenName, tokenSymbol, initialSupply, decryptionKey);
        deployTx = workloadToken.deploymentTransaction();
        if (deployTx) {
            console.log(`🔗 部署交易哈希: ${deployTx.hash}`);
            console.log(`⛽ 预估Gas: ${deployTx.gasLimit?.toString() || 'N/A'}`);
        }
    } catch (error) {
        console.error("❌ 部署交易发送失败:", error.message);
        throw error;
    }

    // 等待部署交易被挖矿（等待至少1个确认）
    console.log("⏳ 等待部署交易确认...");
    try {
        await workloadToken.waitForDeployment();
    } catch (error) {
        console.error("❌ 等待部署失败:", error.message);
        if (deployTx) {
            console.error(`   交易哈希: ${deployTx.hash}`);
            console.error(`   请检查交易状态和Gas费用`);
        }
        throw error;
    }

    const contractAddress = await workloadToken.getAddress();
    console.log(`📍 合约地址: ${contractAddress}`);

    // 如果waitForDeployment没有等待确认，手动等待
    if (deployTx) {
        try {
            console.log("⏳ 等待交易最终确认...");
            const receipt = await deployTx.wait(1); // 等待至少1个确认
            console.log(`✅ 交易已确认 (区块: ${receipt.blockNumber}, Gas使用: ${receipt.gasUsed.toString()})`);
        } catch (error) {
            console.warn("⚠️  等待交易确认时出错，但合约可能已部署:", error.message);
        }
    }

    // 额外等待，确保节点已同步
    console.log("⏳ 等待节点同步...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("✅ 合约部署成功!");
    console.log(`📍 合约地址: ${contractAddress}`);
    console.log(`🌐 网络: ${network} (Chain ID: ${chainId})`);

    // 验证合约是否可以正常调用（添加重试机制）
    console.log("🔍 验证合约功能...");
    let name, symbol, decimals, totalSupply;
    let retries = 3;
    while (retries > 0) {
        try {
            name = await workloadToken.name();
            symbol = await workloadToken.symbol();
            decimals = await workloadToken.decimals();
            totalSupply = await workloadToken.totalSupply();
            break; // 成功则退出循环
        } catch (error) {
            retries--;
            if (retries === 0) {
                console.error("❌ 无法读取合约信息，但合约可能已部署。地址:", contractAddress);
                throw error;
            }
            console.log(`⚠️  读取合约信息失败，${retries}次重试中...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒后重试
        }
    }

    console.log("\n📊 合约信息:");
    console.log(`   名称: ${name}`);
    console.log(`   符号: ${symbol}`);
    console.log(`   精度: ${decimals}`);
    console.log(`   总供应量: ${hre.ethers.formatEther(totalSupply)} ${symbol}`);

    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

    const deployTxHash = deployTx ? deployTx.hash : null;
    const info = {
        network,
        chainId: chainId.toString(),
        contractAddress: contractAddress,
        tokenName: name,
        tokenSymbol: symbol,
        decimals: decimals.toString(),
        totalSupply: totalSupply.toString(),
        deployer: await workloadToken.owner(),
        decryptionKey: decryptionKey, // 保存密钥（请妥善保管！）
        deploymentTime: new Date().toISOString(),
        transactionHash: deployTxHash,
        explorerUrl: getExplorerUrl(network, contractAddress)
    };
    const file = path.join(deploymentsDir, `${network}-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(info, null, 2));
    console.log(`💾 部署信息已保存到: ${file}`);

    if (process.env.BASESCAN_API_KEY && network !== 'localhost') {
        try {
            console.log("\n🔍 尝试验证合约...");
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [tokenName, tokenSymbol, initialSupply, decryptionKey],
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
