import { NextRequest, NextResponse } from 'next/server';
import { getConfigById, deleteConfig } from '@/lib/database';

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

        // 读取配置
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

        // 从数据库删除配置
        deleteConfig(configId);

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

