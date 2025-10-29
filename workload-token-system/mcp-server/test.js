const axios = require('axios');
const { expect } = require('@jest/globals');

const MCP_SERVER_URL = 'http://localhost:3001';

describe('MCP服务器测试', () => {
    beforeAll(async () => {
        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    test('健康检查', async () => {
        const response = await axios.get(`${MCP_SERVER_URL}/health`);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.status).toBe('healthy');
    });

    test('获取工具列表', async () => {
        const response = await axios.get(`${MCP_SERVER_URL}/tools`);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.tools)).toBe(true);
        expect(response.data.tools.length).toBeGreaterThan(0);
    });

    test('调用免费工具 - 数据计算', async () => {
        const response = await axios.post(`${MCP_SERVER_URL}/call-tool`, {
            toolName: 'data-calculation',
            input: { data: [1, 2, 3, 4, 5] }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.taskId).toBeDefined();
        expect(response.data.output).toBeDefined();
        expect(response.data.workProof).toBeDefined();
    });

    test('调用付费工具 - 需要支付', async () => {
        try {
            const response = await axios.post(`${MCP_SERVER_URL}/call-tool`, {
                toolName: 'text-processing',
                input: { text: '测试文本' }
            });

            // 应该返回402状态码
            expect(response.status).toBe(402);
            expect(response.data.paymentRequired).toBeDefined();
            expect(response.data.paymentRequired.amount).toBe(0.1);
        } catch (error) {
            expect(error.response.status).toBe(402);
        }
    });

    test('使用支付信息调用付费工具', async () => {
        const response = await axios.post(`${MCP_SERVER_URL}/call-tool`, {
            toolName: 'text-processing',
            input: { text: '测试文本处理' },
            paymentInfo: {
                transactionHash: '0x1234567890abcdef',
                amount: 0.1,
                currency: 'WLT'
            }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.output).toBeDefined();
        expect(response.data.output.characterCount).toBeGreaterThan(0);
    });

    test('获取工作量记录', async () => {
        // 先执行一个任务
        const taskResponse = await axios.post(`${MCP_SERVER_URL}/call-tool`, {
            toolName: 'data-calculation',
            input: { data: [10, 20, 30] }
        });

        const taskId = taskResponse.data.taskId;

        // 获取工作量记录
        const response = await axios.get(`${MCP_SERVER_URL}/workload/${taskId}`);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.workload.taskId).toBe(taskId);
    });

    test('获取所有工作量记录', async () => {
        const response = await axios.get(`${MCP_SERVER_URL}/workload`);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.workloads)).toBe(true);
    });
});
