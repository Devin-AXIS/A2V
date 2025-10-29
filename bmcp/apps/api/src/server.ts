import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok' }));

// 占位：后续聚合 services/* 对外暴露统一 API

const port = Number(process.env.PORT || 4000);
serve({ fetch: app.fetch, port });
console.log(`🧩 BFF(API) 运行在 http://localhost:${port}`);


