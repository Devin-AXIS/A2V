import { db, calls, mappings } from '@bmcp/schema';
import crypto from 'crypto';
import { eq, and, gte, sql } from 'drizzle-orm';
import { count, avg } from 'drizzle-orm';

export interface CallMetrics {
    mappingId: string;
    callerId: string;
    durationMs: number;
    reqBytes: number;
    respBytes: number;
    status: number;
    fingerprint?: string;
    errorMessage?: string;
}

export interface Stats {
    totalMappings: number;
    activeMappings: number;
    totalCalls: number;
    callsLast24h: number;
    averageResponseTime: number;
}

export class MetricsService {
    async recordCall(metrics: CallMetrics) {
        const callId = crypto.randomUUID();

        await db.insert(calls).values({
            id: callId,
            mappingId: metrics.mappingId,
            callerId: metrics.callerId,
            durationMs: metrics.durationMs,
            reqBytes: metrics.reqBytes,
            respBytes: metrics.respBytes,
            status: metrics.status,
            fingerprint: metrics.fingerprint,
            errorMessage: metrics.errorMessage
        });

        return callId;
    }

    async getStats(): Promise<Stats> {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 获取映射统计
        const [mappingStats] = await db
            .select({
                total: count(),
                active: sql<number>`count(case when ${mappings.isActive} = true then 1 end)`
            })
            .from(mappings);

        // 获取调用统计
        const [callStats] = await db
            .select({
                total: count(),
                last24h: sql<number>`count(case when ${calls.timestamp} >= ${last24h} then 1 end)`,
                avgResponseTime: avg(calls.durationMs)
            })
            .from(calls);

        return {
            totalMappings: mappingStats.total,
            activeMappings: mappingStats.active,
            totalCalls: callStats.total,
            callsLast24h: callStats.last24h,
            averageResponseTime: callStats.avgResponseTime || 0
        };
    }

    async getDetailedStats() {
        const stats = await this.getStats();

        // 获取按状态分组的调用统计
        const statusStats = await db
            .select({
                status: calls.status,
                count: count()
            })
            .from(calls)
            .groupBy(calls.status);

        // 获取按映射分组的调用统计
        const mappingStats = await db
            .select({
                mappingId: calls.mappingId,
                count: count(),
                avgDuration: avg(calls.durationMs)
            })
            .from(calls)
            .groupBy(calls.mappingId)
            .limit(10);

        // 获取错误统计
        const errorStats = await db
            .select({
                errorMessage: calls.errorMessage,
                count: count()
            })
            .from(calls)
            .where(sql`${calls.errorMessage} is not null`)
            .groupBy(calls.errorMessage)
            .limit(10);

        return {
            ...stats,
            statusBreakdown: statusStats,
            topMappings: mappingStats,
            topErrors: errorStats
        };
    }

    async getCallHistory(mappingId?: string, callerId?: string, limit = 100) {
        let query = db
            .select()
            .from(calls)
            .orderBy(calls.timestamp)
            .limit(limit);

        if (mappingId) {
            query = query.where(eq(calls.mappingId, mappingId));
        }

        if (callerId) {
            query = query.where(eq(calls.callerId, callerId));
        }

        return await query;
    }

    async getMappingMetrics(mappingId: string) {
        const [metrics] = await db
            .select({
                totalCalls: count(),
                successCalls: sql<number>`count(case when ${calls.status} < 400 then 1 end)`,
                errorCalls: sql<number>`count(case when ${calls.status} >= 400 then 1 end)`,
                avgDuration: avg(calls.durationMs),
                totalReqBytes: sql<number>`sum(${calls.reqBytes})`,
                totalRespBytes: sql<number>`sum(${calls.respBytes})`
            })
            .from(calls)
            .where(eq(calls.mappingId, mappingId));

        return metrics;
    }
}
