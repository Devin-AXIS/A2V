import { ethers } from "hardhat";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();

/**
 * 链下签名示例脚本
 * 用于生成可以在链上验证的签名
 */
async function main() {
  const signerPrivateKey = process.env.SIGNER_PRIVATE_KEY;
  if (!signerPrivateKey) {
    throw new Error("请在 .env 文件中设置 SIGNER_PRIVATE_KEY（签名者的私钥）");
  }

  const wallet = new ethers.Wallet(signerPrivateKey);

  // 构建要签名的消息
  const amount = ethers.parseEther("100"); // 100 个代币（根据代币的小数位数调整）
  const recipient = "0x1234567890123456789012345678901234567890"; // 接收者地址
  const nonce = Date.now(); // 使用时间戳作为 nonce，实际应用中应该使用随机数
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期

  console.log("签名参数:");
  console.log("数量:", ethers.formatEther(amount));
  console.log("接收者:", recipient);
  console.log("Nonce:", nonce);
  console.log("过期时间:", new Date(deadline * 1000).toISOString());
  console.log("签名者地址:", wallet.address);
  console.log("\n");

  // 构建 EIP-712 类型哈希
  const domain = {
    name: "TokenDistributor",
    version: "1",
    chainId: 84532, // Base Sepolia
    verifyingContract: "0x...", // 合约地址，需要替换
  };

  const types = {
    DistributionMessage: [
      { name: "amount", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const message = {
    amount: amount,
    recipient: recipient,
    nonce: nonce,
    deadline: deadline,
  };

  // 签名（需要替换合约地址）
  const signature = await wallet.signTypedData(domain, types, message);

  console.log("生成的签名:", signature);
  console.log("\n调用合约时使用以下参数:");
  console.log("amount:", amount.toString());
  console.log("recipient:", recipient);
  console.log("nonce:", nonce.toString());
  console.log("deadline:", deadline.toString());
  console.log("signature:", signature);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

