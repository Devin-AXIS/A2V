/**
 * 数据迁移脚本：将 JSON 文件数据迁移到 SQLite 数据库
 * 
 * 使用方法：
 *   npx tsx scripts/migrate-to-sqlite.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createConfig, upsertProfile, getAllConfigs, getAllProfiles, MCPConfig, UserProfile } from '../lib/database';

const CONFIGS_FILE = path.join(process.cwd(), 'data', 'mcp-configs', 'configs.json');
const PROFILES_FILE = path.join(process.cwd(), 'data', 'user-profiles', 'profiles.json');

async function migrateConfigs() {
    try {
        // 检查是否已有数据
        const existingConfigs = getAllConfigs();
        if (existingConfigs.length > 0) {
            console.log(`⚠️  数据库中已存在 ${existingConfigs.length} 个配置，跳过迁移`);
            return;
        }

        // 读取 JSON 文件
        const data = await fs.readFile(CONFIGS_FILE, 'utf-8');
        const configs: MCPConfig[] = JSON.parse(data);

        if (!Array.isArray(configs) || configs.length === 0) {
            console.log('ℹ️  JSON 文件中没有配置数据');
            return;
        }

        console.log(`📦 开始迁移 ${configs.length} 个 MCP 配置...`);

        // 迁移每个配置
        for (const config of configs) {
            try {
                createConfig(config);
                console.log(`  ✓ 已迁移配置: ${config.id} - ${config.title}`);
            } catch (error: any) {
                console.error(`  ✗ 迁移配置失败 ${config.id}:`, error.message);
            }
        }

        console.log(`✅ MCP 配置迁移完成！共迁移 ${configs.length} 个配置`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log('ℹ️  MCP 配置文件不存在，跳过迁移');
        } else {
            console.error('❌ 迁移 MCP 配置失败:', error);
        }
    }
}

async function migrateProfiles() {
    try {
        // 检查是否已有数据
        const existingProfiles = getAllProfiles();
        if (Object.keys(existingProfiles).length > 0) {
            console.log(`⚠️  数据库中已存在 ${Object.keys(existingProfiles).length} 个用户配置，跳过迁移`);
            return;
        }

        // 读取 JSON 文件
        const data = await fs.readFile(PROFILES_FILE, 'utf-8');
        const profiles: Record<string, UserProfile> = JSON.parse(data);

        if (!profiles || Object.keys(profiles).length === 0) {
            console.log('ℹ️  JSON 文件中没有用户配置数据');
            return;
        }

        const profileCount = Object.keys(profiles).length;
        console.log(`📦 开始迁移 ${profileCount} 个用户配置...`);

        // 迁移每个用户配置
        for (const [address, profile] of Object.entries(profiles)) {
            try {
                // 确保地址是小写
                const normalizedProfile: UserProfile = {
                    ...profile,
                    address: address.toLowerCase(),
                };
                upsertProfile(normalizedProfile);
                console.log(`  ✓ 已迁移用户配置: ${address}`);
            } catch (error: any) {
                console.error(`  ✗ 迁移用户配置失败 ${address}:`, error.message);
            }
        }

        console.log(`✅ 用户配置迁移完成！共迁移 ${profileCount} 个配置`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log('ℹ️  用户配置文件不存在，跳过迁移');
        } else {
            console.error('❌ 迁移用户配置失败:', error);
        }
    }
}

async function main() {
    console.log('🚀 开始数据迁移...\n');

    await migrateConfigs();
    console.log('');
    await migrateProfiles();

    console.log('\n✨ 所有数据迁移完成！');
    console.log('\n💡 提示：迁移完成后，您可以备份并删除旧的 JSON 文件（可选）');
    console.log(`   - ${CONFIGS_FILE}`);
    console.log(`   - ${PROFILES_FILE}`);
}

main().catch(console.error);

