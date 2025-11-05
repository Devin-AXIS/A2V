import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIGS_DIR = path.join(process.cwd(), 'data', 'mcp-configs');
const CONFIGS_FILE = path.join(CONFIGS_DIR, 'configs.json');

// 确保目录存在
async function ensureDir() {
    try {
        await fs.mkdir(CONFIGS_DIR, { recursive: true });
    } catch (error) {
        console.error('创建配置目录失败:', error);
    }
}

// 读取所有配置
async function readConfigs(): Promise<any[]> {
    try {
        await ensureDir();
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

// 写入所有配置
async function writeConfigs(configs: any[]) {
    try {
        await ensureDir();
        await fs.writeFile(CONFIGS_FILE, JSON.stringify(configs, null, 2), 'utf-8');
    } catch (error) {
        console.error('写入配置失败:', error);
        throw error;
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const configId = searchParams.get('id');
        const walletAddress = searchParams.get('wallet');

        // 验证必填参数
        if (!configId) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少配置ID',
                    message: '请提供要删除的配置ID',
                },
                { status: 400 }
            );
        }

        if (!walletAddress) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少钱包地址',
                    message: '请提供钱包地址以验证权限',
                },
                { status: 400 }
            );
        }

        // 读取所有配置
        const configs = await readConfigs();

        // 查找要删除的配置
        const configIndex = configs.findIndex((c: any) => c.id === configId);

        if (configIndex === -1) {
            return NextResponse.json(
                {
                    success: false,
                    error: '配置不存在',
                    message: `找不到ID为 ${configId} 的配置`,
                },
                { status: 404 }
            );
        }

        const config = configs[configIndex];

        // 验证权限：只有创建者才能删除
        const walletLower = walletAddress.toLowerCase();
        const creatorWallet = config.creatorWallet?.toLowerCase();

        if (!creatorWallet || creatorWallet !== walletLower) {
            return NextResponse.json(
                {
                    success: false,
                    error: '权限不足',
                    message: '只有创建者才能删除此应用',
                },
                { status: 403 }
            );
        }

        // 删除配置
        configs.splice(configIndex, 1);

        // 保存配置
        await writeConfigs(configs);

        return NextResponse.json({
            success: true,
            message: '配置删除成功',
        });
    } catch (error: any) {
        console.error('删除配置失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '删除失败',
                message: error.message || '删除配置时发生错误',
            },
            { status: 500 }
        );
    }
}

