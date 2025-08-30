import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as schema from '../../drizzle/schema';
const PG_URL = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
const pool = new Pool({
    connectionString: PG_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: false,
});
export const db = drizzle(pool, { schema });
export async function pingDB() {
    try {
        const result = await pool.query('SELECT 1 as ok');
        return result.rows[0].ok === 1;
    }
    catch (error) {
        console.error('Database ping failed:', error);
        return false;
    }
}
export async function closeDB() {
    await pool.end();
}
//# sourceMappingURL=index.js.map