const hre = require("hardhat");

async function main() {
  console.log("🚀 部署 WorkloadToken 到 Base ...");
  const network = hre.network.name;
  const { chainId } = await hre.ethers.provider.getNetwork();
  console.log(`🌐 网络: ${network} (Chain ID: ${chainId})`);

  const WorkloadToken = await hre.ethers.getContractFactory("WorkloadToken");

  const tokenName = process.env.TOKEN_NAME || "Workload Token";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "WLT";
  const initialSupply = parseInt(process.env.INITIAL_SUPPLY || "1000000", 10);

  console.log(`📝 Name=${tokenName} Symbol=${tokenSymbol} Supply=${initialSupply}`);

  const workloadToken = await WorkloadToken.deploy(tokenName, tokenSymbol, initialSupply);
  await workloadToken.deployed();

  console.log("✅ 部署成功:", workloadToken.address);

  if (process.env.BASESCAN_API_KEY && network !== 'localhost') {
    try {
      await hre.run("verify:verify", {
        address: workloadToken.address,
        constructorArguments: [tokenName, tokenSymbol, initialSupply]
      });
      console.log("🔍 验证成功");
    } catch (e) {
      console.log("⚠️ 验证失败:", e.message);
    }
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });


