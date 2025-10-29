import { Context, Next } from 'hono';

export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        console.error('请求处理错误:', error);

        const errorResponse = {
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            requestId: c.req.header('x-request-id') || 'unknown'
        };

        return c.json(errorResponse, 500);
    }
}
