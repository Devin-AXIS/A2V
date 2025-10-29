const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署 WorkloadToken 合约到 Base 链...");

  const network = hre.network.name;
  const { chainId } = await hre.ethers.provider.getNetwork();
  console.log(`🌐 目标网络: ${network} (Chain ID: ${chainId})`);

  const WorkloadToken = await hre.ethers.getContractFactory("WorkloadToken");

  const tokenName = process.env.TOKEN_NAME || "Workload Token";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "WLT";
  const initialSupply = parseInt(process.env.INITIAL_SUPPLY || "1000000", 10);

  console.log(`📝 代币名称: ${tokenName}`);
  console.log(`🔤 代币符号: ${tokenSymbol}`);
  console.log(`💰 初始供应量: ${initialSupply.toLocaleString()} WLT`);

  const gasPrice = await hre.ethers.provider.getGasPrice().catch(() => null);
  if (gasPrice) {
    console.log(`⛽ 当前Gas价格: ${hre.ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
  }

  console.log("📄 正在部署合约...");
  const workloadToken = await WorkloadToken.deploy(tokenName, tokenSymbol, initialSupply);
  await workloadToken.deployed();

  console.log("✅ 合约部署成功!");
  console.log(`📍 合约地址: ${workloadToken.address}`);
  console.log(`�� 网络: ${network} (Chain ID: ${chainId})`);

  const name = await workloadToken.name();
  const symbol = await workloadToken.symbol();
  const decimals = await workloadToken.decimals();
  const totalSupply = await workloadToken.totalSupply();

  console.log("\n📊 合约信息:");
  console.log(`   名称: ${name}`);
  console.log(`   符号: ${symbol}`);
  console.log(`   精度: ${decimals}`);
  console.log(`   总供应量: ${hre.ethers.utils.formatEther(totalSupply)} ${symbol}`);

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  const info = {
    network,
    chainId: chainId.toString(),
    contractAddress: workloadToken.address,
    tokenName: name,
    tokenSymbol: symbol,
    decimals: decimals.toString(),
    totalSupply: totalSupply.toString(),
    deployer: await workloadToken.owner(),
    deploymentTime: new Date().toISOString(),
    transactionHash: workloadToken.deployTransaction.hash,
    explorerUrl: getExplorerUrl(network, workloadToken.address)
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
