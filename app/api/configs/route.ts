import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIGS_DIR = path.join(process.cwd(), 'data', 'mcp-configs');
const CONFIGS_FILE = path.join(CONFIGS_DIR, 'configs.json');

// 读取所有配置
async function readConfigs() {
    try {
        const data = await fs.readFile(CONFIGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('读取配置失败:', error);
        return [];
    }
}

export async function GET(request: NextRequest) {
    try {
        const configs = await readConfigs();

        // 返回配置列表（不包含详细的连接配置，只返回基本信息）
        const configList = configs.map((config: any) => ({
            config: config,
            id: config.id,
            title: config.title,
            description: config.description,
            connectionType: config.connectionType,
            createdAt: config.createdAt,
        }));

        // 按创建时间倒序排列（最新的在前）
        configList.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            success: true,
            configs: configList,
            total: configList.length,
        });
    } catch (error: any) {
        console.error('获取配置列表失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取配置列表失败',
                message: error.message || '获取配置列表时发生错误',
            },
            { status: 500 }
        );
    }
}

