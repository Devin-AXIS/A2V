// 内存存储 - 不再使用数据库，只保留表对象用于类型兼容
import { MappingKind, PricingPolicy, TokenType, ChainType, InvoiceStatus } from './types';

// 创建简单的表对象，只包含必要的属性用于内存存储识别
// 这些对象不再与数据库绑定，只用于 db.ts 中的表识别

export const mappings = {
    name: 'mappings',
    // 添加一个 _ 属性以兼容旧代码
    _: {},
    // 列定义用于查询时的识别
    id: { name: 'id' },
    originalUrl: { name: 'originalUrl' },
    publisherId: { name: 'publisherId' },
    kind: { name: 'kind' },
    gatewayUrl: { name: 'gatewayUrl' },
    enable402: { name: 'enable402' },
    settlementToken: { name: 'settlementToken' },
    chainId: { name: 'chainId' },
    defaultMethod: { name: 'defaultMethod' },
    customHeaders: { name: 'customHeaders' },
    mcpEndpoint: { name: 'mcpEndpoint' },
    mcpConnectionConfig: { name: 'mcpConnectionConfig' },
    mcpRequestBody: { name: 'mcpRequestBody' },
    createdAt: { name: 'createdAt' },
    updatedAt: { name: 'updatedAt' },
    isActive: { name: 'isActive' }
} as any;

export const calls = {
    name: 'calls',
    _: {},
    id: { name: 'id' },
    mappingId: { name: 'mappingId' },
    callerId: { name: 'callerId' },
    timestamp: { name: 'timestamp' },
    durationMs: { name: 'durationMs' },
    reqBytes: { name: 'reqBytes' },
    respBytes: { name: 'respBytes' },
    status: { name: 'status' },
    fingerprint: { name: 'fingerprint' },
    errorMessage: { name: 'errorMessage' }
} as any;

export const meters = {
    name: 'meters',
    _: {},
    id: { name: 'id' },
    callId: { name: 'callId' },
    policy: { name: 'policy' },
    units: { name: 'units' },
    unit: { name: 'unit' }
} as any;

export const receipts = {
    name: 'receipts',
    _: {},
    id: { name: 'id' },
    callId: { name: 'callId' },
    receiptHash: { name: 'receiptHash' },
    signature: { name: 'signature' },
    chainHint: { name: 'chainHint' },
    createdAt: { name: 'createdAt' }
} as any;

export const invoices = {
    name: 'invoices',
    _: {},
    id: { name: 'id' },
    callerId: { name: 'callerId' },
    period: { name: 'period' },
    amount: { name: 'amount' },
    status: { name: 'status' },
    chainId: { name: 'chainId' },
    token: { name: 'token' },
    createdAt: { name: 'createdAt' },
    paidAt: { name: 'paidAt' }
} as any;

export const publisherConfigs = {
    name: 'publisher_configs',
    _: {},
    publisherId: { name: 'publisherId' },
    pricingJson: { name: 'pricingJson' },
    splitsJson: { name: 'splitsJson' },
    walletAddr: { name: 'walletAddr' },
    chainPref: { name: 'chainPref' },
    incentivesJson: { name: 'incentivesJson' },
    createdAt: { name: 'createdAt' },
    updatedAt: { name: 'updatedAt' }
} as any;

export const goals = {
    name: 'goals',
    _: {},
    callId: { name: 'callId' },
    goalType: { name: 'goalType' },
    goalScore: { name: 'goalScore' },
    goalSuccess: { name: 'goalSuccess' },
    feedback: { name: 'feedback' },
    createdAt: { name: 'createdAt' }
} as any;

export const chainConfigs = {
    name: 'chain_configs',
    _: {},
    chainId: { name: 'chainId' },
    chainName: { name: 'name' }, // 重命名为 chainName 避免与对象 name 冲突
    rpcUrl: { name: 'rpcUrl' },
    registryAddress: { name: 'registryAddress' },
    vaultAddress: { name: 'vaultAddress' },
    tokens: { name: 'tokens' },
    isActive: { name: 'isActive' },
    createdAt: { name: 'createdAt' }
} as any;
