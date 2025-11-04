import { NextRequest, NextResponse } from 'next/server';
import { calculateTokenAmount, generateValueHash, authorizeAndDistributeTokens } from '@/lib/token-distribution';

export async function POST(request: NextRequest) {
    console.log('\n========== [API] /api/distribute-tokens 请求开始 ==========');

    try {
        const { result, walletAddress } = await request.json();

        console.log(`[API 步骤 1] 验证请求参数...`);
        if (!walletAddress) {
            console.error(`  ❌ 缺少钱包地址`);
            return NextResponse.json(
                { success: false, error: '缺少钱包地址' },
                { status: 400 }
            );
        }
        console.log(`  ✅ 钱包地址: ${walletAddress}`);

        if (!result) {
            console.error(`  ❌ 缺少工具返回结果`);
            return NextResponse.json(
                { success: false, error: '缺少工具返回结果' },
                { status: 400 }
            );
        }
        console.log(`  ✅ 工具返回结果存在`);

        // 获取环境变量
        console.log(`\n[API 步骤 2] 读取环境变量...`);
        const contractAddress = process.env.DISTRIBUTE_TOKEN_CONTRACT;
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
        const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || 'https://sepolia.base.org';

        console.log(`  - DISTRIBUTE_TOKEN_CONTRACT: ${contractAddress ? '已配置' : '❌ 未配置'}`);
        console.log(`  - DEPLOYER_PRIVATE_KEY: ${privateKey ? '已配置（长度: ' + privateKey.length + '）' : '❌ 未配置'}`);
        console.log(`  - RPC URL: ${rpcUrl}`);

        if (!contractAddress) {
            console.error(`  ❌ 未配置 DISTRIBUTE_TOKEN_CONTRACT 环境变量`);
            return NextResponse.json(
                { success: false, error: '未配置 DISTRIBUTE_TOKEN_CONTRACT 环境变量' },
                { status: 500 }
            );
        }

        if (!privateKey) {
            console.error(`  ❌ 未配置 DEPLOYER_PRIVATE_KEY 环境变量`);
            return NextResponse.json(
                { success: false, error: '未配置 DEPLOYER_PRIVATE_KEY 环境变量' },
                { status: 500 }
            );
        }

        // 计算代币数量
        console.log(`\n[API 步骤 3] 计算代币数量...`);
        const resultString = JSON.stringify(result);
        console.log(`  - 结果 JSON 长度: ${resultString.length} 字符`);

        const amount = calculateTokenAmount(result);
        console.log(`  ✅ 计算结果: ${amount} 代币`);

        // 生成价值哈希
        console.log(`\n[API 步骤 4] 生成价值哈希...`);
        const valueHash = generateValueHash(amount, walletAddress);
        console.log(`  ✅ 价值哈希: ${valueHash}`);

        // 授权并分发代币
        console.log(`\n[API 步骤 5] 调用合约分发代币...`);
        const txHashes = await authorizeAndDistributeTokens(
            contractAddress,
            walletAddress,
            amount,
            valueHash,
            privateKey,
            rpcUrl
        );

        console.log(`\n========== [API] /api/distribute-tokens 请求成功 ==========\n`);

        return NextResponse.json({
            success: true,
            amount,
            valueHash,
            authorizeTxHash: txHashes.authorizeTxHash,
            distributeTxHash: txHashes.distributeTxHash,
        });
    } catch (error: any) {
        console.error('\n========== [API] /api/distribute-tokens 请求失败 ==========');
        console.error(`错误类型: ${error.constructor.name}`);
        console.error(`错误消息: ${error.message}`);
        if (error.stack) {
            console.error(`错误堆栈:\n${error.stack}`);
        }
        console.error('====================================================\n');

        return NextResponse.json(
            {
                success: false,
                error: '分发代币失败',
                message: error.message,
                details: error.toString(),
            },
            { status: 500 }
        );
    }
}

