import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 加载环境变量
dotenv.config();

/**
 * 使用密钥加密代币数量（与合约中的解密逻辑对应）
 * @param amount 代币数量（字符串，例如 "1000"）
 * @param key 加密密钥（字符串）
 * @returns 加密后的bytes32值
 */
function encryptAmount(amount: string, key: string): string {
  // 解析代币数量（支持小数点）
  const amountInWei = ethers.parseEther(amount);

  // 将密钥转换为bytes32（使用keccak256哈希，与合约中一致）
  const keyBytes32 = ethers.id(key);

  // 将代币数量转换为bytes32
  const amountBytes32 = ethers.toBeHex(amountInWei, 32);

  // 使用XOR进行加密（与合约中的XOR解密对应）
  const encrypted = BigInt(amountBytes32) ^ BigInt(keyBytes32);

  return ethers.toBeHex(encrypted, 32);
}

async function main() {
  // 检测网络类型
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
  const isMainnet = !rpcUrl.includes("sepolia") && (rpcUrl.includes("mainnet") || process.env.NETWORK === "base");
  const networkName = isMainnet ? "Base 主网" : "Base Sepolia 测试网";

  console.log("=".repeat(70));
  console.log("   EncryptedTokenDistributor 合约部署工具");
  console.log("=".repeat(70));
  console.log(`\n目标网络: ${networkName}\n`);

  // 从环境变量获取配置
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("请在 .env 文件中设置 DEPLOYER_PRIVATE_KEY");
  }

  const tokenAddress = process.env.TOKEN_ADDRESS || "";

  // 解密密钥（如果没有提供，将生成一个随机密钥）
  let decryptionKey: string;
  if (process.env.DECRYPTION_KEY) {
    decryptionKey = process.env.DECRYPTION_KEY;
    console.log("使用环境变量中的解密密钥");
  } else {
    // 生成一个随机密钥（用于演示，实际部署时建议使用强密钥）
    decryptionKey = ethers.randomBytes(32).toString();
    console.log("⚠️  警告: 未在 .env 中设置 DECRYPTION_KEY，已生成随机密钥");
    console.log("生成的解密密钥（请保存）:", decryptionKey);
  }

  // 将字符串密钥转换为bytes32
  const decryptionKeyBytes32 = ethers.id(decryptionKey);

  // 设置网络配置
  // Base Sepolia 测试网 RPC
  const baseSepoliaRpc = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.JsonRpcProvider(baseSepoliaRpc);

  // 创建钱包
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("\n部署者地址:", wallet.address);

  // 检查余额
  const balanceBefore = await provider.getBalance(wallet.address);
  console.log("部署前余额:", ethers.formatEther(balanceBefore), "ETH");
  if (balanceBefore === 0n) {
    throw new Error("账户余额不足，请先充值一些 ETH 到测试网");
  }

  // 如果未提供代币地址，先部署一个测试用的 ERC20 代币
  let finalTokenAddress = tokenAddress;
  let testTokenDeploymentTx = null;
  if (!tokenAddress) {
    console.log("\n未提供 TOKEN_ADDRESS，正在部署测试 ERC20 代币...");
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy(
      "Test Token",
      "TEST",
      ethers.parseEther("1000000") // 100万代币
    );
    testTokenDeploymentTx = testToken.deploymentTransaction();
    const testTokenReceipt = await testToken.waitForDeployment();
    finalTokenAddress = await testToken.getAddress();

    // 获取测试代币部署的详细信息
    const testTokenTxReceipt = await provider.getTransactionReceipt(testTokenReceipt.deploymentTransaction()?.hash || "");
    const testTokenGasUsed = testTokenTxReceipt?.gasUsed || 0n;
    const testTokenGasPrice = testTokenDeploymentTx?.gasPrice || 0n;
    const testTokenGasCost = testTokenGasUsed * testTokenGasPrice;

    console.log("✅ 测试代币已部署");
    console.log("   - 代币地址:", finalTokenAddress);
    console.log("   - 交易哈希:", testTokenReceipt.deploymentTransaction()?.hash);
    console.log("   - Gas 费用:", ethers.formatEther(testTokenGasCost), "ETH");
  }

  // 部署 EncryptedTokenDistributor 合约
  console.log("\n" + "=".repeat(60));
  console.log("正在部署 EncryptedTokenDistributor 合约...");
  console.log("=".repeat(60));
  console.log("代币地址:", finalTokenAddress);
  console.log("解密密钥哈希:", ethers.keccak256(ethers.toUtf8Bytes(decryptionKey)));
  console.log("");

  const EncryptedTokenDistributor = await ethers.getContractFactory("EncryptedTokenDistributor");
  const distributor = await EncryptedTokenDistributor.deploy(
    finalTokenAddress,
    decryptionKeyBytes32
  );

  const deploymentTx = distributor.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error("部署交易不存在");
  }

  console.log("部署交易已发送，等待确认...");
  console.log("交易哈希:", deploymentTx.hash);

  // 等待部署完成
  const deploymentReceipt = await distributor.waitForDeployment();
  const contractAddress = await distributor.getAddress();

  // 获取交易收据以获取详细信息
  const txReceipt = await provider.getTransactionReceipt(deploymentTx.hash);
  if (!txReceipt) {
    throw new Error("无法获取交易收据");
  }

  // 获取 gas 价格（从交易或收据）
  let gasPrice = txReceipt.gasPrice || deploymentTx.gasPrice || 0n;
  if (gasPrice === 0n) {
    const feeData = await provider.getFeeData();
    gasPrice = feeData.gasPrice || 0n;
  }
  const gasUsed = txReceipt.gasUsed;
  const gasLimit = deploymentTx.gasLimit;
  const gasCost = gasUsed * gasPrice;
  const blockNumber = txReceipt.blockNumber;

  // 获取部署后余额
  const balanceAfter = await provider.getBalance(wallet.address);

  // 确定浏览器URL
  const explorerBaseUrl = isMainnet ? "https://basescan.org" : "https://sepolia.basescan.org";

  // 计算费用（使用当前 ETH 价格估算，如果没有则使用默认值）
  const ethPriceUsd = process.env.ETH_PRICE_USD ? parseFloat(process.env.ETH_PRICE_USD) : 2500;
  const gasCostUsd = Number(ethers.formatEther(gasCost)) * ethPriceUsd;

  // 打印详细的部署信息
  console.log("\n" + "=".repeat(70));
  console.log("🎉 合约部署成功！");
  console.log("=".repeat(70));

  console.log("\n" + "─".repeat(70));
  console.log("📋 部署详情");
  console.log("─".repeat(70));
  console.log(`  合约名称     : EncryptedTokenDistributor`);
  console.log(`  合约地址     : ${contractAddress}`);
  console.log(`  网络         : ${networkName}`);
  console.log(`  部署者地址   : ${wallet.address}`);

  console.log("\n" + "─".repeat(70));
  console.log("💰 Gas 费用详情");
  console.log("─".repeat(70));
  console.log(`  Gas Limit    : ${gasLimit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
  console.log(`  Gas Used     : ${gasUsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
  console.log(`  Gas Price    : ${ethers.formatUnits(gasPrice, "gwei")} Gwei`);
  console.log(`  总 Gas 费用  : ${ethers.formatEther(gasCost)} ETH`);
  console.log(`  估算 USD 费用: $${gasCostUsd.toFixed(2)} (按 ETH=$${ethPriceUsd.toFixed(0)} 估算)`);
  const efficiency = ((Number(gasUsed) / Number(gasLimit)) * 100).toFixed(2);
  console.log(`  Gas 使用率   : ${efficiency}%`);

  console.log("\n" + "─".repeat(70));
  console.log("📦 区块信息");
  console.log("─".repeat(70));
  console.log(`  交易哈希     : ${deploymentTx.hash}`);
  console.log(`  区块号       : ${blockNumber.toString()}`);
  console.log(`  交易链接     : ${explorerBaseUrl}/tx/${deploymentTx.hash}`);
  console.log(`  合约链接     : ${explorerBaseUrl}/address/${contractAddress}`);

  console.log("\n" + "─".repeat(70));
  console.log("💵 余额变化");
  console.log("─".repeat(70));
  console.log(`  部署前余额   : ${ethers.formatEther(balanceBefore)} ETH`);
  console.log(`  部署后余额   : ${ethers.formatEther(balanceAfter)} ETH`);
  const actualSpent = balanceBefore - balanceAfter;
  console.log(`  实际消耗     : ${ethers.formatEther(actualSpent)} ETH`);

  // 如果有代币地址，也显示
  console.log("\n" + "─".repeat(70));
  console.log("🔧 合约配置");
  console.log("─".repeat(70));
  console.log(`  代币地址     : ${finalTokenAddress}`);
  console.log(`  解密密钥哈希 : ${ethers.keccak256(ethers.toUtf8Bytes(decryptionKey))}`);

  console.log("\n" + "=".repeat(70));

  // 保存部署信息
  const deploymentInfo = {
    network: networkName,
    contractName: "EncryptedTokenDistributor",
    contractAddress: contractAddress,
    tokenAddress: finalTokenAddress,
    decryptionKeyHash: ethers.keccak256(ethers.toUtf8Bytes(decryptionKey)),
    deployer: wallet.address,
    deploymentTime: new Date().toISOString(),
    txHash: deploymentTx.hash,
    blockNumber: blockNumber.toString(),
    gasInfo: {
      gasLimit: gasLimit.toString(),
      gasUsed: gasUsed.toString(),
      gasPrice: gasPrice.toString(),
      gasPriceGwei: ethers.formatUnits(gasPrice, "gwei"),
      gasCostWei: gasCost.toString(),
      gasCostEth: ethers.formatEther(gasCost),
    },
    balanceInfo: {
      before: ethers.formatEther(balanceBefore),
      after: ethers.formatEther(balanceAfter),
      spent: ethers.formatEther(balanceBefore - balanceAfter),
    },
    explorer: {
      transaction: `${explorerBaseUrl}/tx/${deploymentTx.hash}`,
      contract: `${explorerBaseUrl}/address/${contractAddress}`,
    },
    // 注意：这里不保存实际的解密密钥，只保存哈希值
    // 实际密钥应该安全地存储在 .env 文件中
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkSuffix = isMainnet ? "base" : "base-sepolia";
  const deploymentFile = path.join(deploymentsDir, `encrypted-distributor-${networkSuffix}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 部署信息已保存到:", deploymentFile);

  // 如果部署了测试代币，需要将一些代币转入分发合约
  if (!tokenAddress) {
    console.log("\n" + "=".repeat(60));
    console.log("正在向 EncryptedTokenDistributor 合约转入测试代币...");
    console.log("=".repeat(60));
    const TestToken = await ethers.getContractAt("TestToken", finalTokenAddress);
    const transferAmount = ethers.parseEther("100000"); // 10万代币
    const transferTx = await TestToken.transfer(
      contractAddress,
      transferAmount
    );
    console.log("转账交易哈希:", transferTx.hash);
    const transferReceipt = await transferTx.wait();

    const transferGasUsed = transferReceipt?.gasUsed || 0n;
    const transferGasPrice = transferTx.gasPrice || 0n;
    const transferGasCost = transferGasUsed * transferGasPrice;

    console.log("✅ 代币转账完成");
    console.log("   - 转账数量: 100,000 TEST");
    console.log("   - 接收地址:", contractAddress);
    console.log("   - Gas 费用:", ethers.formatEther(transferGasCost), "ETH");
    console.log("=".repeat(60));
  }

  // 打印使用说明
  console.log("\n" + "=".repeat(60));
  console.log("📝 使用说明:");
  console.log("=".repeat(60));
  console.log("\n1. 加密代币数量示例（使用相同密钥）:");
  console.log(`   密钥: ${decryptionKey}`);
  console.log("   代币数量: 1000");
  console.log(`   加密值: ${encryptAmount("1000", decryptionKey)}`);
  console.log("\n2. 调用 distribute 函数:");
  console.log(`   encryptedValue: [上面生成的加密值]`);
  console.log(`   recipient: [接收地址]`);
  console.log("\n⚠️  重要提醒:");
  console.log("   - 请安全保存解密密钥到 .env 文件（DECRYPTION_KEY）");
  console.log("   - 使用相同的密钥进行加密才能正确解密");
  console.log("   - 每个加密值只能使用一次（防止重放攻击）");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

