import { db, publisherConfigs, type PublisherConfig } from '@bmcp/schema';
import { eq } from 'drizzle-orm';

export interface PricingConfig {
    policy: 'flat_per_call' | 'by_bytes' | 'duration_weighted' | 'custom';
    pricePerCall?: number;
    pricePerByte?: number;
    pricePerMs?: number;
    customPricing?: Record<string, any>;
}

export interface SplitsConfig {
    publisher: number;
    platform: number;
    [key: string]: number;
}

export class PricingService {
    async createPublisherConfig(data: {
        publisherId: string;
        pricingJson: PricingConfig;
        splitsJson: SplitsConfig;
        walletAddr: string;
        chainPref: string;
        incentivesJson?: Record<string, any>;
    }): Promise<PublisherConfig> {
        // 检查是否已存在，如果存在则更新，否则创建
        const existing = await this.getPublisherConfig(data.publisherId);
        
        if (existing) {
            // 更新现有配置
            const [config] = await db
                .update(publisherConfigs)
                .set({
                    pricingJson: data.pricingJson,
                    splitsJson: data.splitsJson,
                    walletAddr: data.walletAddr,
                    chainPref: data.chainPref,
                    incentivesJson: data.incentivesJson,
                    updatedAt: new Date()
                })
                .where(eq(publisherConfigs.publisherId, data.publisherId))
                .returning();
            
            return config!;
        } else {
            // 创建新配置
            const [config] = await db.insert(publisherConfigs).values({
                publisherId: data.publisherId,
                pricingJson: data.pricingJson,
                splitsJson: data.splitsJson,
                walletAddr: data.walletAddr,
                chainPref: data.chainPref,
                incentivesJson: data.incentivesJson
            }).returning();

            return config;
        }
    }

    async getPublisherConfig(publisherId: string): Promise<PublisherConfig | null> {
        const [config] = await db
            .select()
            .from(publisherConfigs)
            .where(eq(publisherConfigs.publisherId, publisherId))
            .limit(1);

        return config || null;
    }

    async updatePricing(publisherId: string, pricingJson: PricingConfig): Promise<PublisherConfig | null> {
        const [config] = await db
            .update(publisherConfigs)
            .set({
                pricingJson,
                updatedAt: new Date()
            })
            .where(eq(publisherConfigs.publisherId, publisherId))
            .returning();

        return config || null;
    }

    async updateSplits(publisherId: string, splitsJson: SplitsConfig): Promise<PublisherConfig | null> {
        const [config] = await db
            .update(publisherConfigs)
            .set({
                splitsJson,
                updatedAt: new Date()
            })
            .where(eq(publisherConfigs.publisherId, publisherId))
            .returning();

        return config || null;
    }

    async updateWallet(publisherId: string, walletAddr: string, chainPref: string): Promise<PublisherConfig | null> {
        const [config] = await db
            .update(publisherConfigs)
            .set({
                walletAddr,
                chainPref,
                updatedAt: new Date()
            })
            .where(eq(publisherConfigs.publisherId, publisherId))
            .returning();

        return config || null;
    }

    calculateCost(pricing: PricingConfig, metrics: {
        durationMs: number;
        reqBytes: number;
        respBytes: number;
    }): number {
        let cost = 0;

        switch (pricing.policy) {
            case 'flat_per_call':
                cost = pricing.pricePerCall || 0;
                break;

            case 'by_bytes':
                const totalBytes = metrics.reqBytes + metrics.respBytes;
                cost = (pricing.pricePerByte || 0) * totalBytes;
                break;

            case 'duration_weighted':
                cost = (pricing.pricePerMs || 0) * metrics.durationMs;
                break;

            case 'custom':
                // 自定义计价逻辑
                cost = this.calculateCustomCost(pricing.customPricing || {}, metrics);
                break;
        }

        return Math.max(0, cost);
    }

    private calculateCustomCost(customPricing: Record<string, any>, metrics: {
        durationMs: number;
        reqBytes: number;
        respBytes: number;
    }): number {
        // 简化的自定义计价实现
        // 实际实现应该根据具体的自定义规则来计算
        return 0;
    }
}
