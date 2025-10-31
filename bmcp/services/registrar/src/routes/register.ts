import { Hono } from 'hono';
// import { zValidator } from '@hono/zod-validator';
import { RegisterRequestSchema, RegisterResponseSchema } from '@bmcp/schema';
import { MappingService } from '../services/mapping';
import { PricingService } from '../services/pricing';
import { generateGatewayUrlById } from '../utils/url';

const app = new Hono();
const mappingService = new MappingService();
const pricingService = new PricingService();

// 注册 MCP/API 为 BMCP
app.post(
    '/',
    async (c) => {
        try {
            const data = await c.req.json();

            // 验证请求数据
            const validated = RegisterRequestSchema.safeParse(data);
            if (!validated.success) {
                return c.json({ 
                    error: '请求数据验证失败', 
                    details: validated.error.errors 
                }, 400);
            }
            const validData = validated.data;

            // 对于 MCP 类型，如果 originalUrl 为空，使用 mcpEndpoint 作为 originalUrl
            let originalUrl = validData.originalUrl;
            if (!originalUrl && validData.kind === 'mcp' && validData.mcpEndpoint) {
                originalUrl = validData.mcpEndpoint;
            }
            if (!originalUrl) {
                return c.json({ error: '必须提供 originalUrl 或 mcpEndpoint' }, 400);
            }

            // 先创建映射记录（暂存占位 gatewayUrl）
            let created;
            try {
                created = await mappingService.create({
                    originalUrl: originalUrl,
                    publisherId: validData.publisherId,
                    kind: validData.kind,
                    gatewayUrl: 'about:blank',
                    enable402: validData.enable402 ?? true,
                    settlementToken: validData.settlementToken ?? 'USDC',
                    chainId: validData.chainId ?? 56,
                    defaultMethod: validData.defaultMethod ?? 'GET',
                    customHeaders: validData.customHeaders,
                    mcpEndpoint: validData.mcpEndpoint,
                    mcpConnectionConfig: validData.mcpConnectionConfig,
                    mcpRequestBody: validData.mcpRequestBody,
                    isActive: true
                });
            } catch (mappingError: any) {
                console.error('创建映射记录时出错:', mappingError);
                throw new Error(`创建映射记录失败: ${mappingError?.message || String(mappingError)}`);
            }

            // 生成并回写网关 URL（使用映射 id）
            const gatewayUrl = generateGatewayUrlById(created.id);
            const mapping = await mappingService.updateGatewayUrl(created.id, gatewayUrl);

            // 创建发布者配置（失败不阻塞注册）
            try {
                await pricingService.createPublisherConfig({
                    publisherId: validData.publisherId,
                    pricingJson: {
                        policy: validData.pricing.policy,
                        pricePerCall: validData.pricing.pricePerCall,
                        pricePerByte: validData.pricing.pricePerByte,
                        pricePerMs: validData.pricing.pricePerMs,
                        customPricing: validData.pricing.customPricing
                    },
                    splitsJson: {
                        publisher: 0.8, // 80% 给发布者
                        platform: 0.2   // 20% 给平台
                    },
                    walletAddr: '', // 需要发布者后续设置
                    chainPref: 'BNB',
                    incentivesJson: {
                        enablePlatformToken: false
                    }
                });
            } catch (e) {
                console.warn('创建发布者配置失败（忽略，不阻塞注册）:', (e as any)?.message || e);
            }

            const response = {
                mappingId: mapping!.id,
                gatewayUrl: mapping!.gatewayUrl,
                originalUrl: mapping!.originalUrl,
                pricing: validData.pricing
            };

            return c.json(response);
        } catch (error: any) {
            console.error('注册失败:', error);
            
            // 提取详细的错误信息
            let errorMessage = error?.message || '未知错误';
            let errorDetails = error;
            
            // 如果是 drizzle/postgres 错误，提取更详细的信息
            if (error?.cause) {
                errorDetails = error.cause;
                errorMessage = error.cause?.message || errorMessage;
            }
            
            // 检查是否是数据库约束错误
            if (errorMessage.includes('violates') || errorMessage.includes('constraint')) {
                errorMessage = '数据库约束错误: ' + errorMessage;
            }
            
            // 检查是否是字段长度限制
            if (errorMessage.includes('value too long') || errorMessage.includes('character varying')) {
                errorMessage = '字段长度超出限制: ' + errorMessage;
            }
            
            return c.json({ 
                error: '注册失败', 
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? {
                    stack: error?.stack,
                    cause: error?.cause,
                    fullError: String(error)
                } : undefined
            }, 500);
        }
    }
);

// 获取映射列表
app.get('/', async (c) => {
    try {
        const mappings = await mappingService.list();
        return c.json({ mappings });
    } catch (error) {
        console.error('获取映射列表失败:', error);
        return c.json({ error: '获取映射列表失败' }, 500);
    }
});

// 获取特定映射
app.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const mapping = await mappingService.getById(id);

        if (!mapping) {
            return c.json({ error: '映射不存在' }, 404);
        }

        return c.json({ mapping });
    } catch (error) {
        console.error('获取映射失败:', error);
        return c.json({ error: '获取映射失败' }, 500);
    }
});

// 更新映射状态
app.patch('/:id/status', async (c) => {
    try {
        const id = c.req.param('id');
        const { isActive } = await c.req.json();

        const mapping = await mappingService.updateStatus(id, isActive);

        if (!mapping) {
            return c.json({ error: '映射不存在' }, 404);
        }

        return c.json({ mapping });
    } catch (error) {
        console.error('更新映射状态失败:', error);
        return c.json({ error: '更新映射状态失败' }, 500);
    }
});

export { app as registerRoutes };
