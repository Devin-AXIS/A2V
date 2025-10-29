import { Hono } from 'hono';
import SwaggerParser from '@apidevtools/swagger-parser';
import axios from 'axios';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 解析 OpenAPI 并返回精选端点与占位 BMCP 地址
app.post('/api/compile-openapi', async (c) => {
    try {
        const body = await c.req.json();
        const { openapiUrl, expose } = body as { openapiUrl: string; expose?: string[] };
        if (!openapiUrl) return c.json({ error: 'openapiUrl 必填' }, 400);

        // 下载并解析 OpenAPI
        const { data } = await axios.get(openapiUrl);
        const api = await SwaggerParser.validate(data);

        // 选择性暴露端点（默认只暴露 GET/health 类端点占位）
        const paths: Record<string, any> = (api as any).paths || {};
        const selected = Object.entries(paths)
            .filter(([p, cfg]) => {
                if (Array.isArray(expose) && expose.length > 0) return expose.includes(p);
                return /health|status|info/i.test(p) || /get/i.test(Object.keys(cfg as any).join(','));
            })
            .slice(0, 8)
            .map(([p, cfg]) => ({ path: p, methods: Object.keys(cfg as any) }));

        // 占位生成 MCP Server + 注册（后续接入容器/无服务器与 registrar）
        const mappingId = (globalThis as any).crypto?.randomUUID?.() || '00000000-0000-0000-0000-000000000000';
        const gatewayBase = process.env.GATEWAY_BASE || 'http://localhost:3001';
        const gatewayUrl = `${gatewayBase}/proxy/${mappingId}`;

        return c.json({
            ok: true,
            mappingId,
            gatewayUrl,
            selectedEndpoints: selected,
        });
    } catch (e: any) {
        return c.json({ error: e?.message || '编译失败' }, 500);
    }
});

export default { fetch: app.fetch };
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
const port = process.env.PORT || 3002;
console.log(`🚀 BMCP API-Compiler 服务启动在端口 ${port}`);

export default {
    port,
    fetch: app.fetch,
};
