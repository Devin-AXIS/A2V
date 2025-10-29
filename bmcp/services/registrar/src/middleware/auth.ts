import { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
    // 简化实现：从请求头获取调用者 ID
    const callerId = c.req.header('x-caller-id') || 'anonymous';

    // 将调用者 ID 存储到上下文中
    c.set('callerId', callerId);

    // 验证 API Key（如果提供）
    const apiKey = c.req.header('x-api-key');
    if (apiKey) {
        // 这里应该验证 API Key
        // 简化实现：直接通过
        c.set('authenticated', true);
    } else {
        c.set('authenticated', false);
    }

    await next();
}
