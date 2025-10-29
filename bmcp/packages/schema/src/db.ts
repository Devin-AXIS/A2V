import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 数据库连接
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/bmcp';

// 创建数据库连接
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// 导出 schema
export * from './schema';
export * from './types';
