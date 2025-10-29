import { db, calls, meters, receipts, invoices, mappings, type Call, type Meter, type Receipt } from '@bmcp/schema';
import { eq, and, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { PricingService } from './pricing';

export interface CostCalculation {
    mappingId: string;
    policy: string;
    durationMs: number;
    reqBytes: number;
    respBytes: number;
}

export interface PaymentRequest {
    callerId: string;
    amount: number;
    currency: string;
    chainId: number;
    mappingId: string;
}

export interface ReceiptCreation {
    callId: string;
    mappingId: string;
    amount: number;
    currency: string;
    chainId: number;
}

export class BillingService {
    private pricingService = new PricingService();

    async calculateCost(params: CostCalculation): Promise<number> {
        // 获取发布者配置
        const mapping = await db.select().from(mappings).where(eq(mappings.id, params.mappingId)).limit(1);
        if (!mapping[0]) return 0;

        const config = await this.pricingService.getPublisherConfig(mapping[0].publisherId);
        if (!config) return 0;

        return this.pricingService.calculateCost(config.pricingJson, {
            durationMs: params.durationMs,
            reqBytes: params.reqBytes,
            respBytes: params.respBytes
        });
    }

    async getBalance(callerId: string): Promise<number> {
        // 简化实现：从数据库查询余额
        // 实际实现应该查询链上余额或缓存
        const unpaidInvoices = await db
            .select()
            .from(invoices)
            .where(and(
                eq(invoices.callerId, callerId),
                eq(invoices.status, 'pending')
            ));

        // 计算总欠款
        const totalDebt = unpaidInvoices.reduce((sum, invoice) => {
            return sum + parseFloat(invoice.amount);
        }, 0);

        // 简化：假设有固定余额
        const baseBalance = 100; // 100 USDC
        return Math.max(0, baseBalance - totalDebt);
    }

    async createPaymentRequest(params: PaymentRequest) {
        const invoiceId = uuidv4();

        // 创建发票记录
        await db.insert(invoices).values({
            id: invoiceId,
            callerId: params.callerId,
            period: new Date().toISOString().slice(0, 7), // YYYY-MM
            amount: params.amount.toString(),
            status: 'pending',
            chainId: params.chainId,
            token: params.currency as any
        });

        // 生成支付 URL 和二维码
        const paymentUrl = `${process.env.GATEWAY_BASE || 'http://localhost:3001'}/pay/${invoiceId}`;

        return {
            invoiceId,
            amount: params.amount.toString(),
            currency: params.currency,
            chainId: params.chainId,
            paymentUrl,
            qrCode: `data:image/png;base64,${this.generateQRCode(paymentUrl)}`
        };
    }

    async createReceipt(params: ReceiptCreation): Promise<Receipt> {
        const receiptId = uuidv4();

        // 生成收据哈希
        const receiptData = {
            callId: params.callId,
            mappingId: params.mappingId,
            amount: params.amount,
            currency: params.currency,
            chainId: params.chainId,
            timestamp: Date.now()
        };

        const receiptHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(receiptData))
            .digest('hex');

        // 生成签名（简化实现）
        const signature = this.signReceipt(receiptHash);

        // 创建收据记录
        const [receipt] = await db.insert(receipts).values({
            id: receiptId,
            callId: params.callId,
            receiptHash,
            signature,
            chainHint: this.getChainHint(params.chainId)
        }).returning();

        return receipt;
    }

    async verifyPaymentToken(token: string): Promise<boolean> {
        // 简化：占位校验逻辑，后续对接链上/票据服务
        if (!token || token.length < 8) return false;
        return true;
    }

    async recordCall(callData: {
        mappingId: string;
        callerId: string;
        durationMs: number;
        reqBytes: number;
        respBytes: number;
        status: number;
        fingerprint?: string;
        errorMessage?: string;
    }): Promise<Call> {
        const callId = uuidv4();

        // 创建调用记录
        const [call] = await db.insert(calls).values({
            id: callId,
            mappingId: callData.mappingId,
            callerId: callData.callerId,
            durationMs: callData.durationMs,
            reqBytes: callData.reqBytes,
            respBytes: callData.respBytes,
            status: callData.status,
            fingerprint: callData.fingerprint,
            errorMessage: callData.errorMessage
        }).returning();

        // 创建计量记录
        await db.insert(meters).values({
            callId,
            policy: 'flat_per_call', // 简化实现
            units: 1,
            unit: 'CREDIT'
        });

        return call;
    }

    private signReceipt(receiptHash: string): string {
        // 简化实现：使用私钥签名
        // 实际实现应该使用真实的私钥和签名算法
        return crypto
            .createHash('sha256')
            .update(receiptHash + process.env.SIGNATURE_SECRET || 'default-secret')
            .digest('hex');
    }

    private getChainHint(chainId: number): string {
        const chainMap: Record<number, string> = {
            56: 'BNB',
            1: 'ETH',
            137: 'POLYGON',
            10: 'OP',
            8453: 'BASE',
            42161: 'ARB'
        };

        return chainMap[chainId] || 'BNB';
    }

    private generateQRCode(data: string): string {
        // 简化实现：返回一个占位符
        // 实际实现应该使用 QR 码生成库
        return Buffer.from(data).toString('base64');
    }
}
