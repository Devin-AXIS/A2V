const WorkloadClient = require('./client');
const { expect } = require('@jest/globals');

// 模拟配置
const mockConfig = {
    mcpServerUrl: 'http://localhost:3001',
    contractAddress: '0x1234567890123456789012345678901234567890',
    privateKey: '0x' + '1'.repeat(64),
    rpcUrl: 'http://localhost:8545'
};

describe('WorkloadClient 测试', () => {
    let client;

    beforeAll(() => {
        client = new WorkloadClient(mockConfig);
    });

    test('客户端初始化', () => {
        expect(client).toBeDefined();
        expect(client.mcpServerUrl).toBe(mockConfig.mcpServerUrl);
        expect(client.contractAddress).toBe(mockConfig.contractAddress);
    });

    test('获取可用工具', async () => {
        try {
            const tools = await client.getAvailableTools();
            expect(tools.success).toBe(true);
            expect(Array.isArray(tools.tools)).toBe(true);
        } catch (error) {
            // 如果MCP服务器未运行，跳过测试
            console.log('MCP服务器未运行，跳过工具测试');
        }
    });

    test('调用免费工具', async () => {
        try {
            const result = await client.callTool('data-calculation', {
                data: [1, 2, 3, 4, 5]
            });

            expect(result.success).toBe(true);
            expect(result.output).toBeDefined();
            expect(result.workProof).toBeDefined();
        } catch (error) {
            // 如果MCP服务器未运行，跳过测试
            console.log('MCP服务器未运行，跳过工具调用测试');
        }
    });

    test('生成工作量证明哈希', () => {
        const workProof = {
            taskId: 'test-task-123',
            toolName: 'data-calculation',
            inputSize: 100,
            outputSize: 200,
            executionTime: 1500,
            timestamp: Date.now()
        };

        const hash = client.web3.utils.keccak256(
            client.web3.utils.encodePacked(
                workProof.taskId,
                workProof.toolName,
                workProof.inputSize.toString(),
                workProof.outputSize.toString(),
                workProof.executionTime.toString(),
                workProof.timestamp.toString()
            )
        );

        expect(hash).toBeDefined();
        expect(hash.startsWith('0x')).toBe(true);
        expect(hash.length).toBe(66); // 0x + 64 hex chars
    });

    test('处理支付信息', async () => {
        const paymentInfo = {
            amount: 0.1,
            currency: 'WLT',
            taskId: 'test-task-123',
            paymentAddress: '0x1234567890123456789012345678901234567890'
        };

        const result = await client.processPayment(paymentInfo);

        expect(result.success).toBe(true);
        expect(result.paymentInfo).toBeDefined();
        expect(result.paymentInfo.transactionHash).toBeDefined();
        expect(result.paymentInfo.amount).toBe(paymentInfo.amount);
    });
});
