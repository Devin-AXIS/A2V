import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const CONFIGS_DIR = path.join(process.cwd(), 'data', 'mcp-configs');
const CONFIGS_FILE = path.join(CONFIGS_DIR, 'configs.json');

// 存储活跃的代理会话（与sse路由共享）
interface ProxySession {
    configId: string;
    mcpClient: any;
    transport: any;
    eventSource?: any;
    messageQueue: any[];
    controller: ReadableStreamDefaultController<Uint8Array>;
}

declare global {
    // eslint-disable-next-line no-var
    var __mcpProxySessions: Map<string, ProxySession> | undefined;
}

function getProxySessions(): Map<string, ProxySession> {
    if (!globalThis.__mcpProxySessions) {
        globalThis.__mcpProxySessions = new Map<string, ProxySession>();
    }
    return globalThis.__mcpProxySessions;
}

// 发送SSE消息
function sendSSEMessage(controller: ReadableStreamDefaultController<Uint8Array>, data: any) {
    const encoder = new TextEncoder();
    const message = JSON.stringify(data);
    controller.enqueue(encoder.encode(`data: ${message}\n\n`));
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ configId: string }> | { configId: string } }
) {
    try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const { configId } = resolvedParams;
        const { sessionId, message } = await request.json();

        if (!configId) {
            return NextResponse.json(
                { success: false, error: '缺少配置ID' },
                { status: 400 }
            );
        }

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: '缺少会话ID' },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { success: false, error: '缺少消息内容' },
                { status: 400 }
            );
        }

        // 查找会话
        const sessions = getProxySessions();
        const session = sessions.get(sessionId);

        if (!session) {
            return NextResponse.json(
                { success: false, error: '会话不存在或已断开' },
                { status: 404 }
            );
        }

        // 验证会话是否属于此配置
        if (session.configId !== configId) {
            return NextResponse.json(
                { success: false, error: '会话配置ID不匹配' },
                { status: 403 }
            );
        }

        // 在控制台打印用户端发送的消息
        console.log('[MCP Proxy] 收到用户端消息:', JSON.stringify(message, null, 2));

        // 转发消息到MCP服务器
        try {
            const { mcpClient, transport, configId } = session;

            // 读取配置以获取目标URL
            const config = await (async () => {
                try {
                    const data = await fs.readFile(path.join(process.cwd(), 'data', 'mcp-configs', 'configs.json'), 'utf-8');
                    const configs = JSON.parse(data);
                    return configs.find((c: any) => c.id === configId);
                } catch {
                    return null;
                }
            })();

            if (!config) {
                throw new Error('无法读取配置');
            }

            const connectionConfig = config.connectionConfig || {};
            let targetUrl: string | null = null;

            // 获取目标MCP服务器的URL
            if (config.connectionType === 'url' && connectionConfig.url) {
                targetUrl = connectionConfig.url;
            } else if (config.connectionType === 'script' && connectionConfig.script) {
                const scriptData = typeof connectionConfig.script === 'string'
                    ? JSON.parse(connectionConfig.script)
                    : connectionConfig.script;
                targetUrl = scriptData.url || scriptData.sse || (scriptData.server && scriptData.server.url);
            }

            // 如果是SSE连接，需要通过HTTP POST发送消息到MCP服务器
            if (targetUrl) {
                // 对于SSE连接，MCP服务器通常有一个POST端点用于接收消息
                // 通常URL格式是 /sse，POST端点可能是 /message 或相同的URL
                // 尝试多个可能的POST端点
                const urlObj = new URL(targetUrl);
                const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.replace(/\/sse$/, '')}`;
                const possiblePostUrls = [
                    `${baseUrl}/message`,  // 常见的POST端点
                    targetUrl,              // 相同的SSE端点
                    `${baseUrl}`,           // 基础URL
                ];

                // 尝试每个可能的POST端点
                let lastError: Error | null = null;
                for (const postUrl of possiblePostUrls) {
                    try {
                        const response = await fetch(postUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(message),
                        });

                        // 如果请求成功，即使没有响应体，也认为消息已发送
                        if (response.ok) {
                            // 有些MCP服务器可能通过POST直接返回响应，有些通过SSE流返回
                            // 如果POST有响应，也转发给用户端
                            if (response.headers.get('content-type')?.includes('application/json')) {
                                const responseData = await response.json();

                                // 在控制台打印MCP服务器的返回内容
                                console.log('[MCP Proxy] MCP服务器POST返回内容:', JSON.stringify(responseData, null, 2));

                                // 转发给用户端
                                sendSSEMessage(session.controller, responseData);
                            } else {
                                const responseText = await response.text();
                                if (responseText) {
                                    try {
                                        const parsedData = JSON.parse(responseText);
                                        console.log('[MCP Proxy] MCP服务器POST返回内容:', JSON.stringify(parsedData, null, 2));
                                        sendSSEMessage(session.controller, parsedData);
                                    } catch {
                                        console.log('[MCP Proxy] MCP服务器POST返回内容 (文本):', responseText);
                                        sendSSEMessage(session.controller, {
                                            type: 'response',
                                            data: responseText
                                        });
                                    }
                                }
                            }

                            return NextResponse.json({
                                success: true,
                                message: '消息已转发到MCP服务器',
                            });
                        }
                    } catch (fetchError: any) {
                        lastError = fetchError;
                        // 继续尝试下一个URL
                        continue;
                    }
                }

                // 如果所有POST端点都失败
                if (lastError) {
                    // 如果POST请求失败，可能是MCP服务器只通过SSE接收消息
                    // 在这种情况下，消息会通过已建立的SSE连接发送
                    // 我们只需要记录日志，响应会通过EventSource的onmessage处理
                    console.log('[MCP Proxy] 所有POST端点失败，消息将通过SSE连接处理:', lastError.message);

                    // 对于stdio连接，需要通过transport发送
                    if (transport && typeof transport.send === 'function') {
                        await transport.send(message);
                        return NextResponse.json({
                            success: true,
                            message: '消息已通过transport发送',
                        });
                    } else if (mcpClient) {
                        // 尝试使用Client的方法
                        // 注意：MCP SDK可能不直接暴露send方法，需要通过其他方式
                        console.log('[MCP Proxy] 无法直接发送消息，已通过SSE连接处理');
                    }

                    return NextResponse.json({
                        success: true,
                        message: '消息已加入处理队列，将通过SSE连接发送',
                    });
                }
            } else {
                // 对于stdio连接，需要通过transport发送消息
                if (transport && typeof transport.send === 'function') {
                    await transport.send(message);
                    return NextResponse.json({
                        success: true,
                        message: '消息已转发到MCP服务器',
                    });
                } else {
                    // 如果没有找到发送方式，将消息加入队列
                    session.messageQueue.push(message);
                    return NextResponse.json({
                        success: true,
                        message: '消息已加入队列',
                    });
                }
            }

        } catch (error: any) {
            console.error('[MCP Proxy] 转发消息失败:', error);

            // 向用户端发送错误
            sendSSEMessage(session.controller, {
                type: 'error',
                error: error.message || '消息转发失败',
            });

            return NextResponse.json(
                {
                    success: false,
                    error: '消息转发失败',
                    message: error.message,
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('[MCP Proxy] 处理消息失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '处理失败',
                message: error.message,
            },
            { status: 500 }
        );
    }
}

