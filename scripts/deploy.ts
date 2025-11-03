import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 加载环境变量
dotenv.config();

async function main() {
  console.log("开始部署 TokenDistributor 合约到 Base Sepolia 测试网...\n");

  // 从环境变量获取配置
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("请在 .env 文件中设置 DEPLOYER_PRIVATE_KEY");
  }

  const tokenAddress = process.env.TOKEN_ADDRESS || "";
  const signerAddress = process.env.SIGNER_ADDRESS;
  if (!signerAddress) {
    throw new Error("请在 .env 文件中设置 SIGNER_ADDRESS（用于验证签名的地址）");
  }

  // 设置网络配置
  // Base Sepolia 测试网 RPC
  const baseSepoliaRpc = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.JsonRpcProvider(baseSepoliaRpc);

  // 创建钱包
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("部署者地址:", wallet.address);

  // 检查余额
  const balance = await provider.getBalance(wallet.address);
  console.log("余额:", ethers.formatEther(balance), "ETH");
  if (balance === 0n) {
    throw new Error("账户余额不足，请先充值一些 ETH 到测试网");
  }

  // 如果未提供代币地址，先部署一个测试用的 ERC20 代币
  let finalTokenAddress = tokenAddress;
  if (!tokenAddress) {
    console.log("\n未提供 TOKEN_ADDRESS，正在部署测试 ERC20 代币...");
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy(
      "Test Token",
      "TEST",
      ethers.parseEther("1000000") // 100万代币
    );
    await testToken.waitForDeployment();
    finalTokenAddress = await testToken.getAddress();
    console.log("测试代币已部署到:", finalTokenAddress);
  }

  // 部署 TokenDistributor 合约
  console.log("\n正在部署 TokenDistributor 合约...");
  console.log("代币地址:", finalTokenAddress);
  console.log("签名者地址:", signerAddress);

  const TokenDistributor = await ethers.getContractFactory("TokenDistributor");
  const tokenDistributor = await TokenDistributor.deploy(
    finalTokenAddress,
    signerAddress
  );

  await tokenDistributor.waitForDeployment();
  const contractAddress = await tokenDistributor.getAddress();

  console.log("\n✅ 合约部署成功!");
  console.log("合约地址:", contractAddress);
  console.log("网络: Base Sepolia 测试网");
  console.log("区块浏览器: https://sepolia.basescan.org/address/" + contractAddress);

  // 保存部署信息
  const deploymentInfo = {
    network: "base-sepolia",
    contractAddress: contractAddress,
    tokenAddress: finalTokenAddress,
    signerAddress: signerAddress,
    deployer: wallet.address,
    deploymentTime: new Date().toISOString(),
    txHash: tokenDistributor.deploymentTransaction()?.hash || "",
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `base-sepolia-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n部署信息已保存到:", deploymentFile);

  // 如果部署了测试代币，需要将一些代币转入分发合约
  if (!tokenAddress) {
    console.log("\n正在向 TokenDistributor 合约转入测试代币...");
    const TestToken = await ethers.getContractAt("TestToken", finalTokenAddress);
    const transferTx = await TestToken.transfer(
      contractAddress,
      ethers.parseEther("100000") // 10万代币
    );
    await transferTx.wait();
    console.log("✅ 已转入 100,000 TEST 代币到分发合约");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

