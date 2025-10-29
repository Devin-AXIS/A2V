import { Hono } from 'hono';

const healthRoutes = new Hono();

healthRoutes.get('/', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

export { healthRoutes };
