const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const axios = require('axios');
const Web3 = require('web3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// 工作量追踪存储
const workloadTracker = new Map();
const taskQueue = new Map();

// 工具定义
const tools = {
    'text-processing': {
        name: 'text-processing',
        description: '处理文本内容，计算字符数、词数等',
        cost: 0.1, // 0.1 代币
        requiresPayment: true
    },
    'image-analysis': {
        name: 'image-analysis',
        description: '分析图片内容，提取特征',
        cost: 0.5, // 0.5 代币
        requiresPayment: true
    },
    'data-calculation': {
        name: 'data-calculation',
        description: '执行数学计算和数据处理',
        cost: 0.0, // 免费
        requiresPayment: false
    },
    'file-conversion': {
        name: 'file-conversion',
        description: '转换文件格式',
        cost: 0.3, // 0.3 代币
        requiresPayment: true
    }
};

// 生成工作量证明
function generateWorkProof(taskId, input, output, executionTime, toolName) {
    const proof = {
        taskId,
        toolName,
        inputSize: JSON.stringify(input).length,
        outputSize: JSON.stringify(output).length,
        executionTime,
        timestamp: Date.now(),
        hash: crypto.createHash('sha256')
            .update(JSON.stringify({
                taskId,
                inputSize: JSON.stringify(input).length,
                outputSize: JSON.stringify(output).length,
                executionTime,
                timestamp: Date.now()
            }))
            .digest('hex')
    };

    return proof;
}

// 记录工作量
function recordWorkload(proof) {
    workloadTracker.set(proof.taskId, {
        ...proof,
        status: 'completed',
        recordedAt: Date.now()
    });

    console.log(`工作量已记录: ${proof.taskId}`, proof);
}

// 获取可用工具列表
app.get('/tools', (req, res) => {
    try {
        const toolList = Object.values(tools).map(tool => ({
            name: tool.name,
            description: tool.description,
            cost: tool.cost,
            requiresPayment: tool.requiresPayment
        }));

        res.json({
            success: true,
            tools: toolList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 调用工具
app.post('/call-tool', async (req, res) => {
    try {
        const { toolName, input, paymentInfo } = req.body;

        if (!toolName || !tools[toolName]) {
            return res.status(400).json({
                success: false,
                error: '无效的工具名称'
            });
        }

        const tool = tools[toolName];
        const taskId = uuidv4();
        const startTime = Date.now();

        // 检查是否需要支付
        if (tool.requiresPayment) {
            if (!paymentInfo || !paymentInfo.transactionHash) {
                return res.status(402).json({
                    success: false,
                    error: '需要支付',
                    paymentRequired: {
                        amount: tool.cost,
                        currency: 'WLT', // Workload Token
                        taskId,
                        paymentAddress: process.env.PAYMENT_ADDRESS || '0x1234567890123456789012345678901234567890',
                        message: `请支付 ${tool.cost} WLT 代币以使用 ${tool.name} 工具`
                    }
                });
            }

            // 验证支付（简化版，实际应该验证区块链交易）
            console.log(`验证支付: ${paymentInfo.transactionHash} for task ${taskId}`);
        }

        // 执行工具
        let output;
        try {
            output = await executeTool(toolName, input);
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: `工具执行失败: ${error.message}`
            });
        }

        const endTime = Date.now();
        const executionTime = endTime - startTime;

        // 生成工作量证明
        const workProof = generateWorkProof(taskId, input, output, executionTime, toolName);

        // 记录工作量
        recordWorkload(workProof);

        res.json({
            success: true,
            taskId,
            output,
            workProof,
            executionTime,
            cost: tool.cost
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 执行具体工具
async function executeTool(toolName, input) {
    switch (toolName) {
        case 'text-processing':
            return await processText(input);
        case 'image-analysis':
            return await analyzeImage(input);
        case 'data-calculation':
            return await calculateData(input);
        case 'file-conversion':
            return await convertFile(input);
        default:
            throw new Error(`未知工具: ${toolName}`);
    }
}

// 文本处理工具
async function processText(input) {
    const { text } = input;
    if (!text) {
        throw new Error('缺少文本输入');
    }

    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return {
        characterCount: text.length,
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
        lineCount: text.split('\n').length,
        processedAt: new Date().toISOString(),
        analysis: {
            averageWordLength: text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length,
            hasNumbers: /\d/.test(text),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(text)
        }
    };
}

// 图像分析工具
async function analyzeImage(input) {
    const { imageUrl, imageData } = input;
    if (!imageUrl && !imageData) {
        throw new Error('缺少图像输入');
    }

    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    return {
        imageSize: imageData ? imageData.length : Math.floor(Math.random() * 1000000),
        format: imageUrl ? imageUrl.split('.').pop() : 'unknown',
        analyzedAt: new Date().toISOString(),
        features: {
            hasFaces: Math.random() > 0.5,
            dominantColors: ['#FF5733', '#33FF57', '#3357FF'],
            brightness: Math.random(),
            contrast: Math.random(),
            estimatedObjects: Math.floor(Math.random() * 10)
        }
    };
}

// 数据计算工具
async function calculateData(input) {
    const { expression, data } = input;

    if (expression) {
        // 简单的数学表达式计算
        try {
            const result = eval(expression.replace(/[^0-9+\-*/().]/g, ''));
            return {
                expression,
                result,
                calculatedAt: new Date().toISOString()
            };
        } catch (error) {
            throw new Error('无效的数学表达式');
        }
    }

    if (data && Array.isArray(data)) {
        // 数组统计
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = sum / data.length;
        const max = Math.max(...data);
        const min = Math.min(...data);

        return {
            statistics: {
                sum,
                average: avg,
                maximum: max,
                minimum: min,
                count: data.length
            },
            calculatedAt: new Date().toISOString()
        };
    }

    throw new Error('缺少计算输入');
}

// 文件转换工具
async function convertFile(input) {
    const { fileData, fromFormat, toFormat } = input;

    if (!fileData || !fromFormat || !toFormat) {
        throw new Error('缺少文件转换参数');
    }

    // 模拟转换时间
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));

    return {
        originalFormat: fromFormat,
        convertedFormat: toFormat,
        originalSize: fileData.length,
        convertedSize: Math.floor(fileData.length * (0.8 + Math.random() * 0.4)),
        convertedAt: new Date().toISOString(),
        conversionQuality: Math.random() > 0.1 ? 'high' : 'medium'
    };
}

// 获取工作量记录
app.get('/workload/:taskId', (req, res) => {
    const { taskId } = req.params;
    const workload = workloadTracker.get(taskId);

    if (!workload) {
        return res.status(404).json({
            success: false,
            error: '未找到工作量记录'
        });
    }

    res.json({
        success: true,
        workload
    });
});

// 获取所有工作量记录
app.get('/workload', (req, res) => {
    const workloads = Array.from(workloadTracker.values());

    res.json({
        success: true,
        total: workloads.length,
        workloads: workloads.sort((a, b) => b.timestamp - a.timestamp)
    });
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        toolsAvailable: Object.keys(tools).length,
        workloadRecords: workloadTracker.size
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        error: '内部服务器错误'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 MCP服务器运行在端口 ${PORT}`);
    console.log(`📊 可用工具: ${Object.keys(tools).length} 个`);
    console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
    console.log(`🛠️  工具列表: http://localhost:${PORT}/tools`);
});

module.exports = app;
