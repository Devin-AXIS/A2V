import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { getConfigById } from '@/lib/database';

// 存储活跃的代理会话（与sse路由共享）
interface ProxySession {
    configId: string;
    mcpClient: any;
    transport: any;
    eventSource?: any;
    messageQueue: any[];
    controller?: ReadableStreamDefaultController<Uint8Array>; // 改为可选，因为临时会话不需要
}

declare global {
    // eslint-disable-next-line no-var
    var __mcpProxySessions: Map<string, ProxySession> | undefined;
}

// 获取代理会话
function getProxySessions(): Map<string, ProxySession> {
    if (!globalThis.__mcpProxySessions) {
        globalThis.__mcpProxySessions = new Map<string, ProxySession>();
    }
    return globalThis.__mcpProxySessions;
}

// 创建临时MCP客户端会话（用于非SSE请求）
async function createTemporarySession(configId: string, config: any): Promise<Client> {
    console.log(`[Proxy Tools] 创建临时会话，configId: ${configId}`);

    const mcpClient = new Client(
        {
            name: 'mcp-proxy-server',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
                prompts: {},
                resources: {},
            },
        }
    );

    const connectionConfig = config.connectionConfig || {};
    let transport: StdioClientTransport | SSEClientTransport | null = null;

    // 根据配置类型建立连接
    if (config.connectionType === 'url' && connectionConfig.url) {
        // SSE连接
        const url = new URL(connectionConfig.url);
        transport = new SSEClientTransport(url);
    } else if (config.connectionType === 'command' && connectionConfig.command) {
        // Stdio连接
        transport = new StdioClientTransport({
            command: connectionConfig.command,
            args: connectionConfig.args || [],
        });
    } else if (config.connectionType === 'script' && connectionConfig.script) {
        // 从脚本中提取URL
        const scriptData = typeof connectionConfig.script === 'string'
            ? JSON.parse(connectionConfig.script)
            : connectionConfig.script;
        const scriptUrl = scriptData.url || scriptData.sse || (scriptData.server && scriptData.server.url);
        if (scriptUrl) {
            transport = new SSEClientTransport(new URL(scriptUrl));
        } else {
            throw new Error('脚本中未找到有效的URL');
        }
    } else {
        throw new Error(`不支持的连接类型: ${config.connectionType}`);
    }

    if (!transport) {
        throw new Error('无法创建传输层');
    }

    await mcpClient.connect(transport);
    console.log(`[Proxy Tools] 临时会话连接成功，configId: ${configId}`);

    // 保存临时会话
    const sessionId = `temp_${configId}_${Date.now()}`;
    const sessions = getProxySessions();
    sessions.set(sessionId, {
        configId,
        mcpClient,
        transport,
        messageQueue: [],
    });

    return mcpClient;
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
                { success: false, error: '缺少配置ID' },
                { status: 400 }
            );
        }

        // 读取配置
        const config = getConfigById(configId);
        if (!config) {
            return NextResponse.json(
                { success: false, error: '配置不存在' },
                { status: 404 }
            );
        }

        // 查找代理会话（使用最新的会话）
        const sessions = getProxySessions();
        let mcpClient = null;

        // 查找该配置的最新会话
        for (const [sessionId, session] of sessions.entries()) {
            if (session.configId === configId && session.mcpClient) {
                mcpClient = session.mcpClient;
                break;
            }
        }

        // 如果找不到会话，尝试创建临时会话
        if (!mcpClient) {
            try {
                console.log(`[Proxy Tools] 未找到现有会话，尝试创建临时会话，configId: ${configId}`);
                mcpClient = await createTemporarySession(configId, config);
            } catch (error: any) {
                console.error(`[Proxy Tools] 创建临时会话失败:`, error);
                return NextResponse.json(
                    { success: false, error: '代理会话不存在，且无法创建临时会话', message: error.message },
                    { status: 500 }
                );
            }
        }

        // 获取工具列表
        const tools = await mcpClient.listTools();

        return NextResponse.json({
            success: true,
            tools: tools.tools || [],
        });
    } catch (error: any) {
        console.error('[Proxy Tools] 获取工具列表失败:', error);

        if (error.code === -32601 || error.message?.includes('Method not found')) {
            return NextResponse.json({
                success: true,
                tools: [],
                message: '该 MCP 服务器不支持工具功能',
            });
        }

        return NextResponse.json(
            {
                success: false,
                error: '获取工具列表失败',
                message: error.message,
            },
            { status: 500 }
        );
    }
}

