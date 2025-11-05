import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

interface MCPConfig {
    id: string;
    title: string;
    description: string;
    icon?: string; // 图片URL，不再是base64
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
async function readConfigs(): Promise<MCPConfig[]> {
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
async function writeConfigs(configs: MCPConfig[]) {
    try {
        await ensureDir();
        await fs.writeFile(CONFIGS_FILE, JSON.stringify(configs, null, 2), 'utf-8');
    } catch (error) {
        console.error('写入配置失败:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { title, description, icon, connectionType, connectionConfig } = await request.json();

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
            connectionType,
            connectionConfig,
            createdAt: new Date().toISOString(),
        };

        // 读取现有配置
        const configs = await readConfigs();

        // 添加新配置
        configs.push(newConfig);

        // 保存配置
        await writeConfigs(configs);

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

