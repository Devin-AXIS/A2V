"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainConfigSchema = exports.PaymentRequiredSchema = exports.RegisterResponseSchema = exports.RegisterRequestSchema = exports.GoalSchema = exports.PublisherConfigSchema = exports.InvoiceSchema = exports.ReceiptSchema = exports.MeterSchema = exports.CallSchema = exports.MappingSchema = exports.InvoiceStatus = exports.ChainType = exports.TokenType = exports.PricingPolicy = exports.MappingKind = exports.InvoiceId = exports.ReceiptId = exports.CallId = exports.MappingId = exports.PublisherId = exports.CallerId = void 0;
const zod_1 = require("zod");
// 基础类型定义
exports.CallerId = zod_1.z.string().uuid();
exports.PublisherId = zod_1.z.string().uuid();
exports.MappingId = zod_1.z.string().uuid();
exports.CallId = zod_1.z.string().uuid();
exports.ReceiptId = zod_1.z.string().uuid();
exports.InvoiceId = zod_1.z.string().uuid();
// 映射类型
exports.MappingKind = zod_1.z.enum(['mcp', 'compiled']);
// 计价策略
exports.PricingPolicy = zod_1.z.enum(['flat_per_call', 'by_bytes', 'duration_weighted', 'custom']);
// 结算币种
exports.TokenType = zod_1.z.enum(['USDC', 'USDT', 'PLATFORM']);
// 链类型
exports.ChainType = zod_1.z.enum(['BNB', 'BASE', 'OP', 'ARB', 'POLYGON', 'ETH', 'SOLANA']);
// 状态类型
exports.InvoiceStatus = zod_1.z.enum(['pending', 'paid', 'failed', 'cancelled']);
// 映射记录
exports.MappingSchema = zod_1.z.object({
    id: exports.MappingId,
    originalUrl: zod_1.z.string().url(),
    publisherId: exports.PublisherId,
    kind: exports.MappingKind,
    gatewayUrl: zod_1.z.string().url(),
    enable402: zod_1.z.boolean().default(true),
    settlementToken: exports.TokenType.default('USDC'),
    chainId: zod_1.z.number().int().default(56),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    isActive: zod_1.z.boolean().default(true)
});
// 调用记录
exports.CallSchema = zod_1.z.object({
    id: exports.CallId,
    mappingId: exports.MappingId,
    callerId: exports.CallerId,
    timestamp: zod_1.z.date(),
    durationMs: zod_1.z.number().int().min(0),
    reqBytes: zod_1.z.number().int().min(0),
    respBytes: zod_1.z.number().int().min(0),
    status: zod_1.z.number().int().min(100).max(599),
    fingerprint: zod_1.z.string().optional(),
    errorMessage: zod_1.z.string().optional()
});
// 计量记录
exports.MeterSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    callId: exports.CallId,
    policy: exports.PricingPolicy,
    units: zod_1.z.number().int().min(0),
    unit: zod_1.z.string().default('CREDIT')
});
// 收据记录
exports.ReceiptSchema = zod_1.z.object({
    id: exports.ReceiptId,
    callId: exports.CallId,
    receiptHash: zod_1.z.string(),
    signature: zod_1.z.string(),
    chainHint: exports.ChainType,
    createdAt: zod_1.z.date()
});
// 发票记录
exports.InvoiceSchema = zod_1.z.object({
    id: exports.InvoiceId,
    callerId: exports.CallerId,
    period: zod_1.z.string(), // 如 "2024-01"
    amount: zod_1.z.string(), // 使用字符串避免精度问题
    status: exports.InvoiceStatus,
    chainId: zod_1.z.number().int(),
    token: exports.TokenType,
    createdAt: zod_1.z.date(),
    paidAt: zod_1.z.date().optional()
});
// 发布者配置
exports.PublisherConfigSchema = zod_1.z.object({
    publisherId: exports.PublisherId,
    pricingJson: zod_1.z.record(zod_1.z.any()), // 灵活的定价配置
    splitsJson: zod_1.z.record(zod_1.z.any()), // 分账配置
    walletAddr: zod_1.z.string(),
    chainPref: exports.ChainType,
    incentivesJson: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// 目标反馈（预留）
exports.GoalSchema = zod_1.z.object({
    callId: exports.CallId,
    goalType: zod_1.z.string().optional(),
    goalScore: zod_1.z.number().min(0).max(10).optional(),
    goalSuccess: zod_1.z.boolean().optional(),
    feedback: zod_1.z.string().optional(),
    createdAt: zod_1.z.date()
});
// API 请求/响应类型
exports.RegisterRequestSchema = zod_1.z.object({
    originalUrl: zod_1.z.string().url().optional(), // 对于 MCP 类型，可以使用 mcpEndpoint 代替
    kind: exports.MappingKind,
    pricing: zod_1.z.object({
        policy: exports.PricingPolicy,
        pricePerCall: zod_1.z.number().min(0).optional(),
        pricePerByte: zod_1.z.number().min(0).optional(),
        pricePerMs: zod_1.z.number().min(0).optional(),
        customPricing: zod_1.z.record(zod_1.z.any()).optional()
    }),
    enable402: zod_1.z.boolean().default(true),
    settlementToken: exports.TokenType.default('USDC'),
    publisherId: exports.PublisherId,
    // MCP 相关字段
    mcpEndpoint: zod_1.z.string().min(1).optional(), // MCP 服务端点 URL (支持 HTTP/HTTPS/WS/WSS/stdio)
    mcpConnectionConfig: zod_1.z.record(zod_1.z.any()).optional(), // MCP 接入配置 (传输方式、端点等)
    mcpRequestBody: zod_1.z.record(zod_1.z.any()).optional(), // MCP 请求体模板 (JSON-RPC 格式)
    // 其他可选字段
    defaultMethod: zod_1.z.string().optional(),
    customHeaders: zod_1.z.record(zod_1.z.string()).optional(),
    chainId: zod_1.z.number().int().optional()
}).refine((data) => {
    // 如果是 MCP 类型，必须提供 mcpEndpoint 或 originalUrl
    if (data.kind === 'mcp') {
        return !!(data.mcpEndpoint || data.originalUrl);
    }
    // 如果是 compiled 类型，必须提供 originalUrl
    if (data.kind === 'compiled') {
        return !!data.originalUrl;
    }
    return true;
}, {
    message: 'MCP 类型必须提供 mcpEndpoint 或 originalUrl，compiled 类型必须提供 originalUrl'
});
exports.RegisterResponseSchema = zod_1.z.object({
    mappingId: exports.MappingId,
    gatewayUrl: zod_1.z.string().url(),
    originalUrl: zod_1.z.string(), // 可能是 mcpEndpoint，不一定必须是标准 URL
    pricing: zod_1.z.record(zod_1.z.any())
});
// 402 支付相关
exports.PaymentRequiredSchema = zod_1.z.object({
    amount: zod_1.z.string(),
    currency: exports.TokenType,
    chainId: zod_1.z.number().int(),
    paymentAddress: zod_1.z.string(),
    invoiceId: exports.InvoiceId,
    paymentUrl: zod_1.z.string().url(),
    qrCode: zod_1.z.string().optional()
});
// 链配置
exports.ChainConfigSchema = zod_1.z.object({
    chainId: zod_1.z.number().int(),
    name: exports.ChainType,
    rpcUrl: zod_1.z.string().url(),
    registryAddress: zod_1.z.string(),
    vaultAddress: zod_1.z.string(),
    tokens: zod_1.z.array(zod_1.z.object({
        symbol: exports.TokenType,
        address: zod_1.z.string(),
        decimals: zod_1.z.number().int()
    }))
});
//# sourceMappingURL=types.js.map