import { Context, Next } from 'hono';
import { BillingService } from '../services/billing';

const billingService = new BillingService();

export async function billingMiddleware(c: Context, next: Next) {
    // 检查是否需要计费
    const path = c.req.url;
    const method = c.req.method;

    // 跳过非代理请求
    if (!path.includes('/proxy/')) {
        await next();
        return;
    }

    // 检查是否有支付票据
    const paymentToken = c.req.header('x-payment-token');
    if (paymentToken) {
        // 验证支付票据
        const isValid = await billingService.verifyPaymentToken(paymentToken);
        if (!isValid) {
            return c.json({ error: 'Invalid payment token' }, 401);
        }
    }

    await next();
}
