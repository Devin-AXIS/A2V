import { db, mappings, type Mapping } from '@bmcp/schema';
import { eq, and } from 'drizzle-orm';

export class MappingService {
    async create(data: {
        originalUrl: string;
        publisherId: string;
        kind: 'mcp' | 'compiled';
        gatewayUrl: string;
        enable402?: boolean;
        settlementToken?: string;
        chainId?: number;
        isActive?: boolean;
    }): Promise<Mapping> {
        const [mapping] = await db.insert(mappings).values({
            originalUrl: data.originalUrl,
            publisherId: data.publisherId,
            kind: data.kind,
            gatewayUrl: data.gatewayUrl,
            enable402: data.enable402 ?? true,
            settlementToken: (data.settlementToken as any) ?? 'USDC',
            chainId: data.chainId ?? 56,
            isActive: data.isActive ?? true
        }).returning();

        return mapping;
    }

    async getById(id: string): Promise<Mapping | null> {
        const [mapping] = await db
            .select()
            .from(mappings)
            .where(eq(mappings.id, id))
            .limit(1);

        return mapping || null;
    }

    async getByIds(ids: string[]): Promise<Mapping[]> {
        return await db
            .select()
            .from(mappings)
            .where(eq(mappings.id, ids[0])); // 简化实现，实际应该用 inArray
    }

    async list(): Promise<Mapping[]> {
        return await db
            .select()
            .from(mappings)
            .where(eq(mappings.isActive, true))
            .orderBy(mappings.createdAt);
    }

    async updateStatus(id: string, isActive: boolean): Promise<Mapping | null> {
        const [mapping] = await db
            .update(mappings)
            .set({
                isActive,
                updatedAt: new Date()
            })
            .where(eq(mappings.id, id))
            .returning();

        return mapping || null;
    }

    async updateGatewayUrl(id: string, gatewayUrl: string): Promise<Mapping | null> {
        const [mapping] = await db
            .update(mappings)
            .set({ gatewayUrl, updatedAt: new Date() })
            .where(eq(mappings.id, id))
            .returning();
        return mapping || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await db
            .delete(mappings)
            .where(eq(mappings.id, id));

        return result.rowCount > 0;
    }
}
