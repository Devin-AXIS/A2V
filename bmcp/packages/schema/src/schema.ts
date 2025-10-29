import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
import { MappingKind, PricingPolicy, TokenType, ChainType, InvoiceStatus } from './types';

// 映射表
export const mappings = pgTable('mappings', {
    id: uuid('id').primaryKey().defaultRandom(),
    originalUrl: varchar('original_url', { length: 500 }).notNull(),
    publisherId: uuid('publisher_id').notNull(),
    kind: varchar('kind', { length: 20 }).$type<MappingKind>().notNull(),
    gatewayUrl: varchar('gateway_url', { length: 500 }).notNull(),
    enable402: boolean('enable_402').default(true).notNull(),
    settlementToken: varchar('settlement_token', { length: 20 }).$type<TokenType>().default('USDC').notNull(),
    chainId: integer('chain_id').default(56).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull()
});

// 调用记录表
export const calls = pgTable('calls', {
    id: uuid('id').primaryKey().defaultRandom(),
    mappingId: uuid('mapping_id').notNull().references(() => mappings.id),
    callerId: uuid('caller_id').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    durationMs: integer('duration_ms').notNull(),
    reqBytes: integer('req_bytes').notNull(),
    respBytes: integer('resp_bytes').notNull(),
    status: integer('status').notNull(),
    fingerprint: varchar('fingerprint', { length: 64 }),
    errorMessage: text('error_message')
});

// 计量记录表
export const meters = pgTable('meters', {
    id: uuid('id').primaryKey().defaultRandom(),
    callId: uuid('call_id').notNull().references(() => calls.id),
    policy: varchar('policy', { length: 30 }).$type<PricingPolicy>().notNull(),
    units: integer('units').notNull(),
    unit: varchar('unit', { length: 20 }).default('CREDIT').notNull()
});

// 收据记录表
export const receipts = pgTable('receipts', {
    id: uuid('id').primaryKey().defaultRandom(),
    callId: uuid('call_id').notNull().references(() => calls.id),
    receiptHash: varchar('receipt_hash', { length: 66 }).notNull(),
    signature: text('signature').notNull(),
    chainHint: varchar('chain_hint', { length: 20 }).$type<ChainType>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// 发票记录表
export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    callerId: uuid('caller_id').notNull(),
    period: varchar('period', { length: 10 }).notNull(), // 如 "2024-01"
    amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
    status: varchar('status', { length: 20 }).$type<InvoiceStatus>().notNull(),
    chainId: integer('chain_id').notNull(),
    token: varchar('token', { length: 20 }).$type<TokenType>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    paidAt: timestamp('paid_at')
});

// 发布者配置表
export const publisherConfigs = pgTable('publisher_configs', {
    publisherId: uuid('publisher_id').primaryKey(),
    pricingJson: jsonb('pricing_json').notNull(),
    splitsJson: jsonb('splits_json').notNull(),
    walletAddr: varchar('wallet_addr', { length: 42 }).notNull(),
    chainPref: varchar('chain_pref', { length: 20 }).$type<ChainType>().notNull(),
    incentivesJson: jsonb('incentives_json'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 目标反馈表（预留）
export const goals = pgTable('goals', {
    callId: uuid('call_id').primaryKey().references(() => calls.id),
    goalType: varchar('goal_type', { length: 50 }),
    goalScore: integer('goal_score'),
    goalSuccess: boolean('goal_success'),
    feedback: text('feedback'),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// 链配置表
export const chainConfigs = pgTable('chain_configs', {
    chainId: integer('chain_id').primaryKey(),
    name: varchar('name', { length: 20 }).$type<ChainType>().notNull(),
    rpcUrl: varchar('rpc_url', { length: 200 }).notNull(),
    registryAddress: varchar('registry_address', { length: 42 }).notNull(),
    vaultAddress: varchar('vault_address', { length: 42 }).notNull(),
    tokens: jsonb('tokens').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});
