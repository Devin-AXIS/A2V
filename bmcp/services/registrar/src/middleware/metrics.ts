import { Context, Next } from 'hono';
import { MetricsService } from '../services/metrics';
import crypto from 'crypto';

const metricsService = new MetricsService();

export async function metricsMiddleware(c: Context, next: Next) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // 添加请求 ID 到响应头
    c.res.headers.set('x-request-id', requestId);

    await next();

    const duration = Date.now() - startTime;

    // 记录请求指标
    console.log(`[${c.req.method}] ${c.req.url} - ${c.res.status} - ${duration}ms - ${requestId}`);

    // 如果是代理请求，记录到数据库
    if (c.req.url.includes('/proxy/')) {
        // 这里可以记录代理请求的指标
        // 实际实现应该从上下文中获取更多信息
    }
}
