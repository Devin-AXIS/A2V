import { NextRequest, NextResponse } from 'next/server';
import { getConfigById } from '@/lib/database';

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

        // 读取指定配置
        const config = getConfigById(configId);

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

