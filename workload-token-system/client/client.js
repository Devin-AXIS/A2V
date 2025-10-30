const axios = require('axios');
const Web3 = require('web3');
const crypto = require('crypto');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
require('dotenv').config();

class WorkloadClient {
    constructor(config = {}) {
        this.mcpServerUrl = config.mcpServerUrl || 'http://localhost:3001';
        this.contractAddress = config.contractAddress || process.env.CONTRACT_ADDRESS;
        this.privateKey = config.privateKey || process.env.PRIVATE_KEY;
        this.rpcUrl = config.rpcUrl || process.env.RPC_URL || 'http://localhost:8545';

        // 初始化Web3
        this.web3 = new Web3(this.rpcUrl);
        this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
        this.web3.eth.accounts.wallet.add(this.account);

        // 合约ABI (简化版)
        this.contractABI = [
            {
                "inputs": [
                    { "internalType": "string", "name": "taskId", "type": "string" },
                    { "internalType": "string", "name": "toolName", "type": "string" },
                    { "internalType": "uint256", "name": "inputSize", "type": "uint256" },
                    { "internalType": "uint256", "name": "outputSize", "type": "uint256" },
                    { "internalType": "uint256", "name": "executionTime", "type": "uint256" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "bytes32", "name": "proofHash", "type": "bytes32" }
                ],
                "name": "submitWorkProof",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
                "name": "getUserWorkload",
                "outputs": [
                    { "internalType": "uint256", "name": "totalTasks", "type": "uint256" },
                    { "internalType": "uint256", "name": "totalTokensEarned", "type": "uint256" },
                    { "internalType": "uint256", "name": "lastActivity", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "balanceOf",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);

        console.log(chalk.blue('🤖 WorkloadClient 初始化完成'));
        console.log(chalk.gray(`   服务器: ${this.mcpServerUrl}`));
        console.log(chalk.gray(`   合约地址: ${this.contractAddress}`));
        console.log(chalk.gray(`   账户地址: ${this.account.address}`));
    }

    /**
     * 获取可用工具列表
     */
    async getAvailableTools() {
        try {
            const response = await axios.get(`${this.mcpServerUrl}/tools`);
            return response.data;
        } catch (error) {
            console.error(chalk.red('❌ 获取工具列表失败:'), error.message);
            throw error;
        }
    }

    /**
     * 调用工具并处理支付
     */
    async callTool(toolName, input, options = {}) {
        const spinner = ora(`🛠️  调用工具: ${toolName}`).start();

        try {
            // 第一次调用工具
            let response = await this.makeToolCall(toolName, input);

            // 如果需要支付
            if (response.status === 402) {
                spinner.text = '💳 处理支付请求...';

                const paymentInfo = response.data.paymentRequired;
                console.log(chalk.yellow(`\n💰 需要支付: ${paymentInfo.amount} ${paymentInfo.currency}`));
                console.log(chalk.gray(`   任务ID: ${paymentInfo.taskId}`));
                console.log(chalk.gray(`   支付地址: ${paymentInfo.paymentAddress}`));

                // 模拟支付处理
                const paymentResult = await this.processPayment(paymentInfo);

                if (paymentResult.success) {
                    spinner.text = '✅ 支付完成，重新调用工具...';

                    // 使用支付信息重新调用工具
                    response = await this.makeToolCall(toolName, input, {
                        paymentInfo: paymentResult.paymentInfo
                    });
                } else {
                    throw new Error('支付失败');
                }
            }

            if (response.status === 200) {
                const result = response.data;
                spinner.succeed(chalk.green(`✅ 工具调用成功: ${toolName}`));

                // 提交工作量证明到智能合约
                if (result.workProof) {
                    await this.submitWorkProof(result.workProof);
                }

                return result;
            } else {
                throw new Error(`工具调用失败: ${response.data.error}`);
            }

        } catch (error) {
            spinner.fail(chalk.red(`❌ 工具调用失败: ${error.message}`));
            throw error;
        }
    }

    /**
     * 发起工具调用请求
     */
    async makeToolCall(toolName, input, options = {}) {
        try {
            const response = await axios.post(`${this.mcpServerUrl}/call-tool`, {
                toolName,
                input,
                paymentInfo: options.paymentInfo
            });
            return response;
        } catch (error) {
            return error.response;
        }
    }

    /**
     * 处理支付
     */
    async processPayment(paymentInfo) {
        const spinner = ora('💳 处理支付...').start();

        try {
            // 模拟支付过程
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 生成模拟交易哈希
            const transactionHash = '0x' + crypto.randomBytes(32).toString('hex');

            spinner.succeed(chalk.green('✅ 支付成功'));
            console.log(chalk.gray(`   交易哈希: ${transactionHash}`));

            return {
                success: true,
                paymentInfo: {
                    transactionHash,
                    amount: paymentInfo.amount,
                    currency: paymentInfo.currency,
                    taskId: paymentInfo.taskId
                }
            };
        } catch (error) {
            spinner.fail(chalk.red('❌ 支付失败'));
            return { success: false, error: error.message };
        }
    }

    /**
     * 提交工作量证明到智能合约
     */
    async submitWorkProof(workProof) {
        const spinner = ora('📝 提交工作量证明到智能合约...').start();

        try {
            // 生成工作量证明哈希
            const proofHash = this.web3.utils.keccak256(
                this.web3.utils.encodePacked(
                    workProof.taskId,
                    workProof.toolName,
                    workProof.inputSize.toString(),
                    workProof.outputSize.toString(),
                    workProof.executionTime.toString(),
                    workProof.timestamp.toString()
                )
            );

            // 调用智能合约
            const tx = await this.contract.methods.submitWorkProof(
                workProof.taskId,
                workProof.toolName,
                workProof.inputSize,
                workProof.outputSize,
                workProof.executionTime,
                workProof.timestamp,
                proofHash
            ).send({
                from: this.account.address,
                gas: 500000
            });

            spinner.succeed(chalk.green('✅ 工作量证明提交成功'));
            console.log(chalk.gray(`   交易哈希: ${tx.transactionHash}`));
            console.log(chalk.gray(`   Gas 使用: ${tx.gasUsed}`));

            return tx;
        } catch (error) {
            spinner.fail(chalk.red('❌ 工作量证明提交失败'));
            console.error(chalk.red('错误详情:'), error.message);
            throw error;
        }
    }

    /**
     * 获取用户工作量统计
     */
    async getUserWorkload() {
        try {
            const result = await this.contract.methods.getUserWorkload(this.account.address).call();
            return {
                totalTasks: parseInt(result.totalTasks),
                totalTokensEarned: this.web3.utils.fromWei(result.totalTokensEarned, 'ether'),
                lastActivity: new Date(parseInt(result.lastActivity) * 1000)
            };
        } catch (error) {
            console.error(chalk.red('❌ 获取用户工作量失败:'), error.message);
            throw error;
        }
    }

    /**
     * 获取代币余额
     */
    async getTokenBalance() {
        try {
            const balance = await this.contract.methods.balanceOf(this.account.address).call();
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error(chalk.red('❌ 获取代币余额失败:'), error.message);
            throw error;
        }
    }

    /**
     * 显示用户统计信息
     */
    async showUserStats() {
        console.log(chalk.blue('\n📊 用户统计信息'));
        console.log(chalk.gray('━'.repeat(50)));

        try {
            const workload = await this.getUserWorkload();
            const balance = await this.getTokenBalance();

            console.log(chalk.cyan(`👤 账户地址: ${this.account.address}`));
            console.log(chalk.cyan(`💰 代币余额: ${balance} WLT`));
            console.log(chalk.cyan(`📈 完成任务: ${workload.totalTasks} 个`));
            console.log(chalk.cyan(`🎯 累计奖励: ${workload.totalTokensEarned} WLT`));
            console.log(chalk.cyan(`⏰ 最后活动: ${workload.lastActivity.toLocaleString()}`));
        } catch (error) {
            console.error(chalk.red('❌ 无法获取用户统计信息'));
        }
    }

    /**
     * 交互式工具选择
     */
    async selectTool() {
        const tools = await this.getAvailableTools();

        const choices = tools.tools.map(tool => ({
            name: `${tool.name} - ${tool.description} (${tool.cost} WLT)`,
            value: tool.name,
            cost: tool.cost,
            requiresPayment: tool.requiresPayment
        }));

        const { toolName } = await inquirer.prompt([{
            type: 'list',
            name: 'toolName',
            message: '请选择要使用的工具:',
            choices
        }]);

        return toolName;
    }

    /**
     * 获取工具输入
     */
    async getToolInput(toolName) {
        const inputPrompts = {
            'text-processing': [
                {
                    type: 'input',
                    name: 'text',
                    message: '请输入要处理的文本:',
                    validate: input => input.length > 0 || '文本不能为空'
                }
            ],
            'image-analysis': [
                {
                    type: 'input',
                    name: 'imageUrl',
                    message: '请输入图片URL:',
                    validate: input => input.length > 0 || '图片URL不能为空'
                }
            ],
            'data-calculation': [
                {
                    type: 'list',
                    name: 'inputType',
                    message: '选择计算类型:',
                    choices: [
                        { name: '数学表达式', value: 'expression' },
                        { name: '数组统计', value: 'array' }
                    ]
                }
            ],
            'file-conversion': [
                {
                    type: 'input',
                    name: 'fileData',
                    message: '请输入文件数据 (base64):',
                    validate: input => input.length > 0 || '文件数据不能为空'
                },
                {
                    type: 'input',
                    name: 'fromFormat',
                    message: '源格式:',
                    default: 'txt'
                },
                {
                    type: 'input',
                    name: 'toFormat',
                    message: '目标格式:',
                    default: 'pdf'
                }
            ]
        };

        const prompts = inputPrompts[toolName] || [];
        const answers = await inquirer.prompt(prompts);

        // 处理特殊输入类型
        if (toolName === 'data-calculation') {
            if (answers.inputType === 'expression') {
                const { expression } = await inquirer.prompt([{
                    type: 'input',
                    name: 'expression',
                    message: '请输入数学表达式:',
                    validate: input => input.length > 0 || '表达式不能为空'
                }]);
                return { expression };
            } else {
                const { data } = await inquirer.prompt([{
                    type: 'input',
                    name: 'data',
                    message: '请输入数字数组 (用逗号分隔):',
                    validate: input => {
                        const numbers = input.split(',').map(n => parseFloat(n.trim()));
                        return numbers.every(n => !isNaN(n)) || '请输入有效的数字';
                    }
                }]);
                return { data: data.split(',').map(n => parseFloat(n.trim())) };
            }
        }

        return answers;
    }

    /**
     * 运行交互式会话
     */
    async runInteractive() {
        console.log(chalk.blue.bold('\n🚀 欢迎使用 WorkloadToken 客户端!'));
        console.log(chalk.gray('这是一个基于工作量证明的AI代币系统\n'));

        while (true) {
            try {
                // 显示用户统计
                await this.showUserStats();

                // 选择操作
                const { action } = await inquirer.prompt([{
                    type: 'list',
                    name: 'action',
                    message: '请选择操作:',
                    choices: [
                        { name: '🛠️  使用工具', value: 'useTool' },
                        { name: '📊 查看统计', value: 'showStats' },
                        { name: '❌ 退出', value: 'exit' }
                    ]
                }]);

                if (action === 'exit') {
                    console.log(chalk.blue('👋 再见!'));
                    break;
                }

                if (action === 'showStats') {
                    await this.showUserStats();
                    continue;
                }

                if (action === 'useTool') {
                    // 选择工具
                    const toolName = await this.selectTool();

                    // 获取输入
                    const input = await this.getToolInput(toolName);

                    // 调用工具
                    const result = await this.callTool(toolName, input);

                    // 显示结果
                    console.log(chalk.green('\n✅ 任务完成!'));
                    console.log(chalk.gray('━'.repeat(50)));
                    console.log(JSON.stringify(result.output, null, 2));
                    console.log(chalk.gray('━'.repeat(50)));
                    console.log(chalk.cyan(`⏱️  执行时间: ${result.executionTime}ms`));
                    console.log(chalk.cyan(`💰 任务成本: ${result.cost} WLT`));
                }

            } catch (error) {
                console.error(chalk.red('\n❌ 操作失败:'), error.message);
            }

            // 等待用户确认继续
            await inquirer.prompt([{
                type: 'confirm',
                name: 'continue',
                message: '是否继续?',
                default: true
            }]);
        }
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const client = new WorkloadClient();
    client.runInteractive().catch(console.error);
}

module.exports = WorkloadClient;
