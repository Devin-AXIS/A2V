import { serve } from '@hono/node-server';
import app from './index';

const port = Number(process.env.PORT || 3001);
serve({ fetch: app.fetch, port });
console.log(`🚀 BMCP Registrar 运行在 http://localhost:${port}`);


