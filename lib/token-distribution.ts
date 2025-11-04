import { ethers } from 'ethers';

/**
 * 根据工具返回内容计算代币数量
 * @param result 工具返回的结果
 * @returns 代币数量（字符串格式，例如 "100" 或 "100.5"）
 */
export function calculateTokenAmount(result: any): string {
    if (!result) {
        return '0';
    }

    // 计算返回内容的大小
    const resultString = JSON.stringify(result);
    const contentLength = resultString.length;

    // 如果有 content 字段，也计算它的长度
    let totalLength = contentLength;
    if (result.content) {
        const contentString = typeof result.content === 'string'
            ? result.content
            : JSON.stringify(result.content);
        totalLength += contentString.length;
    }

    console.log(`  [计算详情] 内容长度: ${totalLength} 字符`);

    // 根据内容大小计算代币数量
    // 基础奖励：每个字符 0.01 代币（提高奖励，确保有足够的代币）
    // 最小 10 代币，最大根据内容长度动态计算
    const baseReward = 10; // 最小奖励提高到 10 代币
    const perCharReward = 0.01; // 每字符奖励提高到 0.01
    const calculatedAmount = baseReward + (totalLength * perCharReward);

    // 限制最大代币数量（例如最大 10000 代币）
    const maxAmount = 10000;
    const finalAmount = Math.min(calculatedAmount, maxAmount);

    console.log(`  [计算详情] 基础奖励: ${baseReward}`);
    console.log(`  [计算详情] 内容奖励: ${(totalLength * perCharReward).toFixed(2)}`);
    console.log(`  [计算详情] 总计: ${calculatedAmount.toFixed(2)}`);
    console.log(`  [计算详情] 最终数量: ${finalAmount.toFixed(2)}`);

    // 保留2位小数
    return finalAmount.toFixed(2);
}

/**
 * 生成价值哈希
 * @param amount 代币数量（字符串）
 * @param walletAddress 钱包地址
 * @param timestamp 时间戳（可选，默认使用当前时间）
 * @returns bytes32 格式的哈希值
 */
export function generateValueHash(
    amount: string,
    walletAddress: string,
    timestamp?: number
): string {
    const ts = timestamp || Math.floor(Date.now() / 1000);
    const amountInWei = ethers.parseEther(amount);

    // 使用 keccak256 对 amount、walletAddress 和 timestamp 进行哈希
    const hash = ethers.solidityPackedKeccak256(
        ['uint256', 'address', 'uint256'],
        [amountInWei, walletAddress, ts]
    );

    return hash;
}

/**
 * 授权并分发代币
 * @param contractAddress 合约地址
 * @param walletAddress 接收代币的钱包地址
 * @param amount 代币数量（字符串格式）
 * @param valueHash 价值哈希
 * @param privateKey 合约所有者的私钥（用于授权）
 * @param rpcUrl RPC URL
 * @returns 交易哈希
 */
export async function authorizeAndDistributeTokens(
    contractAddress: string,
    walletAddress: string,
    amount: string,
    valueHash: string,
    privateKey: string,
    rpcUrl: string
): Promise<{ authorizeTxHash: string; distributeTxHash: string }> {
    console.log('\n========== [Token Distribution] 开始分发流程 ==========');
    console.log(`[步骤 1] 初始化参数:`);
    console.log(`  - 合约地址: ${contractAddress}`);
    console.log(`  - 接收钱包: ${walletAddress}`);
    console.log(`  - 代币数量: ${amount}`);
    console.log(`  - 价值哈希: ${valueHash}`);
    console.log(`  - RPC URL: ${rpcUrl}`);
    console.log(`  - 私钥长度: ${privateKey.length} 字符`);

    try {
        // 创建 Provider
        console.log(`\n[步骤 2] 创建 Provider 连接到网络...`);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        console.log(`  ✅ 网络连接成功`);
        console.log(`  - 链ID: ${network.chainId}`);
        console.log(`  - 网络名称: ${network.name}`);

        // 创建钱包
        console.log(`\n[步骤 3] 创建钱包实例...`);
        const owner = new ethers.Wallet(privateKey, provider);
        console.log(`  ✅ 钱包创建成功`);
        console.log(`  - 所有者地址: ${owner.address}`);

        // 检查余额
        console.log(`\n[步骤 4] 检查所有者账户余额...`);
        const ownerBalance = await provider.getBalance(owner.address);
        const ownerBalanceEther = ethers.formatEther(ownerBalance);
        console.log(`  - 余额: ${ownerBalanceEther} ETH`);
        if (ownerBalance === 0n) {
            throw new Error('所有者账户余额为 0，无法支付 Gas 费用');
        }

        // 加载合约
        console.log(`\n[步骤 5] 加载合约...`);
        const contractABI = [
            'function authorizeAmount(bytes32 valueHash, uint256 amount) external',
            'function distributeTokens(bytes32 valueHash, address recipient) external',
            'function getAuthorizedAmount(bytes32 valueHash) external view returns (uint256)',
            'function isValueHashUsed(bytes32 valueHash) external view returns (bool)',
        ];

        const contract = new ethers.Contract(contractAddress, contractABI, owner);
        console.log(`  ✅ 合约加载成功`);
        console.log(`  - 合约地址: ${contract.target}`);

        // 检查价值哈希是否已使用
        console.log(`\n[步骤 6] 检查价值哈希状态...`);
        const isUsed = await contract.isValueHashUsed(valueHash);
        console.log(`  - 价值哈希已使用: ${isUsed}`);
        if (isUsed) {
            throw new Error('价值哈希已被使用，无法重复使用');
        }

        // 转换代币数量为 wei
        console.log(`\n[步骤 7] 转换代币数量...`);
        const amountInWei = ethers.parseEther(amount);
        console.log(`  - 原始数量: ${amount} 代币`);
        console.log(`  - 转换后 (wei): ${amountInWei.toString()}`);
        console.log(`  - 检查数量范围: ${amountInWei} >= 1 且 <= 1000000 * 10^18`);

        // 检查数量是否符合合约要求
        const MIN_AMOUNT = 1n;
        const MAX_AMOUNT = BigInt(1000000) * BigInt(10 ** 18);
        if (amountInWei < MIN_AMOUNT || amountInWei > MAX_AMOUNT) {
            throw new Error(`代币数量 ${amountInWei} 超出合约限制范围 [${MIN_AMOUNT}, ${MAX_AMOUNT}]`);
        }

        // 1. 授权金额
        console.log(`\n[步骤 8] 开始授权金额...`);
        console.log(`  - 调用方法: authorizeAmount`);
        console.log(`  - 参数 valueHash: ${valueHash}`);
        console.log(`  - 参数 amount: ${amountInWei.toString()}`);

        // 先检查合约所有者是否是当前钱包
        console.log(`  - 检查合约所有者...`);
        const ownerABI = ['function owner() external view returns (address)'];
        const ownerContract = new ethers.Contract(contractAddress, ownerABI, provider);
        const contractOwner = await ownerContract.owner();
        console.log(`  - 合约所有者: ${contractOwner}`);
        console.log(`  - 当前钱包: ${owner.address}`);
        if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
            throw new Error(`当前钱包不是合约所有者！合约所有者: ${contractOwner}, 当前钱包: ${owner.address}`);
        }

        // 检查当前授权金额（授权前）
        console.log(`  - 检查授权前金额...`);
        const authorizedAmountBefore = await contract.getAuthorizedAmount(valueHash);
        console.log(`  - 授权前金额: ${authorizedAmountBefore.toString()} wei (${ethers.formatEther(authorizedAmountBefore)} 代币)`);

        // 估算 Gas
        try {
            const gasEstimate = await contract.authorizeAmount.estimateGas(valueHash, amountInWei);
            console.log(`  - 估算 Gas: ${gasEstimate.toString()}`);
        } catch (gasError: any) {
            console.error(`  ❌ Gas 估算失败: ${gasError.message}`);
            if (gasError.reason) {
                console.error(`  - 原因: ${gasError.reason}`);
            }
            throw new Error(`Gas 估算失败，交易可能无法执行: ${gasError.message}`);
        }

        const authorizeTx = await contract.authorizeAmount(valueHash, amountInWei);
        console.log(`  ✅ 授权交易已发送`);
        console.log(`  - 交易哈希: ${authorizeTx.hash}`);
        console.log(`  - 等待交易确认...`);

        let authorizeReceipt;
        try {
            authorizeReceipt = await authorizeTx.wait();
            console.log(`  ✅ 授权交易已确认`);
            console.log(`  - 区块号: ${authorizeReceipt.blockNumber}`);
            console.log(`  - Gas 使用量: ${authorizeReceipt.gasUsed.toString()}`);
            console.log(`  - 交易状态: ${authorizeReceipt.status === 1 ? '成功' : '失败'}`);

            if (authorizeReceipt.status !== 1) {
                throw new Error('授权交易失败');
            }
        } catch (waitError: any) {
            console.error(`  ❌ 等待交易确认失败: ${waitError.message}`);
            if (waitError.reason) {
                console.error(`  - 原因: ${waitError.reason}`);
            }
            if (waitError.receipt) {
                console.error(`  - 交易回执状态: ${waitError.receipt.status}`);
                console.error(`  - 交易回执: ${JSON.stringify(waitError.receipt, null, 2)}`);
            }
            throw waitError;
        }

        // 检查交易日志，确认授权事件
        console.log(`  - 检查授权事件...`);
        if (authorizeReceipt.logs && authorizeReceipt.logs.length > 0) {
            console.log(`  - 找到 ${authorizeReceipt.logs.length} 个日志事件`);
            const eventTopic = ethers.id('AmountAuthorized(bytes32,uint256)');
            const authorizeLogs = authorizeReceipt.logs.filter((log: any) =>
                log.topics && log.topics[0] === eventTopic
            );
            if (authorizeLogs.length > 0) {
                console.log(`  ✅ 找到 AmountAuthorized 事件`);
                const fullABI = [
                    ...contractABI,
                    'event AmountAuthorized(bytes32 indexed valueHash, uint256 amount)',
                ];
                const iface = new ethers.Interface(fullABI);
                try {
                    const parsedLog = iface.parseLog(authorizeLogs[0]);
                    if (parsedLog) {
                        console.log(`  - 事件 valueHash: ${parsedLog.args[0]}`);
                        console.log(`  - 事件 amount: ${parsedLog.args[1].toString()} wei (${ethers.formatEther(parsedLog.args[1])} 代币)`);
                    }
                } catch (parseErr: any) {
                    console.log(`  ⚠️  无法解析事件: ${parseErr.message}`);
                }
            } else {
                console.error(`  ❌ 未找到 AmountAuthorized 事件！`);
                console.error(`  - 这意味着 authorizeAmount 函数可能没有正确执行`);
                console.error(`  - 可能原因：onlyOwner 限制导致交易被 revert，但 ethers.js 没有正确检测到`);

                // 如果没找到事件，检查所有者权限
                try {
                    const checkOwnerABI = ['function owner() external view returns (address)'];
                    const checkOwnerContract = new ethers.Contract(contractAddress, checkOwnerABI, provider);
                    const actualOwner = await checkOwnerContract.owner();
                    if (actualOwner.toLowerCase() !== owner.address.toLowerCase()) {
                        throw new Error(`❌ 当前账户不是合约所有者！合约所有者: ${actualOwner}, 当前账户: ${owner.address}。请确保 DEPLOYER_PRIVATE_KEY 是合约所有者的私钥。`);
                    }
                } catch (checkErr: any) {
                    console.error(`  - 所有者检查失败: ${checkErr.message}`);
                }

                throw new Error(`授权交易未产生 AmountAuthorized 事件，授权可能失败。请检查交易 ${authorizeTx.hash} 的执行结果，确认当前账户是否为合约所有者。`);
            }
        } else {
            console.error(`  ❌ 交易日志为空，无法确认授权是否成功！`);
        }

        // 等待一个区块，确保状态更新
        console.log(`  - 等待状态更新（3秒）...`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 验证授权是否成功（多次重试）
        console.log(`\n[步骤 9] 验证授权结果...`);
        let authorizedAmount = 0n;
        let retryCount = 0;
        const maxRetries = 5;

        while (retryCount < maxRetries) {
            authorizedAmount = await contract.getAuthorizedAmount(valueHash);
            console.log(`  - 查询尝试 ${retryCount + 1}/${maxRetries}: ${authorizedAmount.toString()} wei (${ethers.formatEther(authorizedAmount)} 代币)`);

            if (authorizedAmount.toString() === amountInWei.toString()) {
                console.log(`  ✅ 授权金额验证通过`);
                break;
            }

            if (retryCount < maxRetries - 1) {
                console.log(`  - 金额不匹配，等待状态更新（1秒）...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            retryCount++;
        }

        console.log(`  - 最终的授权金额: ${authorizedAmount.toString()} wei`);
        console.log(`  - 转换为代币: ${ethers.formatEther(authorizedAmount)} 代币`);
        console.log(`  - 期望金额: ${amountInWei.toString()} wei (${ethers.formatEther(amountInWei)} 代币)`);

        if (authorizedAmount.toString() === '0') {
            console.error(`  ❌ 授权金额为 0，授权失败！`);

            // 检查合约所有者
            console.error(`  - 检查合约所有者权限...`);
            try {
                const ownerABI = ['function owner() external view returns (address)'];
                const ownerContract = new ethers.Contract(contractAddress, ownerABI, provider);
                const contractOwner = await ownerContract.owner();
                console.error(`  - 合约所有者地址: ${contractOwner}`);
                console.error(`  - 当前调用者地址: ${owner.address}`);
                if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
                    throw new Error(`❌ 当前账户不是合约所有者！合约所有者: ${contractOwner}, 当前账户: ${owner.address}。请使用合约所有者的私钥（DEPLOYER_PRIVATE_KEY）`);
                } else {
                    console.error(`  ✅ 账户是合约所有者`);
                }
            } catch (ownerErr: any) {
                console.error(`  - 检查所有者失败: ${ownerErr.message}`);
            }

            console.error(`  - 可能的原因:`);
            console.error(`    1. 当前账户不是合约所有者（onlyOwner 修饰符限制）`);
            console.error(`    2. 交易执行失败（虽然状态为成功）`);
            console.error(`    3. 合约逻辑问题`);
            console.error(`    4. 代币数量超出合约限制`);
            console.error(`  - 授权交易哈希: ${authorizeTx.hash}`);
            throw new Error(`授权金额为 0，授权失败。请检查交易 ${authorizeTx.hash} 的执行结果。可能的原因是当前账户不是合约所有者。`);
        }

        if (authorizedAmount.toString() !== amountInWei.toString()) {
            // 检查是否是所有者问题
            try {
                const ownerABI = ['function owner() external view returns (address)'];
                const ownerContract = new ethers.Contract(contractAddress, ownerABI, provider);
                const contractOwner = await ownerContract.owner();
                console.error(`  - 合约所有者: ${contractOwner}`);
                console.error(`  - 当前调用者: ${owner.address}`);
                if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
                    throw new Error(`当前账户不是合约所有者！合约所有者: ${contractOwner}, 当前账户: ${owner.address}。请使用合约所有者的私钥（DEPLOYER_PRIVATE_KEY）`);
                }
            } catch (ownerErr: any) {
                // 忽略检查错误，继续抛出原始错误
            }

            throw new Error(`授权金额不匹配: 期望 ${amountInWei}, 实际 ${authorizedAmount}`);
        }
        console.log(`  ✅ 授权验证通过`);

        // 检查接收者钱包的当前余额
        console.log(`\n[步骤 10] 检查接收者钱包当前余额...`);
        let balanceBefore = 0n;
        try {
            // 尝试获取代币余额（如果合约支持 balanceOf）
            const tokenABI = ['function balanceOf(address account) external view returns (uint256)'];
            const tokenContract = new ethers.Contract(contractAddress, tokenABI, provider);
            balanceBefore = await tokenContract.balanceOf(walletAddress);
            console.log(`  - 当前代币余额: ${ethers.formatEther(balanceBefore)} 代币`);
        } catch (err) {
            console.log(`  ⚠️  无法获取代币余额（可能合约未实现 balanceOf）`);
        }

        // 2. 分发代币
        console.log(`\n[步骤 11] 开始分发代币...`);
        console.log(`  - 调用方法: distributeTokens`);
        console.log(`  - 参数 valueHash: ${valueHash}`);
        console.log(`  - 参数 recipient: ${walletAddress}`);

        const distributeTx = await contract.distributeTokens(valueHash, walletAddress);
        console.log(`  ✅ 分发交易已发送`);
        console.log(`  - 交易哈希: ${distributeTx.hash}`);
        console.log(`  - 等待交易确认...`);

        const distributeReceipt = await distributeTx.wait();
        console.log(`  ✅ 分发交易已确认`);
        console.log(`  - 区块号: ${distributeReceipt.blockNumber}`);
        console.log(`  - Gas 使用量: ${distributeReceipt.gasUsed.toString()}`);
        console.log(`  - 交易状态: ${distributeReceipt.status === 1 ? '成功' : '失败'}`);

        if (distributeReceipt.status !== 1) {
            throw new Error('分发交易失败');
        }

        // 检查日志事件
        console.log(`\n[步骤 12] 检查交易事件...`);
        if (distributeReceipt.logs && distributeReceipt.logs.length > 0) {
            console.log(`  - 找到 ${distributeReceipt.logs.length} 个日志事件`);

            // 尝试解析 TokensDistributed 事件
            const eventTopic = ethers.id('TokensDistributed(address,bytes32,uint256)');
            const distributeLogs = distributeReceipt.logs.filter((log: any) =>
                log.topics && log.topics[0] === eventTopic
            );

            if (distributeLogs.length > 0) {
                console.log(`  ✅ 找到 TokensDistributed 事件`);
                const log = distributeLogs[0];
                // 使用完整 ABI 包含事件定义
                const fullABI = [
                    ...contractABI,
                    'event TokensDistributed(address indexed recipient, bytes32 indexed valueHash, uint256 amount)',
                ];
                const iface = new ethers.Interface(fullABI);
                try {
                    const parsedLog = iface.parseLog(log);
                    if (parsedLog) {
                        console.log(`  - 事件名称: ${parsedLog.name}`);
                        console.log(`  - 接收者: ${parsedLog.args[0]}`);
                        console.log(`  - 价值哈希: ${parsedLog.args[1]}`);
                        console.log(`  - 代币数量: ${parsedLog.args[2].toString()} wei (${ethers.formatEther(parsedLog.args[2])} 代币)`);
                    }
                } catch (parseErr: any) {
                    console.log(`  ⚠️  无法解析事件: ${parseErr.message}`);
                    console.log(`  - 事件数据: ${JSON.stringify(log)}`);
                }
            } else {
                console.log(`  ⚠️  未找到 TokensDistributed 事件`);
                console.log(`  - 事件主题: ${eventTopic}`);
                if (distributeReceipt.logs.length > 0) {
                    console.log(`  - 第一个日志主题: ${distributeReceipt.logs[0].topics?.[0] || '无'}`);
                }
            }
        } else {
            console.log(`  ⚠️  交易日志为空`);
        }

        // 检查最终余额
        console.log(`\n[步骤 13] 检查分发后的余额...`);
        try {
            const tokenABI = ['function balanceOf(address account) external view returns (uint256)'];
            const tokenContract = new ethers.Contract(contractAddress, tokenABI, provider);
            const balanceAfter = await tokenContract.balanceOf(walletAddress);
            console.log(`  - 分发后代币余额: ${ethers.formatEther(balanceAfter)} 代币`);
            if (balanceBefore > 0n) {
                const balanceDiff = balanceAfter - balanceBefore;
                if (balanceDiff > 0n) {
                    console.log(`  ✅ 代币余额已增加: ${ethers.formatEther(balanceDiff)} 代币`);
                    console.log(`  - 期望增加: ${ethers.formatEther(amountInWei)} 代币`);
                    if (balanceDiff.toString() !== amountInWei.toString()) {
                        console.log(`  ⚠️  警告: 余额增加量 (${ethers.formatEther(balanceDiff)}) 与期望值 (${ethers.formatEther(amountInWei)}) 不匹配`);
                    } else {
                        console.log(`  ✅ 余额增加量完全匹配期望值`);
                    }
                } else {
                    console.log(`  ⚠️  代币余额未检测到变化`);
                }
            } else {
                console.log(`  - 无法对比（之前未能获取初始余额）`);
            }
        } catch (err: any) {
            console.log(`  ⚠️  无法验证最终余额: ${err.message}`);
        }

        console.log(`\n========== [Token Distribution] 分发流程完成 ==========\n`);

        return {
            authorizeTxHash: authorizeTx.hash,
            distributeTxHash: distributeTx.hash,
        };
    } catch (error: any) {
        console.error(`\n❌ [Token Distribution] 错误详情:`);
        console.error(`  - 错误类型: ${error.constructor.name}`);
        console.error(`  - 错误消息: ${error.message}`);
        if (error.code) {
            console.error(`  - 错误代码: ${error.code}`);
        }
        if (error.data) {
            console.error(`  - 错误数据: ${JSON.stringify(error.data)}`);
        }
        if (error.transaction) {
            console.error(`  - 失败交易: ${error.transaction.hash}`);
        }
        if (error.receipt) {
            console.error(`  - 交易回执状态: ${error.receipt.status}`);
        }
        console.error(`\n========== [Token Distribution] 分发流程失败 ==========\n`);
        throw error;
    }
}

