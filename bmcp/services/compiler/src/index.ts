import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compileRoutes } from './routes/compile';
import { healthRoutes } from './routes/health';
import { errorHandler } from './middleware/error';

const app = new Hono();

// 中间件
app.use('*', cors());
app.use('*', logger());
app.use('*', errorHandler);

// 路由
app.route('/api/compile', compileRoutes);
app.route('/health', healthRoutes);

// 404 处理
app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
});

// 启动服务器
const port = process.env.PORT || 3006;

// 启动HTTP服务器
if (typeof Bun !== 'undefined') {
    // Bun环境
    Bun.serve({
        port,
        fetch: app.fetch,
    });
    console.log(`🚀 BMCP API-Compiler 服务启动在端口 ${port} (Bun)`);
} else {
    // Node.js环境
    import('@hono/node-server').then(({ serve }) => {
        serve({
            fetch: app.fetch,
            port: Number(port),
        });
        console.log(`🚀 BMCP API-Compiler 服务启动在端口 ${port} (Node.js)`);
    });
}

export default {
    port,
    fetch: app.fetch,
};
