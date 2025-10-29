import { z } from 'zod';

// 基础类型定义
export const CallerId = z.string().uuid();
export const PublisherId = z.string().uuid();
export const MappingId = z.string().uuid();
export const CallId = z.string().uuid();
export const ReceiptId = z.string().uuid();
export const InvoiceId = z.string().uuid();

// 映射类型
export const MappingKind = z.enum(['mcp', 'compiled']);
export type MappingKind = z.infer<typeof MappingKind>;

// 计价策略
export const PricingPolicy = z.enum(['flat_per_call', 'by_bytes', 'duration_weighted', 'custom']);
export type PricingPolicy = z.infer<typeof PricingPolicy>;

// 结算币种
export const TokenType = z.enum(['USDC', 'USDT', 'PLATFORM']);
export type TokenType = z.infer<typeof TokenType>;

// 链类型
export const ChainType = z.enum(['BNB', 'BASE', 'OP', 'ARB', 'POLYGON', 'ETH', 'SOLANA']);
export type ChainType = z.infer<typeof ChainType>;

// 状态类型
export const InvoiceStatus = z.enum(['pending', 'paid', 'failed', 'cancelled']);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;

// 映射记录
export const MappingSchema = z.object({
    id: MappingId,
    originalUrl: z.string().url(),
    publisherId: PublisherId,
    kind: MappingKind,
    gatewayUrl: z.string().url(),
    enable402: z.boolean().default(true),
    settlementToken: TokenType.default('USDC'),
    chainId: z.number().int().default(56),
    createdAt: z.date(),
    updatedAt: z.date(),
    isActive: z.boolean().default(true)
});

// 调用记录
export const CallSchema = z.object({
    id: CallId,
    mappingId: MappingId,
    callerId: CallerId,
    timestamp: z.date(),
    durationMs: z.number().int().min(0),
    reqBytes: z.number().int().min(0),
    respBytes: z.number().int().min(0),
    status: z.number().int().min(100).max(599),
    fingerprint: z.string().optional(),
    errorMessage: z.string().optional()
});

// 计量记录
export const MeterSchema = z.object({
    id: z.string().uuid(),
    callId: CallId,
    policy: PricingPolicy,
    units: z.number().int().min(0),
    unit: z.string().default('CREDIT')
});

// 收据记录
export const ReceiptSchema = z.object({
    id: ReceiptId,
    callId: CallId,
    receiptHash: z.string(),
    signature: z.string(),
    chainHint: ChainType,
    createdAt: z.date()
});

// 发票记录
export const InvoiceSchema = z.object({
    id: InvoiceId,
    callerId: CallerId,
    period: z.string(), // 如 "2024-01"
    amount: z.string(), // 使用字符串避免精度问题
    status: InvoiceStatus,
    chainId: z.number().int(),
    token: TokenType,
    createdAt: z.date(),
    paidAt: z.date().optional()
});

// 发布者配置
export const PublisherConfigSchema = z.object({
    publisherId: PublisherId,
    pricingJson: z.record(z.any()), // 灵活的定价配置
    splitsJson: z.record(z.any()), // 分账配置
    walletAddr: z.string(),
    chainPref: ChainType,
    incentivesJson: z.record(z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// 目标反馈（预留）
export const GoalSchema = z.object({
    callId: CallId,
    goalType: z.string().optional(),
    goalScore: z.number().min(0).max(10).optional(),
    goalSuccess: z.boolean().optional(),
    feedback: z.string().optional(),
    createdAt: z.date()
});

// API 请求/响应类型
export const RegisterRequestSchema = z.object({
    originalUrl: z.string().url(),
    kind: MappingKind,
    pricing: z.object({
        policy: PricingPolicy,
        pricePerCall: z.number().min(0).optional(),
        pricePerByte: z.number().min(0).optional(),
        pricePerMs: z.number().min(0).optional(),
        customPricing: z.record(z.any()).optional()
    }),
    enable402: z.boolean().default(true),
    settlementToken: TokenType.default('USDC'),
    publisherId: PublisherId
});

export const RegisterResponseSchema = z.object({
    mappingId: MappingId,
    gatewayUrl: z.string().url(),
    originalUrl: z.string().url(),
    pricing: z.record(z.any())
});

// 402 支付相关
export const PaymentRequiredSchema = z.object({
    amount: z.string(),
    currency: TokenType,
    chainId: z.number().int(),
    paymentAddress: z.string(),
    invoiceId: InvoiceId,
    paymentUrl: z.string().url(),
    qrCode: z.string().optional()
});

// 链配置
export const ChainConfigSchema = z.object({
    chainId: z.number().int(),
    name: ChainType,
    rpcUrl: z.string().url(),
    registryAddress: z.string(),
    vaultAddress: z.string(),
    tokens: z.array(z.object({
        symbol: TokenType,
        address: z.string(),
        decimals: z.number().int()
    }))
});

// 导出类型
export type Mapping = z.infer<typeof MappingSchema>;
export type Call = z.infer<typeof CallSchema>;
export type Meter = z.infer<typeof MeterSchema>;
export type Receipt = z.infer<typeof ReceiptSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type PublisherConfig = z.infer<typeof PublisherConfigSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type PaymentRequired = z.infer<typeof PaymentRequiredSchema>;
export type ChainConfig = z.infer<typeof ChainConfigSchema>;
