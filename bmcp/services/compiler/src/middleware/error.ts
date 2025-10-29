import { Context, Next } from 'hono';

export const errorHandler = async (c: Context, next: Next) => {
    try {
        await next();
    } catch (error: any) {
        console.error('Error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
