const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🧪 开始测试 WorkloadToken 合约...\n");

    const network = hre.network.name;
    const { chainId } = await hre.ethers.provider.getNetwork();
    
    // 从部署信息获取合约地址（或从环境变量）
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x83440D40a41DD7B375B5B04949983db1084E347a";
    console.log(`🌐 网络: ${network} (Chain ID: ${chainId})`);
    console.log(`📍 合约地址: ${contractAddress}\n`);

    // 获取 signer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`👤 测试账户: ${deployer.address}`);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 账户余额: ${hre.ethers.formatEther(balance)} ETH\n`);

    // 加载合约
    const WorkloadToken = await hre.ethers.getContractFactory("WorkloadToken", deployer);
    const contract = await WorkloadToken.attach(contractAddress);

    // 生成测试工作量证明
    const taskId = `test-task-${Date.now()}`;
    const toolName = "text-processing";
    const inputSize = 100;
    const outputSize = 200;
    const executionTime = 1500; // ms
    const timestamp = Math.floor(Date.now() / 1000); // 转换为秒

    // 计算工作量证明哈希（与合约中的逻辑一致）
    const proofHash = hre.ethers.solidityPackedKeccak256(
        ["string", "string", "uint256", "uint256", "uint256", "uint256"],
        [taskId, toolName, inputSize, outputSize, executionTime, timestamp]
    );

    console.log("📝 准备提交工作量证明:");
    console.log(`   任务ID: ${taskId}`);
    console.log(`   工具名称: ${toolName}`);
    console.log(`   输入大小: ${inputSize}`);
    console.log(`   输出大小: ${outputSize}`);
    console.log(`   执行时间: ${executionTime}ms`);
    console.log(`   时间戳: ${timestamp}`);
    console.log(`   证明哈希: ${proofHash}\n`);

    // 获取提交前的代币余额
    const balanceBefore = await contract.balanceOf(deployer.address);
    console.log(`💰 提交前代币余额: ${hre.ethers.formatEther(balanceBefore)} WLT`);

    // 获取提交前的工作量统计
    const workloadBefore = await contract.getUserWorkload(deployer.address);
    console.log(`📊 提交前工作量统计:`);
    console.log(`   总任务数: ${workloadBefore.totalTasks.toString()}`);
    console.log(`   累计奖励: ${hre.ethers.formatEther(workloadBefore.totalTokensEarned)} WLT\n`);

    // 提交工作量证明
    console.log("📤 正在提交工作量证明...");
    try {
        const tx = await contract.submitWorkProof(
            taskId,
            toolName,
            inputSize,
            outputSize,
            executionTime,
            timestamp,
            proofHash
        );
        console.log(`   交易哈希: ${tx.hash}`);
        console.log("   ⏳ 等待交易确认...");
        
        const receipt = await tx.wait();
        console.log(`✅ 交易已确认 (区块: ${receipt.blockNumber})\n`);

        // 获取提交后的代币余额
        const balanceAfter = await contract.balanceOf(deployer.address);
        const reward = balanceAfter - balanceBefore;
        console.log(`💰 提交后代币余额: ${hre.ethers.formatEther(balanceAfter)} WLT`);
        console.log(`🎁 获得的奖励: ${hre.ethers.formatEther(reward)} WLT\n`);

        // 获取提交后的工作量统计
        const workloadAfter = await contract.getUserWorkload(deployer.address);
        console.log(`📊 提交后工作量统计:`);
        console.log(`   总任务数: ${workloadAfter.totalTasks.toString()}`);
        console.log(`   累计奖励: ${hre.ethers.formatEther(workloadAfter.totalTokensEarned)} WLT\n`);

        // 验证工作量证明
        const workProof = await contract.getWorkProof(taskId);
        console.log(`📋 工作量证明详情:`);
        console.log(`   任务ID: ${workProof[0]}`);
        console.log(`   工具名称: ${workProof[1]}`);
        console.log(`   输入大小: ${workProof[2].toString()}`);
        console.log(`   输出大小: ${workProof[3].toString()}`);
        console.log(`   执行时间: ${workProof[4].toString()}ms`);
        console.log(`   时间戳: ${workProof[5].toString()}`);
        console.log(`   证明哈希: ${workProof[6]}`);
        console.log(`   已验证: ${workProof[7]}\n`);

        // 检查任务是否已完成
        const isCompleted = await contract.isTaskCompleted(deployer.address, taskId);
        console.log(`✅ 任务完成状态: ${isCompleted}\n`);

        console.log("🎉 测试完成！所有功能正常工作。");
    } catch (error) {
        console.error("❌ 提交失败:", error.message);
        if (error.reason) {
            console.error("   原因:", error.reason);
        }
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

