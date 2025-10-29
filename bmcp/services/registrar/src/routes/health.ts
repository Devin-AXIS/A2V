import { Hono } from 'hono';
import { MappingService } from '../services/mapping';
import { MetricsService } from '../services/metrics';

const app = new Hono();
const mappingService = new MappingService();
const metricsService = new MetricsService();

// 健康检查
app.get('/', async (c) => {
    try {
        const stats = await metricsService.getStats();

        return c.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            stats: {
                totalMappings: stats.totalMappings,
                activeMappings: stats.activeMappings,
                totalCalls: stats.totalCalls,
                callsLast24h: stats.callsLast24h,
                averageResponseTime: stats.averageResponseTime
            }
        });
    } catch (error) {
        console.error('健康检查失败:', error);
        return c.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        }, 500);
    }
});

// 详细状态
app.get('/detailed', async (c) => {
    try {
        const stats = await metricsService.getDetailedStats();

        return c.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            stats
        });
    } catch (error) {
        console.error('详细状态检查失败:', error);
        return c.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        }, 500);
    }
});

export { app as healthRoutes };
