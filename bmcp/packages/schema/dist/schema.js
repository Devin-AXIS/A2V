"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainConfigs = exports.goals = exports.publisherConfigs = exports.invoices = exports.receipts = exports.meters = exports.calls = exports.mappings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// 映射表
exports.mappings = (0, pg_core_1.pgTable)('mappings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    originalUrl: (0, pg_core_1.varchar)('original_url', { length: 500 }).notNull(),
    publisherId: (0, pg_core_1.uuid)('publisher_id').notNull(),
    kind: (0, pg_core_1.varchar)('kind', { length: 20 }).$type().notNull(),
    gatewayUrl: (0, pg_core_1.varchar)('gateway_url', { length: 500 }).notNull(),
    enable402: (0, pg_core_1.boolean)('enable_402').default(true).notNull(),
    settlementToken: (0, pg_core_1.varchar)('settlement_token', { length: 20 }).$type().default('USDC').notNull(),
    chainId: (0, pg_core_1.integer)('chain_id').default(56).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull()
});
// 调用记录表
exports.calls = (0, pg_core_1.pgTable)('calls', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    mappingId: (0, pg_core_1.uuid)('mapping_id').notNull().references(() => exports.mappings.id),
    callerId: (0, pg_core_1.uuid)('caller_id').notNull(),
    timestamp: (0, pg_core_1.timestamp)('timestamp').defaultNow().notNull(),
    durationMs: (0, pg_core_1.integer)('duration_ms').notNull(),
    reqBytes: (0, pg_core_1.integer)('req_bytes').notNull(),
    respBytes: (0, pg_core_1.integer)('resp_bytes').notNull(),
    status: (0, pg_core_1.integer)('status').notNull(),
    fingerprint: (0, pg_core_1.varchar)('fingerprint', { length: 64 }),
    errorMessage: (0, pg_core_1.text)('error_message')
});
// 计量记录表
exports.meters = (0, pg_core_1.pgTable)('meters', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    callId: (0, pg_core_1.uuid)('call_id').notNull().references(() => exports.calls.id),
    policy: (0, pg_core_1.varchar)('policy', { length: 30 }).$type().notNull(),
    units: (0, pg_core_1.integer)('units').notNull(),
    unit: (0, pg_core_1.varchar)('unit', { length: 20 }).default('CREDIT').notNull()
});
// 收据记录表
exports.receipts = (0, pg_core_1.pgTable)('receipts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    callId: (0, pg_core_1.uuid)('call_id').notNull().references(() => exports.calls.id),
    receiptHash: (0, pg_core_1.varchar)('receipt_hash', { length: 66 }).notNull(),
    signature: (0, pg_core_1.text)('signature').notNull(),
    chainHint: (0, pg_core_1.varchar)('chain_hint', { length: 20 }).$type().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// 发票记录表
exports.invoices = (0, pg_core_1.pgTable)('invoices', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    callerId: (0, pg_core_1.uuid)('caller_id').notNull(),
    period: (0, pg_core_1.varchar)('period', { length: 10 }).notNull(), // 如 "2024-01"
    amount: (0, pg_core_1.decimal)('amount', { precision: 20, scale: 8 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).$type().notNull(),
    chainId: (0, pg_core_1.integer)('chain_id').notNull(),
    token: (0, pg_core_1.varchar)('token', { length: 20 }).$type().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    paidAt: (0, pg_core_1.timestamp)('paid_at')
});
// 发布者配置表
exports.publisherConfigs = (0, pg_core_1.pgTable)('publisher_configs', {
    publisherId: (0, pg_core_1.uuid)('publisher_id').primaryKey(),
    pricingJson: (0, pg_core_1.jsonb)('pricing_json').notNull(),
    splitsJson: (0, pg_core_1.jsonb)('splits_json').notNull(),
    walletAddr: (0, pg_core_1.varchar)('wallet_addr', { length: 42 }).notNull(),
    chainPref: (0, pg_core_1.varchar)('chain_pref', { length: 20 }).$type().notNull(),
    incentivesJson: (0, pg_core_1.jsonb)('incentives_json'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// 目标反馈表（预留）
exports.goals = (0, pg_core_1.pgTable)('goals', {
    callId: (0, pg_core_1.uuid)('call_id').primaryKey().references(() => exports.calls.id),
    goalType: (0, pg_core_1.varchar)('goal_type', { length: 50 }),
    goalScore: (0, pg_core_1.integer)('goal_score'),
    goalSuccess: (0, pg_core_1.boolean)('goal_success'),
    feedback: (0, pg_core_1.text)('feedback'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// 链配置表
exports.chainConfigs = (0, pg_core_1.pgTable)('chain_configs', {
    chainId: (0, pg_core_1.integer)('chain_id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 20 }).$type().notNull(),
    rpcUrl: (0, pg_core_1.varchar)('rpc_url', { length: 200 }).notNull(),
    registryAddress: (0, pg_core_1.varchar)('registry_address', { length: 42 }).notNull(),
    vaultAddress: (0, pg_core_1.varchar)('vault_address', { length: 42 }).notNull(),
    tokens: (0, pg_core_1.jsonb)('tokens').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
//# sourceMappingURL=schema.js.map