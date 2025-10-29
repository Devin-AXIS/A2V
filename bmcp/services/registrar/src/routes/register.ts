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

            // 先创建映射记录（暂存占位 gatewayUrl）
            const created = await mappingService.create({
                originalUrl: data.originalUrl,
                publisherId: data.publisherId,
                kind: data.kind,
                gatewayUrl: 'about:blank',
                enable402: data.enable402 ?? true,
                settlementToken: data.settlementToken ?? 'USDC',
                chainId: data.chainId ?? 56,
                isActive: true
            });

            // 生成并回写网关 URL（使用映射 id）
            const gatewayUrl = generateGatewayUrlById(created.id);
            const mapping = await mappingService.updateGatewayUrl(created.id, gatewayUrl);

            // 创建发布者配置
            await pricingService.createPublisherConfig({
                publisherId: data.publisherId,
                pricingJson: {
                    policy: data.pricing.policy,
                    pricePerCall: data.pricing.pricePerCall,
                    pricePerByte: data.pricing.pricePerByte,
                    pricePerMs: data.pricing.pricePerMs,
                    customPricing: data.pricing.customPricing
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

            const response = {
                mappingId: mapping!.id,
                gatewayUrl: mapping!.gatewayUrl,
                originalUrl: mapping!.originalUrl,
                pricing: data.pricing
            };

            return c.json(response);
        } catch (error) {
            console.error('注册失败:', error);
            return c.json({ error: '注册失败' }, 500);
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
