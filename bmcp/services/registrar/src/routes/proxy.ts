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
        // 保留查询参数
        const fullUrl = c.req.url; // e.g. /proxy/{id}/foo?x=1
        const basePrefix = `/proxy/${mappingId}`;
        const idx = fullUrl.indexOf(basePrefix);
        const suffix = idx >= 0 ? fullUrl.substring(idx + basePrefix.length) : path;
        const pathWithQuery = suffix || '';
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

        // 合并映射配置的自定义 headers
        const mergedHeaders = { ...headers };
        if (mapping.customHeaders && typeof mapping.customHeaders === 'object') {
            Object.assign(mergedHeaders, mapping.customHeaders as Record<string, string>);
        }

        // 如果请求方法未指定或是 GET，且映射配置了默认方法，使用默认方法
        const effectiveMethod = (method === 'GET' || !method) && mapping.defaultMethod 
            ? mapping.defaultMethod 
            : method;

        // 执行代理请求（传递已获取的mapping避免重复查询）
        const result = await proxyService.proxyRequest({
            mappingId,
            originalUrl: mapping.originalUrl,
            path: pathWithQuery,
            method: effectiveMethod,
            headers: mergedHeaders,
            body,
            callerId: c.get('callerId') || 'anonymous',
            mapping // 传递已获取的mapping
        });

        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const respBytes = Buffer.byteLength(JSON.stringify(result.data), 'utf8');

        // 记录调用指标（返回数据库中的 callId）
        const callId = await metricsService.recordCall({
            mappingId,
            callerId: c.get('callerId') || 'anonymous',
            durationMs,
            reqBytes,
            respBytes,
            status: result.status,
            fingerprint: result.fingerprint,
            errorMessage: result.error
        });

        // 如果代理请求失败（500 错误），直接返回错误响应，不创建收据
        if (result.status >= 500 || result.error) {
            return c.json(result.data, result.status);
        }

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

        // 创建收据（使用数据库中实际的 callId）
        const receipt = await billingService.createReceipt({
            callId: callId,
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
