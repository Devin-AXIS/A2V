import { Pool } from 'pg';
import * as schema from '../../drizzle/schema';
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: Pool;
};
export declare function pingDB(): Promise<boolean>;
export declare function closeDB(): Promise<void>;
//# sourceMappingURL=index.d.ts.map