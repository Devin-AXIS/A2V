const WorkloadClient = require('./client');
const chalk = require('chalk');

/**
 * 演示脚本 - 展示工作量代币系统的完整流程
 */
async function runDemo() {
    console.log(chalk.blue.bold('\n🎬 WorkloadToken 系统演示'));
    console.log(chalk.gray('━'.repeat(60)));

    // 初始化客户端
    const client = new WorkloadClient({
        mcpServerUrl: 'http://localhost:3001',
        contractAddress: process.env.CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
        privateKey: process.env.PRIVATE_KEY || '0x' + '1'.repeat(64),
        rpcUrl: process.env.RPC_URL || 'http://localhost:8545'
    });

    try {
        // 1. 显示初始状态
        console.log(chalk.yellow('\n📊 1. 初始状态'));
        await client.showUserStats();

        // 2. 获取可用工具
        console.log(chalk.yellow('\n🛠️  2. 获取可用工具'));
        const tools = await client.getAvailableTools();
        console.log(chalk.gray('可用工具:'));
        tools.tools.forEach(tool => {
            console.log(chalk.gray(`   • ${tool.name}: ${tool.description} (${tool.cost} WLT)`));
        });

        // 3. 演示免费工具 - 数据计算
        console.log(chalk.yellow('\n🧮 3. 使用免费工具 - 数据计算'));
        const calculationResult = await client.callTool('data-calculation', {
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        });
        console.log(chalk.green('计算结果:'));
        console.log(JSON.stringify(calculationResult.output, null, 2));

        // 4. 演示付费工具 - 文本处理
        console.log(chalk.yellow('\n📝 4. 使用付费工具 - 文本处理'));
        const textResult = await client.callTool('text-processing', {
            text: '这是一个用于演示工作量代币系统的文本处理任务。它包含了多个句子，用于测试文本分析功能。'
        });
        console.log(chalk.green('文本处理结果:'));
        console.log(JSON.stringify(textResult.output, null, 2));

        // 5. 演示付费工具 - 图像分析
        console.log(chalk.yellow('\n🖼️  5. 使用付费工具 - 图像分析'));
        const imageResult = await client.callTool('image-analysis', {
            imageUrl: 'https://example.com/demo-image.jpg',
            imageData: 'base64encodedimagedata...'
        });
        console.log(chalk.green('图像分析结果:'));
        console.log(JSON.stringify(imageResult.output, null, 2));

        // 6. 演示文件转换
        console.log(chalk.yellow('\n📄 6. 使用付费工具 - 文件转换'));
        const conversionResult = await client.callTool('file-conversion', {
            fileData: 'This is a sample text file content for conversion demonstration.',
            fromFormat: 'txt',
            toFormat: 'pdf'
        });
        console.log(chalk.green('文件转换结果:'));
        console.log(JSON.stringify(conversionResult.output, null, 2));

        // 7. 显示最终状态
        console.log(chalk.yellow('\n📈 7. 最终状态'));
        await client.showUserStats();

        // 8. 显示工作量记录
        console.log(chalk.yellow('\n📋 8. 工作量记录'));
        try {
            const workloadResponse = await client.web3.eth.net.isListening();
            console.log(chalk.green('✅ 区块链连接正常'));
        } catch (error) {
            console.log(chalk.yellow('⚠️  区块链连接不可用 (演示模式)'));
        }

        console.log(chalk.blue.bold('\n🎉 演示完成!'));
        console.log(chalk.gray('━'.repeat(60)));
        console.log(chalk.gray('这个演示展示了以下功能:'));
        console.log(chalk.gray('• 工具发现和调用'));
        console.log(chalk.gray('• 支付处理 (x402协议)'));
        console.log(chalk.gray('• 工作量证明生成'));
        console.log(chalk.gray('• 智能合约交互'));
        console.log(chalk.gray('• 代币奖励机制'));

    } catch (error) {
        console.error(chalk.red('\n❌ 演示过程中出现错误:'), error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log(chalk.yellow('\n💡 提示: 请确保MCP服务器正在运行'));
            console.log(chalk.gray('   运行: cd mcp-server && npm start'));
        }

        if (error.message.includes('contract')) {
            console.log(chalk.yellow('\n💡 提示: 请确保智能合约已部署'));
            console.log(chalk.gray('   运行: cd smart-contract && npm run deploy:local'));
        }
    }
}

// 运行演示
if (require.main === module) {
    runDemo().catch(console.error);
}

module.exports = runDemo;
