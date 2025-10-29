import { Hono } from 'hono';
import { ProxyService } from '../services/proxy';
import { BillingService } from '../services/billing';
import { MetricsService } from '../services/metrics';
import { authMiddleware } from '../middleware/auth';
import { billingMiddleware } from '../middleware/billing';

const app = new Hono();
const proxyService = new ProxyService();
const billingService = new BillingService();
const metricsService = new MetricsService();

// 代理所有请求到原始 MCP/API
app.all('/:id/*', authMiddleware, billingMiddleware, async (c) => {
    try {
        const mappingId = c.req.param('id');
        const path = c.req.param('*') || '';
        const method = c.req.method;
        const headers = Object.fromEntries(c.req.raw.headers.entries());
        const body = await c.req.text();

        // 获取映射信息
        const mapping = await proxyService.getMapping(mappingId);
        if (!mapping) {
            return c.json({ error: '映射不存在' }, 404);
        }

        if (!mapping.isActive) {
            return c.json({ error: '服务已停用' }, 403);
        }

        // 记录调用开始时间
        const startTime = Date.now();
        const reqBytes = Buffer.byteLength(body, 'utf8');

        // 执行代理请求
        const result = await proxyService.proxyRequest({
            mappingId,
            originalUrl: mapping.originalUrl,
            path,
            method,
            headers,
            body,
            callerId: c.get('callerId') || 'anonymous'
        });

        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const respBytes = Buffer.byteLength(JSON.stringify(result.data), 'utf8');

        // 记录调用指标
        await metricsService.recordCall({
            mappingId,
            callerId: c.get('callerId') || 'anonymous',
            durationMs,
            reqBytes,
            respBytes,
            status: result.status,
            fingerprint: result.fingerprint,
            errorMessage: result.error
        });

        // 计算费用（从发布者配置读取定价策略）
        const cost = await billingService.calculateCost({
            mappingId,
            policy: 'flat_per_call',
            durationMs,
            reqBytes,
            respBytes
        });

        // 检查余额（如果启用 402）
        if (mapping.enable402 && cost > 0) {
            const balance = await billingService.getBalance(c.get('callerId') || 'anonymous');
            if (balance < cost) {
                // 返回 402 支付要求
                const paymentInfo = await billingService.createPaymentRequest({
                    callerId: c.get('callerId') || 'anonymous',
                    amount: cost,
                    currency: mapping.settlementToken || 'USDC',
                    chainId: mapping.chainId || 56,
                    mappingId
                });

                return c.json({
                    error: 'Payment Required',
                    paymentRequired: paymentInfo
                }, 402);
            }
        }

        // 创建收据
        const receipt = await billingService.createReceipt({
            callId: result.callId,
            mappingId,
            amount: cost,
            currency: mapping.settlementToken || 'USDC',
            chainId: mapping.chainId || 56
        });

        // 返回响应，添加收据头
        const response = c.json(result.data, result.status);
        response.headers.set('X-BMCP-Receipt-Id', receipt.id);
        response.headers.set('X-BMCP-Cost', cost.toString());

        return response;

    } catch (error) {
        console.error('代理请求失败:', error);
        return c.json({ error: '代理请求失败' }, 500);
    }
});

export { app as proxyRoutes };
