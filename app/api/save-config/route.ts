import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createConfig, MCPConfig } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { title, description, icon, connectionType, connectionConfig, creatorWallet } = await request.json();

        // 验证必填字段
        if (!title || !description) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少必填字段',
                    message: '标题和介绍字段不能为空',
                },
                { status: 400 }
            );
        }

        if (!connectionType || !connectionConfig) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少连接配置',
                    message: '连接类型和连接配置不能为空',
                },
                { status: 400 }
            );
        }

        // 如果 icon 是 base64 格式，需要转换（但新上传的应该已经是 URL）
        // 这里只保存 URL，不保存 base64
        let iconUrl = icon;
        if (icon && icon.startsWith('data:image')) {
            // 如果是 base64，忽略它（旧数据兼容，新上传应该已经是 URL）
            console.warn('收到 base64 格式的 icon，已忽略。请使用文件上传 API 上传图片。');
            iconUrl = undefined;
        }

        // 生成唯一ID
        const configId = randomBytes(16).toString('hex');

        // 创建配置对象
        const newConfig: MCPConfig = {
            id: configId,
            title,
            description,
            icon: iconUrl, // 保存图片 URL，而不是 base64
            creatorWallet: creatorWallet ? creatorWallet.toLowerCase() : undefined, // 保存创建者钱包地址（小写）
            connectionType,
            connectionConfig,
            createdAt: new Date().toISOString(),
        };

        // 保存到数据库
        createConfig(newConfig);

        // 生成访问链接
        // 提供两个链接：配置页面链接和代理SSE链接
        const configPageUrl = `http://a2vhub.ipollo.ai/config/${configId}`;
        const proxySseUrl = `http://a2vhub.ipollo.ai/api/proxy/${configId}/sse`;

        return NextResponse.json({
            success: true,
            configId,
            url: configPageUrl, // 保留原有的配置页面链接
            proxyUrl: proxySseUrl, // 新增代理SSE链接，用于直接MCP连接
            message: 'MCP配置保存成功',
        });
    } catch (error: any) {
        console.error('保存MCP配置失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '保存失败',
                message: error.message || '保存MCP配置时发生错误',
            },
            { status: 500 }
        );
    }
}

