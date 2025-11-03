import { ethers } from "ethers";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();

/**
 * 使用密钥加密代币数量（与合约中的解密逻辑对应）
 * @param amount 代币数量（字符串，例如 "1000" 或 "1000.5"）
 * @param key 加密密钥（字符串）
 * @returns 加密后的bytes32值
 */
function encryptAmount(amount: string, key: string): string {
  // 解析代币数量（支持小数点，例如 1000.5）
  const amountInWei = ethers.parseEther(amount);
  
  // 将密钥转换为bytes32（使用keccak256哈希）
  const keyBytes32 = ethers.id(key);
  
  // 将代币数量转换为bytes32
  const amountBytes32 = ethers.toBeHex(amountInWei, 32);
  
  // 使用XOR进行加密
  const encrypted = BigInt(amountBytes32) ^ BigInt(keyBytes32);
  
  return ethers.toBeHex(encrypted, 32);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error("用法: ts-node scripts/encrypt-amount.ts <代币数量> [密钥]");
    console.error("示例: ts-node scripts/encrypt-amount.ts 1000");
    console.error("示例: ts-node scripts/encrypt-amount.ts 1000.5 my-secret-key");
    process.exit(1);
  }

  const amount = args[0];
  const key = args[1] || process.env.DECRYPTION_KEY;

  if (!key) {
    console.error("错误: 请提供解密密钥（通过命令行参数或环境变量 DECRYPTION_KEY）");
    process.exit(1);
  }

  try {
    const encryptedValue = encryptAmount(amount, key);
    
    console.log("\n" + "=".repeat(60));
    console.log("📝 加密结果");
    console.log("=".repeat(60));
    console.log("代币数量:", amount);
    console.log("密钥:", key.substring(0, 20) + "...");
    console.log("加密值 (bytes32):", encryptedValue);
    console.log("=".repeat(60));
    console.log("\n✅ 使用此加密值调用合约的 distribute 函数");
  } catch (error: any) {
    console.error("加密失败:", error.message);
    process.exit(1);
  }
}

main();

