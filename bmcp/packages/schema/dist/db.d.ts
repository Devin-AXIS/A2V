import postgres from 'postgres';
import * as schema from './schema';
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
export * from './schema';
export * from './types';
//# sourceMappingURL=db.d.ts.map