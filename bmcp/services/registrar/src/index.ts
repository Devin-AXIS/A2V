import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { registerRoutes } from './routes/register';
import { proxyRoutes } from './routes/proxy';
import { resolveRoutes } from './routes/resolve';
import { healthRoutes } from './routes/health';
import { publisherRoutes } from './routes/publisher';
import { invoicesRoutes } from './routes/invoices';
import { errorHandler } from './middleware/error';
import { metricsMiddleware } from './middleware/metrics';
import { authMiddleware } from './middleware/auth';
import { billingMiddleware } from './middleware/billing';

const app = new Hono();

// 中间件
app.use('*', cors());
app.use('*', logger());
app.use('*', errorHandler);
app.use('*', metricsMiddleware);

// 路由
app.route('/api/register', registerRoutes);
app.route('/api/resolve', resolveRoutes);
app.route('/api/publisher', publisherRoutes);
app.route('/api/invoices', invoicesRoutes);
app.route('/proxy', proxyRoutes);
app.route('/health', healthRoutes);

// 404 处理
app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
});

// 启动服务器
const port = process.env.PORT || 3001;
console.log(`🚀 BMCP Registrar 服务启动在端口 ${port}`);

export default {
    port,
    fetch: app.fetch,
};
