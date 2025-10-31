// 内存存储 - 不使用数据库
import { type Mapping, type Call, type Meter, type Receipt, type Invoice, type PublisherConfig, type Goal, type ChainConfig } from './types';

// 内存存储数据结构
type MemoryStore = {
    mappings: Map<string, Mapping>;
    calls: Map<string, Call>;
    meters: Map<string, Meter>;
    receipts: Map<string, Receipt>;
    invoices: Map<string, Invoice>;
    publisherConfigs: Map<string, PublisherConfig>;
    goals: Map<string, Goal>;
    chainConfigs: Map<number, ChainConfig>;
};

// 创建内存存储
const memoryStore: MemoryStore = {
    mappings: new Map(),
    calls: new Map(),
    meters: new Map(),
    receipts: new Map(),
    invoices: new Map(),
    publisherConfigs: new Map(),
    goals: new Map(),
    chainConfigs: new Map()
};

// 辅助函数：解析 Drizzle 条件
function evaluateCondition(item: any, condition: any): boolean {
    if (!condition) return true;
    
    // 处理 eq(column, value) - Drizzle 条件对象结构
    if (condition.operator === '=' || condition.op === 'eq') {
        const column = condition.left || condition.column;
        const value = condition.right || condition.value;
        
        // 从 Drizzle column 对象中提取列名
        let columnName: string;
        if (typeof column === 'string') {
            columnName = column;
        } else if (column?.name) {
            columnName = column.name;
        } else if (column?.column?.name) {
            columnName = column.column.name;
        } else {
            // 尝试从其他可能的属性中获取
            columnName = column?.data?.name || 'unknown';
        }
        
        const actualValue = value?.value !== undefined ? value.value : value;
        
        // 处理嵌套的列名（如 invoices.callerId）
        const parts = columnName.split('.');
        const finalColumnName = parts[parts.length - 1];
        
        return item[finalColumnName] === actualValue;
    }
    
    // 处理 and(condition1, condition2, ...)
    if (condition.operator === 'and' || condition.op === 'and') {
        const conditions = condition.args || condition.children || [];
        return conditions.every((cond: any) => evaluateCondition(item, cond));
    }
    
    // 处理 gte(column, value)
    if (condition.operator === '>=' || condition.op === 'gte') {
        const column = condition.left || condition.column;
        const value = condition.right || condition.value;
        let columnName: string;
        if (typeof column === 'string') {
            columnName = column;
        } else {
            columnName = column?.name || column?.data?.name || 'unknown';
        }
        const parts = columnName.split('.');
        const finalColumnName = parts[parts.length - 1];
        const actualValue = value?.value !== undefined ? value.value : value;
        return item[finalColumnName] >= actualValue;
    }
    
    // 处理 sql 条件（简化处理）
    if (condition.sql || condition._.sql) {
        const sqlObj = condition.sql || condition._.sql;
        const sqlStr = sqlObj?.string || '';
        if (sqlStr.includes('is not null') || sqlStr.includes('IS NOT NULL')) {
            // 尝试提取字段名
            const fieldMatch = sqlStr.match(/\$\{.*?\.(\w+)\}/);
            if (fieldMatch) {
                return item[fieldMatch[1]] != null;
            }
        }
        return true;
    }
    
    // 如果条件是一个函数，直接调用
    if (typeof condition === 'function') {
        return condition(item);
    }
    
    return true;
}

// 辅助函数：处理聚合函数
function evaluateAggregate(agg: any, items: any[], column?: any): number {
    // 处理 count()
    if (agg._?.op === 'count' || agg?.op === 'count' || (agg.toString && agg.toString().includes('count'))) {
        return items.length;
    }
    
    // 处理 avg()
    if (agg._?.op === 'avg' || agg?.op === 'avg') {
        let columnName = 'durationMs';
        if (column) {
            if (typeof column === 'string') {
                columnName = column;
            } else {
                columnName = column?.name || column?.column?.name || 'durationMs';
            }
            const parts = columnName.split('.');
            columnName = parts[parts.length - 1];
        }
        const sum = items.reduce((acc, item) => acc + (item[columnName] || 0), 0);
        return items.length > 0 ? sum / items.length : 0;
    }
    
    // 处理 sql 模板
    if (agg?.sql || agg?._?.sql) {
        const sqlObj = agg.sql || agg._.sql;
        const sqlStr = sqlObj?.string || '';
        
        // 处理 count(case when ... then 1 end)
        if (sqlStr.includes('count(case') || sqlStr.includes('COUNT(CASE')) {
            // 提取条件
            const caseMatch = sqlStr.match(/case when .*? then 1 end/i);
            if (caseMatch) {
                const conditionStr = caseMatch[0];
                // 提取字段名
                const fieldMatch = conditionStr.match(/\$\{.*?\.(\w+)\}/);
                if (fieldMatch) {
                    const fieldName = fieldMatch[1];
                    let valueMatch = conditionStr.match(/= (true|false|\d+|'[^']+')/i);
                    if (!valueMatch) {
                        valueMatch = conditionStr.match(/>= (new Date|Date\([^)]+\))/);
                    }
                    // 简化：统计符合条件的项
                    if (valueMatch) {
                        const targetValue = valueMatch[1];
                        let count = 0;
                        for (const item of items) {
                            if (targetValue.includes('Date') || targetValue.includes('>=')) {
                                // 处理时间比较
                                const timeMatch = sqlStr.match(/>=\s*\$?\{([^}]+)\}/);
                                if (timeMatch) {
                                    // 从上下文中提取时间值（需要从外部传入）
                                    // 这里简化处理
                                    const itemValue = item[fieldName];
                                    if (itemValue instanceof Date) {
                                        // 需要比较逻辑
                                        count++;
                                    }
                                }
                            } else {
                                const itemValue = item[fieldName];
                                const target = targetValue === 'true' ? true : targetValue === 'false' ? false : targetValue;
                                if (itemValue === target) {
                                    count++;
                                }
                            }
                        }
                        return count;
                    }
                }
            }
        }
        
        // 处理时间比较的 count
        if (sqlStr.includes('timestamp') && sqlStr.includes('>=')) {
            // 简化：返回符合条件的数量（需要从外部传入比较值）
            return items.length; // 简化实现
        }
    }
    
    return 0;
}

// 模拟数据库接口，提供类似 Drizzle 的 API
class MemoryDB {
    private store = memoryStore;

    private handleSelectFields(selectFields: any, results: any[], table: any): any {
        const self = this;
        let filteredResults = results;
        
        const builder = {
            where: (condition: any) => {
                filteredResults = filteredResults.filter(item => evaluateCondition(item, condition));
                return {
                    groupBy: (key: any) => {
                        return self.handleGroupBy(selectFields, filteredResults, key);
                    },
                    limit: (n: number) => {
                        return Promise.resolve([self.computeSelectFields(selectFields, filteredResults.slice(0, n))]);
                    },
                    // 直接返回结果（同步）
                    then: (resolve: any) => {
                        return Promise.resolve([self.computeSelectFields(selectFields, filteredResults)]).then(resolve);
                    }
                };
            },
            groupBy: (key: any) => {
                return self.handleGroupBy(selectFields, filteredResults, key);
            },
            limit: (n: number) => {
                return Promise.resolve([self.computeSelectFields(selectFields, filteredResults.slice(0, n))]);
            },
            // 如果没有 where/groupBy/limit，直接返回计算结果
            then: (resolve: any) => {
                return Promise.resolve([self.computeSelectFields(selectFields, filteredResults)]).then(resolve);
            }
        };
        
        // 返回构建器，让调用者决定如何链式调用
        return builder;
    }
    
    private computeSelectFields(selectFields: any, items: any[]): any {
        const computed: any = {};
        
            for (const [key, value] of Object.entries(selectFields)) {
                if (value && typeof value === 'object') {
                    const val = value as any;
                    // 如果是聚合函数
                    if (val._?.op || val.sql || val.op) {
                        computed[key] = evaluateAggregate(val, items, val);
                    } else {
                        // 如果是指定字段（从第一个元素获取，用于 groupBy）
                        let fieldName = '';
                        if (typeof value === 'string') {
                            fieldName = value;
                        } else {
                            fieldName = val?.name || val?.column?.name || key;
                        }
                        const parts = fieldName.split('.');
                        const finalFieldName = parts[parts.length - 1];
                        computed[key] = items.length > 0 ? items[0][finalFieldName] : null;
                    }
                } else {
                    computed[key] = value;
                }
            }
        
        return computed;
    }
    
    private handleGroupBy(selectFields: any, items: any[], key: any): any {
        let groupKey = '';
        if (typeof key === 'string') {
            groupKey = key;
        } else {
            const k = key as any;
            groupKey = k?.name || k?.column?.name || 'id';
        }
        const parts = groupKey.split('.');
        const finalKey = parts[parts.length - 1];
        
        const grouped = new Map<any, any[]>();
        for (const item of items) {
            const groupValue = item[finalKey];
            if (!grouped.has(groupValue)) {
                grouped.set(groupValue, []);
            }
            grouped.get(groupValue)!.push(item);
        }
        
        const results: any[] = [];
        for (const [groupValue, groupItems] of grouped.entries()) {
            const computed = this.computeSelectFields(selectFields, groupItems);
            // 确保分组键也在结果中
            computed[finalKey] = groupValue;
            results.push(computed);
        }
        
        return {
            limit: (n: number) => results.slice(0, n),
            get value() { return results; },
            // 支持 Promise 接口
            then: (resolve: any) => Promise.resolve(results).then(resolve)
        };
    }

    select(selectFields?: any) {
        return {
            from: (table: any) => {
                let results: any[] = [];
                
                // 获取表名 - 处理 Drizzle 表对象
                let tableName = '';
                if (typeof table === 'string') {
                    tableName = table;
                } else if (table?.name) {
                    tableName = table.name;
                } else if (table?._ && table._[Symbol.for('drizzle:Name')]) {
                    tableName = table._[Symbol.for('drizzle:Name')];
                } else {
                    // 尝试从其他可能的属性中获取
                    tableName = table?.config?.name || 'unknown';
                }
                
                // 根据表名获取数据
                if (tableName.includes('mapping') || table === 'mappings') {
                    results = Array.from(this.store.mappings.values());
                } else if (tableName.includes('call') || table === 'calls') {
                    results = Array.from(this.store.calls.values());
                } else if (tableName.includes('invoice') || table === 'invoices') {
                    results = Array.from(this.store.invoices.values());
                } else if (tableName.includes('publisher') || table === 'publisherConfigs' || tableName.includes('publisher_config')) {
                    results = Array.from(this.store.publisherConfigs.values());
                } else if (tableName.includes('receipt') || table === 'receipts') {
                    results = Array.from(this.store.receipts.values());
                } else if (tableName.includes('meter') || table === 'meters') {
                    results = Array.from(this.store.meters.values());
                } else if (tableName.includes('goal') || table === 'goals') {
                    results = Array.from(this.store.goals.values());
                } else if (tableName.includes('chain_config') || table === 'chainConfigs') {
                    results = Array.from(this.store.chainConfigs.values());
                }
                
                // 如果指定了 select 字段（聚合查询）
                if (selectFields) {
                    return this.handleSelectFields(selectFields, results, table);
                }
                
                // 创建查询构建器，支持链式调用
                const createQueryBuilder = () => {
                    let filteredResults = results;
                    let appliedLimit: number | null = null;
                    
                    const builder = {
                        where: (condition: any) => {
                            filteredResults = filteredResults.filter(item => evaluateCondition(item, condition));
                            return {
                                ...builder,
                                limit: (n: number) => {
                                    appliedLimit = n;
                                    return filteredResults.slice(0, n);
                                }
                            };
                        },
                        limit: (n: number) => {
                            appliedLimit = n;
                            return {
                                where: (condition: any) => {
                                    filteredResults = filteredResults.filter(item => evaluateCondition(item, condition));
                                    return filteredResults.slice(0, n);
                                },
                                orderBy: (key: any) => ({
                                    where: (condition: any) => {
                                        filteredResults = filteredResults.filter(item => evaluateCondition(item, condition));
                                        let sortKey = '';
                                        if (typeof key === 'string') {
                                            sortKey = key;
                                        } else {
                                            sortKey = key?.name || key?.column?.name || 'timestamp';
                                        }
                                        const parts = sortKey.split('.');
                                        const finalKey = parts[parts.length - 1];
                                        filteredResults.sort((a, b) => {
                                            const aVal = a[finalKey];
                                            const bVal = b[finalKey];
                                            if (aVal instanceof Date && bVal instanceof Date) {
                                                return aVal.getTime() - bVal.getTime();
                                            }
                                            return String(aVal).localeCompare(String(bVal));
                                        });
                                        return filteredResults.slice(0, n);
                                    }
                                })
                            };
                        },
                        orderBy: (key: any) => ({
                            where: (condition: any) => {
                                filteredResults = filteredResults.filter(item => evaluateCondition(item, condition));
                                let sortKey = '';
                                if (typeof key === 'string') {
                                    sortKey = key;
                                } else {
                                    sortKey = key?.name || key?.column?.name || 'timestamp';
                                }
                                const parts = sortKey.split('.');
                                const finalKey = parts[parts.length - 1];
                                filteredResults.sort((a, b) => {
                                    const aVal = a[finalKey];
                                    const bVal = b[finalKey];
                                    if (aVal instanceof Date && bVal instanceof Date) {
                                        return aVal.getTime() - bVal.getTime();
                                    }
                                    return String(aVal).localeCompare(String(bVal));
                                });
                                return {
                                    limit: (n: number) => filteredResults.slice(0, n),
                                    // 如果没有 limit，返回所有结果
                                    get value() { return filteredResults; }
                                };
                            },
                            limit: (n: number) => {
                                let sortKey = '';
                                if (typeof key === 'string') {
                                    sortKey = key;
                                } else {
                                    sortKey = key?.name || key?.column?.name || 'timestamp';
                                }
                                const parts = sortKey.split('.');
                                const finalKey = parts[parts.length - 1];
                                filteredResults.sort((a, b) => {
                                    const aVal = a[finalKey];
                                    const bVal = b[finalKey];
                                    if (aVal instanceof Date && bVal instanceof Date) {
                                        return aVal.getTime() - bVal.getTime();
                                    }
                                    return String(aVal).localeCompare(String(bVal));
                                });
                                return {
                                    where: (condition: any) => {
                                        filteredResults = filteredResults.filter(item => evaluateCondition(item, condition));
                                        return filteredResults.slice(0, n);
                                    }
                                };
                            }
                        }),
                        groupBy: (key: any) => {
                            let sortKey = '';
                            if (typeof key === 'string') {
                                sortKey = key;
                            } else {
                                sortKey = key?.name || key?.column?.name || 'id';
                            }
                            const parts = sortKey.split('.');
                            const finalKey = parts[parts.length - 1];
                            const grouped = new Map<any, any[]>();
                            for (const item of filteredResults) {
                                const groupKey = item[finalKey];
                                if (!grouped.has(groupKey)) {
                                    grouped.set(groupKey, []);
                                }
                                grouped.get(groupKey)!.push(item);
                            }
                            return Array.from(grouped.entries()).map(([k, v]) => ({ [finalKey]: k, count: v.length }));
                        }
                    };
                    
                    return builder;
                };
                
                return createQueryBuilder();
            }
        };
    }

    insert(table: any) {
        return {
            values: async (values: any) => {
                const records = Array.isArray(values) ? values : [values];
                const inserted: any[] = [];
                
                // 获取表名
                let tableName = '';
                if (typeof table === 'string') {
                    tableName = table;
                } else if (table?.name) {
                    tableName = table.name;
                } else if (table?._ && table._[Symbol.for('drizzle:Name')]) {
                    tableName = table._[Symbol.for('drizzle:Name')];
                } else {
                    tableName = table?.config?.name || 'unknown';
                }
                
                for (const value of records) {
                    const id = value.id || crypto.randomUUID();
                    const now = new Date();
                    
                    if (tableName.includes('mapping') || table === 'mappings') {
                        const mapping: Mapping = {
                            id,
                            originalUrl: value.originalUrl || '',
                            publisherId: value.publisherId || '',
                            kind: value.kind || 'mcp',
                            gatewayUrl: value.gatewayUrl || '',
                            enable402: value.enable402 ?? true,
                            settlementToken: value.settlementToken || 'USDC',
                            chainId: value.chainId || 56,
                            defaultMethod: value.defaultMethod || 'GET',
                            customHeaders: value.customHeaders || null,
                            mcpEndpoint: value.mcpEndpoint || null,
                            mcpConnectionConfig: value.mcpConnectionConfig || null,
                            mcpRequestBody: value.mcpRequestBody || null,
                            createdAt: value.createdAt || now,
                            updatedAt: value.updatedAt || now,
                            isActive: value.isActive ?? true
                        } as Mapping;
                        this.store.mappings.set(id, mapping);
                        inserted.push(mapping);
                    } else if (tableName.includes('call') || table === 'calls') {
                        const call: Call = {
                            id,
                            mappingId: value.mappingId || '',
                            callerId: value.callerId || '',
                            timestamp: value.timestamp || now,
                            durationMs: value.durationMs || 0,
                            reqBytes: value.reqBytes || 0,
                            respBytes: value.respBytes || 0,
                            status: value.status || 200,
                            fingerprint: value.fingerprint || undefined,
                            errorMessage: value.errorMessage || undefined
                        } as Call;
                        this.store.calls.set(id, call);
                        inserted.push(call);
                    } else if (tableName.includes('meter') || table === 'meters') {
                        const meter: Meter = {
                            id,
                            callId: value.callId || '',
                            policy: value.policy || 'flat_per_call',
                            units: value.units || 0,
                            unit: value.unit || 'CREDIT'
                        } as Meter;
                        this.store.meters.set(id, meter);
                        inserted.push(meter);
                    } else if (tableName.includes('receipt') || table === 'receipts') {
                        const receipt: Receipt = {
                            id,
                            callId: value.callId || '',
                            receiptHash: value.receiptHash || '',
                            signature: value.signature || '',
                            chainHint: value.chainHint || 'BNB',
                            createdAt: value.createdAt || now
                        } as Receipt;
                        this.store.receipts.set(id, receipt);
                        inserted.push(receipt);
                    } else if (tableName.includes('invoice') || table === 'invoices') {
                        const invoice: Invoice = {
                            id,
                            callerId: value.callerId || '',
                            period: value.period || new Date().toISOString().slice(0, 7),
                            amount: value.amount || '0',
                            status: value.status || 'pending',
                            chainId: value.chainId || 56,
                            token: value.token || 'USDC',
                            createdAt: value.createdAt || now,
                            paidAt: value.paidAt || undefined
                        } as Invoice;
                        this.store.invoices.set(id, invoice);
                    } else if (tableName.includes('publisher') || table === 'publisherConfigs') {
                        const publisherId = value.publisherId || id;
                        const config: PublisherConfig = {
                            publisherId,
                            pricingJson: value.pricingJson || {},
                            splitsJson: value.splitsJson || {},
                            walletAddr: value.walletAddr || '',
                            chainPref: value.chainPref || 'BNB',
                            incentivesJson: value.incentivesJson || {},
                            createdAt: value.createdAt || now,
                            updatedAt: value.updatedAt || now
                        } as PublisherConfig;
                        this.store.publisherConfigs.set(publisherId, config);
                        inserted.push(config);
                    } else if (tableName.includes('goal') || table === 'goals') {
                        const goalId = value.callId || id;
                        const goal: Goal = {
                            callId: goalId,
                            goalType: value.goalType || undefined,
                            goalScore: value.goalScore || undefined,
                            goalSuccess: value.goalSuccess || undefined,
                            feedback: value.feedback || undefined,
                            createdAt: value.createdAt || now
                        } as Goal;
                        this.store.goals.set(goalId, goal);
                        inserted.push(goal);
                    } else if (tableName.includes('chain_config') || table === 'chainConfigs') {
                        const chainId = value.chainId || 56;
                        const chainConfig: ChainConfig = {
                            chainId,
                            name: value.name || 'BNB',
                            rpcUrl: value.rpcUrl || '',
                            registryAddress: value.registryAddress || '',
                            vaultAddress: value.vaultAddress || '',
                            tokens: value.tokens || [],
                            isActive: value.isActive ?? true,
                            createdAt: value.createdAt || now
                        } as ChainConfig;
                        this.store.chainConfigs.set(chainId, chainConfig);
                        inserted.push(chainConfig);
                    }
                }
                
                return {
                    returning: () => inserted
                };
            }
        };
    }

    update(table: any) {
        return {
            set: (updates: any) => ({
                where: (condition: any) => {
                    let results: any[] = [];
                    
                    // 获取表名
                    let tableName = '';
                    if (typeof table === 'string') {
                        tableName = table;
                    } else if (table?.name) {
                        tableName = table.name;
                    } else if (table?._ && table._[Symbol.for('drizzle:Name')]) {
                        tableName = table._[Symbol.for('drizzle:Name')];
                    } else {
                        tableName = table?.config?.name || 'unknown';
                    }
                    
                    if (tableName.includes('mapping') || table === 'mappings') {
                        results = Array.from(this.store.mappings.values());
                    } else if (tableName.includes('invoice') || table === 'invoices') {
                        results = Array.from(this.store.invoices.values());
                    } else if (tableName.includes('publisher') || table === 'publisherConfigs' || tableName.includes('publisher_config')) {
                        results = Array.from(this.store.publisherConfigs.values());
                    } else if (tableName.includes('receipt') || table === 'receipts') {
                        results = Array.from(this.store.receipts.values());
                    } else if (tableName.includes('meter') || table === 'meters') {
                        results = Array.from(this.store.meters.values());
                    } else if (tableName.includes('goal') || table === 'goals') {
                        results = Array.from(this.store.goals.values());
                    } else if (tableName.includes('chain_config') || table === 'chainConfigs') {
                        results = Array.from(this.store.chainConfigs.values());
                    }
                    
                    const updated: any[] = [];
                    for (const item of results) {
                        if (evaluateCondition(item, condition)) {
                            const updatedItem = { ...item, ...updates, updatedAt: new Date() };
                            if (table === 'mappings' || (table && table.name === 'mappings')) {
                                this.store.mappings.set(item.id, updatedItem);
                            } else if (table === 'invoices' || (table && table.name === 'invoices')) {
                                this.store.invoices.set(item.id, updatedItem);
                            } else if (table === 'publisherConfigs' || (table && table.name === 'publisher_configs')) {
                                this.store.publisherConfigs.set(item.publisherId, updatedItem);
                            } else if (table === 'receipts' || (table && table.name === 'receipts')) {
                                this.store.receipts.set(item.id, updatedItem);
                            } else if (table === 'meters' || (table && table.name === 'meters')) {
                                this.store.meters.set(item.id, updatedItem);
                            } else if (table === 'goals' || (table && table.name === 'goals')) {
                                this.store.goals.set(item.callId, updatedItem);
                            } else if (table === 'chainConfigs' || (table && table.name === 'chain_configs')) {
                                this.store.chainConfigs.set(item.chainId, updatedItem);
                            }
                            updated.push(updatedItem);
                        }
                    }
                    
                    return {
                        returning: async () => updated
                    };
                }
            })
        };
    }
}

// 导出内存数据库实例
export const db = new MemoryDB();

// 导出 schema（为了兼容性保留，但实际上不再使用）
export * from './schema';
export * from './types';