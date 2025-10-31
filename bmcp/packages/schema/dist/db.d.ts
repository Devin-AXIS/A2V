declare class MemoryDB {
    private store;
    private handleSelectFields;
    private computeSelectFields;
    private handleGroupBy;
    select(selectFields?: any): {
        from: (table: any) => any;
    };
    insert(table: any): {
        values: (values: any) => Promise<{
            returning: () => any[];
        }>;
    };
    update(table: any): {
        set: (updates: any) => {
            where: (condition: any) => {
                returning: () => Promise<any[]>;
            };
        };
    };
}
export declare const db: MemoryDB;
export * from './schema';
export * from './types';
//# sourceMappingURL=db.d.ts.map