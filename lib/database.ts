import Database from 'better-sqlite3';
import path from 'path';
import { promises as fs } from 'fs';

// 数据库文件路径
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.db');

// 确保目录存在
async function ensureDir() {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
    } catch (error) {
        console.error('创建数据库目录失败:', error);
    }
}

// 数据库实例（单例模式）
let dbInstance: Database.Database | null = null;

// 获取数据库实例
function getDatabase(): Database.Database {
    if (!dbInstance) {
        // 确保目录存在（同步版本，因为 better-sqlite3 是同步的）
        const fs = require('fs');
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
        
        dbInstance = new Database(DB_FILE);
        
        // 启用 WAL 模式以提高并发性能
        dbInstance.pragma('journal_mode = WAL');
        
        // 初始化表结构
        initializeTables(dbInstance);
    }
    return dbInstance;
}

// 初始化数据库表
function initializeTables(db: Database.Database) {
    // MCP 配置表
    db.exec(`
        CREATE TABLE IF NOT EXISTS mcp_configs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT,
            creator_wallet TEXT,
            connection_type TEXT NOT NULL CHECK(connection_type IN ('url', 'command', 'script')),
            connection_config TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    // 用户配置表
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            address TEXT PRIMARY KEY,
            avatar TEXT,
            name TEXT NOT NULL,
            website TEXT,
            profession TEXT,
            bio TEXT,
            updated_at TEXT NOT NULL
        )
    `);

    // 创建索引以提高查询性能
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_mcp_configs_creator_wallet ON mcp_configs(creator_wallet);
        CREATE INDEX IF NOT EXISTS idx_mcp_configs_created_at ON mcp_configs(created_at);
    `);
}

// MCP Config 接口
export interface MCPConfig {
    id: string;
    title: string;
    description: string;
    icon?: string;
    creatorWallet?: string;
    connectionType: 'url' | 'command' | 'script';
    connectionConfig: {
        user?: any;
        formData?: any;
        url?: string;
        command?: string;
        args?: string[];
        script?: any;
        connectionId?: string;
    };
    createdAt: string;
}

// User Profile 接口
export interface UserProfile {
    address: string;
    avatar: string;
    name: string;
    website: string;
    profession: string;
    bio: string;
    updatedAt: string;
}

// ==================== MCP Configs 操作 ====================

// 获取所有配置
export function getAllConfigs(): MCPConfig[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM mcp_configs ORDER BY created_at DESC').all() as any[];
    
    return rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        icon: row.icon || undefined,
        creatorWallet: row.creator_wallet || undefined,
        connectionType: row.connection_type as 'url' | 'command' | 'script',
        connectionConfig: JSON.parse(row.connection_config),
        createdAt: row.created_at,
    }));
}

// 根据 ID 获取配置
export function getConfigById(configId: string): MCPConfig | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM mcp_configs WHERE id = ?').get(configId) as any;
    
    if (!row) {
        return null;
    }
    
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        icon: row.icon || undefined,
        creatorWallet: row.creator_wallet || undefined,
        connectionType: row.connection_type as 'url' | 'command' | 'script',
        connectionConfig: JSON.parse(row.connection_config),
        createdAt: row.created_at,
    };
}

// 创建配置
export function createConfig(config: MCPConfig): void {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO mcp_configs (id, title, description, icon, creator_wallet, connection_type, connection_config, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
        config.id,
        config.title,
        config.description,
        config.icon || null,
        config.creatorWallet || null,
        config.connectionType,
        JSON.stringify(config.connectionConfig),
        config.createdAt
    );
}

// 更新配置
export function updateConfig(configId: string, config: Partial<MCPConfig>): boolean {
    const db = getDatabase();
    
    // 构建更新字段
    const updates: string[] = [];
    const values: any[] = [];
    
    if (config.title !== undefined) {
        updates.push('title = ?');
        values.push(config.title);
    }
    if (config.description !== undefined) {
        updates.push('description = ?');
        values.push(config.description);
    }
    if (config.icon !== undefined) {
        updates.push('icon = ?');
        values.push(config.icon || null);
    }
    if (config.creatorWallet !== undefined) {
        updates.push('creator_wallet = ?');
        values.push(config.creatorWallet || null);
    }
    if (config.connectionType !== undefined) {
        updates.push('connection_type = ?');
        values.push(config.connectionType);
    }
    if (config.connectionConfig !== undefined) {
        updates.push('connection_config = ?');
        values.push(JSON.stringify(config.connectionConfig));
    }
    
    if (updates.length === 0) {
        return false;
    }
    
    values.push(configId);
    const stmt = db.prepare(`UPDATE mcp_configs SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    
    return result.changes > 0;
}

// 删除配置
export function deleteConfig(configId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM mcp_configs WHERE id = ?');
    const result = stmt.run(configId);
    
    return result.changes > 0;
}

// ==================== User Profiles 操作 ====================

// 获取所有用户配置
export function getAllProfiles(): Record<string, UserProfile> {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM user_profiles').all() as any[];
    
    const profiles: Record<string, UserProfile> = {};
    for (const row of rows) {
        profiles[row.address] = {
            address: row.address,
            avatar: row.avatar || '',
            name: row.name,
            website: row.website || '',
            profession: row.profession || '',
            bio: row.bio || '',
            updatedAt: row.updated_at,
        };
    }
    
    return profiles;
}

// 根据地址获取用户配置
export function getProfileByAddress(address: string): UserProfile | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM user_profiles WHERE address = ?').get(address.toLowerCase()) as any;
    
    if (!row) {
        return null;
    }
    
    return {
        address: row.address,
        avatar: row.avatar || '',
        name: row.name,
        website: row.website || '',
        profession: row.profession || '',
        bio: row.bio || '',
        updatedAt: row.updated_at,
    };
}

// 创建或更新用户配置
export function upsertProfile(profile: UserProfile): void {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO user_profiles (address, avatar, name, website, profession, bio, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(address) DO UPDATE SET
            avatar = excluded.avatar,
            name = excluded.name,
            website = excluded.website,
            profession = excluded.profession,
            bio = excluded.bio,
            updated_at = excluded.updated_at
    `);
    
    stmt.run(
        profile.address.toLowerCase(),
        profile.avatar || null,
        profile.name,
        profile.website || null,
        profile.profession || null,
        profile.bio || null,
        profile.updatedAt
    );
}

// 删除用户配置
export function deleteProfile(address: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM user_profiles WHERE address = ?');
    const result = stmt.run(address.toLowerCase());
    
    return result.changes > 0;
}

// 关闭数据库连接（用于清理）
export function closeDatabase(): void {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}

