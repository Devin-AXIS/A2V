// 内存存储 - 不使用数据库
type MappingData = {
    id: string;
    originalUrl: string;
    publisherId: string;
    kind: 'mcp' | 'compiled';
    gatewayUrl: string;
    enable402: boolean;
    settlementToken: string;
    chainId: number;
    defaultMethod?: string;
    customHeaders?: Record<string, string> | null;
    mcpEndpoint?: string | null;
    mcpConnectionConfig?: any;
    mcpRequestBody?: any;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
};

// 内存存储 Map
const memoryStore = new Map<string, MappingData>();

export class MappingService {
    async create(data: {
        originalUrl: string;
        publisherId: string;
        kind: 'mcp' | 'compiled';
        gatewayUrl: string;
        enable402?: boolean;
        settlementToken?: string;
        chainId?: number;
        defaultMethod?: string;
        customHeaders?: Record<string, string>;
        mcpEndpoint?: string;
        mcpConnectionConfig?: any;
        mcpRequestBody?: any;
        isActive?: boolean;
    }): Promise<MappingData> {
        // 生成 ID
        const id = crypto.randomUUID();
        const now = new Date();

        // 准备数据
        const mapping: MappingData = {
            id,
            originalUrl: data.originalUrl,
            publisherId: data.publisherId,
            kind: data.kind,
            gatewayUrl: data.gatewayUrl,
            enable402: data.enable402 ?? true,
            settlementToken: data.settlementToken ?? 'USDC',
            chainId: data.chainId ?? 56,
            defaultMethod: data.defaultMethod || 'GET',
            customHeaders: data.customHeaders && Object.keys(data.customHeaders).length > 0
                ? data.customHeaders
                : null,
            mcpEndpoint: data.mcpEndpoint || null,
            mcpConnectionConfig: data.mcpConnectionConfig || null,
            mcpRequestBody: data.mcpRequestBody || null,
            createdAt: now,
            updatedAt: now,
            isActive: data.isActive ?? true
        };

        // 存入内存
        memoryStore.set(id, mapping);

        console.log('内存存储映射记录:', id);

        return mapping;
    }

    async getById(id: string): Promise<MappingData | null> {
        return memoryStore.get(id) || null;
    }

    async getByIds(ids: string[]): Promise<MappingData[]> {
        return ids.map(id => memoryStore.get(id)).filter(Boolean) as MappingData[];
    }

    async list(): Promise<MappingData[]> {
        return Array.from(memoryStore.values())
            .filter(m => m.isActive)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    async updateStatus(id: string, isActive: boolean): Promise<MappingData | null> {
        const mapping = memoryStore.get(id);
        if (!mapping) return null;

        mapping.isActive = isActive;
        mapping.updatedAt = new Date();
        memoryStore.set(id, mapping);

        return mapping;
    }

    async updateGatewayUrl(id: string, gatewayUrl: string): Promise<MappingData | null> {
        const mapping = memoryStore.get(id);
        if (!mapping) return null;

        mapping.gatewayUrl = gatewayUrl;
        mapping.updatedAt = new Date();
        memoryStore.set(id, mapping);

        return mapping;
    }

    async delete(id: string): Promise<boolean> {
        return memoryStore.delete(id);
    }
}
