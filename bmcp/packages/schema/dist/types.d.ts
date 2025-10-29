import { z } from 'zod';
export declare const CallerId: z.ZodString;
export declare const PublisherId: z.ZodString;
export declare const MappingId: z.ZodString;
export declare const CallId: z.ZodString;
export declare const ReceiptId: z.ZodString;
export declare const InvoiceId: z.ZodString;
export declare const MappingKind: z.ZodEnum<["mcp", "compiled"]>;
export type MappingKind = z.infer<typeof MappingKind>;
export declare const PricingPolicy: z.ZodEnum<["flat_per_call", "by_bytes", "duration_weighted", "custom"]>;
export type PricingPolicy = z.infer<typeof PricingPolicy>;
export declare const TokenType: z.ZodEnum<["USDC", "USDT", "PLATFORM"]>;
export type TokenType = z.infer<typeof TokenType>;
export declare const ChainType: z.ZodEnum<["BNB", "BASE", "OP", "ARB", "POLYGON", "ETH", "SOLANA"]>;
export type ChainType = z.infer<typeof ChainType>;
export declare const InvoiceStatus: z.ZodEnum<["pending", "paid", "failed", "cancelled"]>;
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;
export declare const MappingSchema: z.ZodObject<{
    id: z.ZodString;
    originalUrl: z.ZodString;
    publisherId: z.ZodString;
    kind: z.ZodEnum<["mcp", "compiled"]>;
    gatewayUrl: z.ZodString;
    enable402: z.ZodDefault<z.ZodBoolean>;
    settlementToken: z.ZodDefault<z.ZodEnum<["USDC", "USDT", "PLATFORM"]>>;
    chainId: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    originalUrl: string;
    publisherId: string;
    kind: "mcp" | "compiled";
    gatewayUrl: string;
    enable402: boolean;
    settlementToken: "USDC" | "USDT" | "PLATFORM";
    chainId: number;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}, {
    id: string;
    originalUrl: string;
    publisherId: string;
    kind: "mcp" | "compiled";
    gatewayUrl: string;
    createdAt: Date;
    updatedAt: Date;
    enable402?: boolean | undefined;
    settlementToken?: "USDC" | "USDT" | "PLATFORM" | undefined;
    chainId?: number | undefined;
    isActive?: boolean | undefined;
}>;
export declare const CallSchema: z.ZodObject<{
    id: z.ZodString;
    mappingId: z.ZodString;
    callerId: z.ZodString;
    timestamp: z.ZodDate;
    durationMs: z.ZodNumber;
    reqBytes: z.ZodNumber;
    respBytes: z.ZodNumber;
    status: z.ZodNumber;
    fingerprint: z.ZodOptional<z.ZodString>;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: number;
    id: string;
    mappingId: string;
    callerId: string;
    timestamp: Date;
    durationMs: number;
    reqBytes: number;
    respBytes: number;
    fingerprint?: string | undefined;
    errorMessage?: string | undefined;
}, {
    status: number;
    id: string;
    mappingId: string;
    callerId: string;
    timestamp: Date;
    durationMs: number;
    reqBytes: number;
    respBytes: number;
    fingerprint?: string | undefined;
    errorMessage?: string | undefined;
}>;
export declare const MeterSchema: z.ZodObject<{
    id: z.ZodString;
    callId: z.ZodString;
    policy: z.ZodEnum<["flat_per_call", "by_bytes", "duration_weighted", "custom"]>;
    units: z.ZodNumber;
    unit: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    callId: string;
    policy: "flat_per_call" | "by_bytes" | "duration_weighted" | "custom";
    units: number;
    unit: string;
}, {
    id: string;
    callId: string;
    policy: "flat_per_call" | "by_bytes" | "duration_weighted" | "custom";
    units: number;
    unit?: string | undefined;
}>;
export declare const ReceiptSchema: z.ZodObject<{
    id: z.ZodString;
    callId: z.ZodString;
    receiptHash: z.ZodString;
    signature: z.ZodString;
    chainHint: z.ZodEnum<["BNB", "BASE", "OP", "ARB", "POLYGON", "ETH", "SOLANA"]>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    callId: string;
    receiptHash: string;
    signature: string;
    chainHint: "BNB" | "BASE" | "OP" | "ARB" | "POLYGON" | "ETH" | "SOLANA";
}, {
    id: string;
    createdAt: Date;
    callId: string;
    receiptHash: string;
    signature: string;
    chainHint: "BNB" | "BASE" | "OP" | "ARB" | "POLYGON" | "ETH" | "SOLANA";
}>;
export declare const InvoiceSchema: z.ZodObject<{
    id: z.ZodString;
    callerId: z.ZodString;
    period: z.ZodString;
    amount: z.ZodString;
    status: z.ZodEnum<["pending", "paid", "failed", "cancelled"]>;
    chainId: z.ZodNumber;
    token: z.ZodEnum<["USDC", "USDT", "PLATFORM"]>;
    createdAt: z.ZodDate;
    paidAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "paid" | "failed" | "cancelled";
    id: string;
    chainId: number;
    createdAt: Date;
    callerId: string;
    period: string;
    amount: string;
    token: "USDC" | "USDT" | "PLATFORM";
    paidAt?: Date | undefined;
}, {
    status: "pending" | "paid" | "failed" | "cancelled";
    id: string;
    chainId: number;
    createdAt: Date;
    callerId: string;
    period: string;
    amount: string;
    token: "USDC" | "USDT" | "PLATFORM";
    paidAt?: Date | undefined;
}>;
export declare const PublisherConfigSchema: z.ZodObject<{
    publisherId: z.ZodString;
    pricingJson: z.ZodRecord<z.ZodString, z.ZodAny>;
    splitsJson: z.ZodRecord<z.ZodString, z.ZodAny>;
    walletAddr: z.ZodString;
    chainPref: z.ZodEnum<["BNB", "BASE", "OP", "ARB", "POLYGON", "ETH", "SOLANA"]>;
    incentivesJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    publisherId: string;
    createdAt: Date;
    updatedAt: Date;
    pricingJson: Record<string, any>;
    splitsJson: Record<string, any>;
    walletAddr: string;
    chainPref: "BNB" | "BASE" | "OP" | "ARB" | "POLYGON" | "ETH" | "SOLANA";
    incentivesJson?: Record<string, any> | undefined;
}, {
    publisherId: string;
    createdAt: Date;
    updatedAt: Date;
    pricingJson: Record<string, any>;
    splitsJson: Record<string, any>;
    walletAddr: string;
    chainPref: "BNB" | "BASE" | "OP" | "ARB" | "POLYGON" | "ETH" | "SOLANA";
    incentivesJson?: Record<string, any> | undefined;
}>;
export declare const GoalSchema: z.ZodObject<{
    callId: z.ZodString;
    goalType: z.ZodOptional<z.ZodString>;
    goalScore: z.ZodOptional<z.ZodNumber>;
    goalSuccess: z.ZodOptional<z.ZodBoolean>;
    feedback: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    callId: string;
    goalType?: string | undefined;
    goalScore?: number | undefined;
    goalSuccess?: boolean | undefined;
    feedback?: string | undefined;
}, {
    createdAt: Date;
    callId: string;
    goalType?: string | undefined;
    goalScore?: number | undefined;
    goalSuccess?: boolean | undefined;
    feedback?: string | undefined;
}>;
export declare const RegisterRequestSchema: z.ZodObject<{
    originalUrl: z.ZodString;
    kind: z.ZodEnum<["mcp", "compiled"]>;
    pricing: z.ZodObject<{
        policy: z.ZodEnum<["flat_per_call", "by_bytes", "duration_weighted", "custom"]>;
        pricePerCall: z.ZodOptional<z.ZodNumber>;
        pricePerByte: z.ZodOptional<z.ZodNumber>;
        pricePerMs: z.ZodOptional<z.ZodNumber>;
        customPricing: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        policy: "flat_per_call" | "by_bytes" | "duration_weighted" | "custom";
        pricePerCall?: number | undefined;
        pricePerByte?: number | undefined;
        pricePerMs?: number | undefined;
        customPricing?: Record<string, any> | undefined;
    }, {
        policy: "flat_per_call" | "by_bytes" | "duration_weighted" | "custom";
        pricePerCall?: number | undefined;
        pricePerByte?: number | undefined;
        pricePerMs?: number | undefined;
        customPricing?: Record<string, any> | undefined;
    }>;
    enable402: z.ZodDefault<z.ZodBoolean>;
    settlementToken: z.ZodDefault<z.ZodEnum<["USDC", "USDT", "PLATFORM"]>>;
    publisherId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    originalUrl: string;
    publisherId: string;
    kind: "mcp" | "compiled";
    enable402: boolean;
    settlementToken: "USDC" | "USDT" | "PLATFORM";
    pricing: {
        policy: "flat_per_call" | "by_bytes" | "duration_weighted" | "custom";
        pricePerCall?: number | undefined;
        pricePerByte?: number | undefined;
        pricePerMs?: number | undefined;
        customPricing?: Record<string, any> | undefined;
    };
}, {
    originalUrl: string;
    publisherId: string;
    kind: "mcp" | "compiled";
    pricing: {
        policy: "flat_per_call" | "by_bytes" | "duration_weighted" | "custom";
        pricePerCall?: number | undefined;
        pricePerByte?: number | undefined;
        pricePerMs?: number | undefined;
        customPricing?: Record<string, any> | undefined;
    };
    enable402?: boolean | undefined;
    settlementToken?: "USDC" | "USDT" | "PLATFORM" | undefined;
}>;
export declare const RegisterResponseSchema: z.ZodObject<{
    mappingId: z.ZodString;
    gatewayUrl: z.ZodString;
    originalUrl: z.ZodString;
    pricing: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    originalUrl: string;
    gatewayUrl: string;
    mappingId: string;
    pricing: Record<string, any>;
}, {
    originalUrl: string;
    gatewayUrl: string;
    mappingId: string;
    pricing: Record<string, any>;
}>;
export declare const PaymentRequiredSchema: z.ZodObject<{
    amount: z.ZodString;
    currency: z.ZodEnum<["USDC", "USDT", "PLATFORM"]>;
    chainId: z.ZodNumber;
    paymentAddress: z.ZodString;
    invoiceId: z.ZodString;
    paymentUrl: z.ZodString;
    qrCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    chainId: number;
    amount: string;
    currency: "USDC" | "USDT" | "PLATFORM";
    paymentAddress: string;
    invoiceId: string;
    paymentUrl: string;
    qrCode?: string | undefined;
}, {
    chainId: number;
    amount: string;
    currency: "USDC" | "USDT" | "PLATFORM";
    paymentAddress: string;
    invoiceId: string;
    paymentUrl: string;
    qrCode?: string | undefined;
}>;
export declare const ChainConfigSchema: z.ZodObject<{
    chainId: z.ZodNumber;
    name: z.ZodEnum<["BNB", "BASE", "OP", "ARB", "POLYGON", "ETH", "SOLANA"]>;
    rpcUrl: z.ZodString;
    registryAddress: z.ZodString;
    vaultAddress: z.ZodString;
    tokens: z.ZodArray<z.ZodObject<{
        symbol: z.ZodEnum<["USDC", "USDT", "PLATFORM"]>;
        address: z.ZodString;
        decimals: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        symbol: "USDC" | "USDT" | "PLATFORM";
        address: string;
        decimals: number;
    }, {
        symbol: "USDC" | "USDT" | "PLATFORM";
        address: string;
        decimals: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    chainId: number;
    name: "BNB" | "BASE" | "OP" | "ARB" | "POLYGON" | "ETH" | "SOLANA";
    rpcUrl: string;
    registryAddress: string;
    vaultAddress: string;
    tokens: {
        symbol: "USDC" | "USDT" | "PLATFORM";
        address: string;
        decimals: number;
    }[];
}, {
    chainId: number;
    name: "BNB" | "BASE" | "OP" | "ARB" | "POLYGON" | "ETH" | "SOLANA";
    rpcUrl: string;
    registryAddress: string;
    vaultAddress: string;
    tokens: {
        symbol: "USDC" | "USDT" | "PLATFORM";
        address: string;
        decimals: number;
    }[];
}>;
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
//# sourceMappingURL=types.d.ts.map