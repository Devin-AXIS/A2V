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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> | { configId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { configId } = resolvedParams;

    if (!configId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少配置ID',
        },
        { status: 400 }
      );
    }

    // 读取所有配置
    const configs = await readConfigs();

    // 查找指定ID的配置
    const config = configs.find((c: any) => c.id === configId);

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: '配置不存在',
          message: `找不到ID为 ${configId} 的配置`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('获取MCP配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取配置失败',
        message: error.message || '获取MCP配置时发生错误',
      },
      { status: 500 }
    );
  }
}

