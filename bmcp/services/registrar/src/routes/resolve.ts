import { Hono } from 'hono';
import { MappingService } from '../services/mapping';

const app = new Hono();
const mappingService = new MappingService();

// 解析 BMCP 地址到原始地址
app.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const mapping = await mappingService.getById(id);

        if (!mapping) {
            return c.json({ error: '映射不存在' }, 404);
        }

        return c.json({
            originalUrl: mapping.originalUrl,
            gatewayUrl: mapping.gatewayUrl,
            kind: mapping.kind,
            isActive: mapping.isActive
        });
    } catch (error) {
        console.error('解析映射失败:', error);
        return c.json({ error: '解析映射失败' }, 500);
    }
});

// 批量解析
app.post('/batch', async (c) => {
    try {
        const { ids } = await c.req.json();

        if (!Array.isArray(ids)) {
            return c.json({ error: 'ids 必须是数组' }, 400);
        }

        const mappings = await mappingService.getByIds(ids);

        return c.json({ mappings });
    } catch (error) {
        console.error('批量解析失败:', error);
        return c.json({ error: '批量解析失败' }, 500);
    }
});

export { app as resolveRoutes };
