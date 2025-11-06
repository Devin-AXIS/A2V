import { NextRequest } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { getConfigById } from '@/lib/database';

// EventSource 实例类型（基于 eventsource 包）
interface EventSourceInstance {
    url: string;
    readyState: number;
    withCredentials: boolean;
    CONNECTING: number;
    OPEN: number;
    CLOSED: number;
    onopen: ((event: any) => void) | null;
    onmessage: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    close(): void;
    addEventListener(type: string, listener: (event: any) => void): void;
    removeEventListener(type: string, listener: (event: any) => void): void;
    dispatchEvent(event: any): boolean;
}

// EventSource 构造函数类型
type EventSourceConstructor = new (url: string, eventSourceInitDict?: any) => EventSourceInstance;

// 获取 EventSource 构造函数（兼容不同的导入方式）
function getEventSource(): EventSourceConstructor {
    if (typeof globalThis.EventSource !== 'undefined') {
        return globalThis.EventSource as EventSourceConstructor;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const EventSourceModule = require('eventsource');
    // eventsource 包导出的 EventSource 类在其 EventSource 属性中
    const EventSourceClass = EventSourceModule.EventSource || EventSourceModule.default?.EventSource || EventSourceModule.default || EventSourceModule;
    if (typeof EventSourceClass === 'function') {
        return EventSourceClass as EventSourceConstructor;
    }
    throw new Error('无法加载 EventSource');
}

// 存储活跃的代理会话
interface ProxySession {
    configId: string;
    mcpClient: Client;
    transport: StdioClientTransport | SSEClientTransport;
    eventSource?: EventSourceInstance;
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

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
    console.log('[SSE] OPTIONS 预检请求');
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ configId: string }> | { configId: string } }
) {
    console.log('[SSE] GET 请求开始');
    
    try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const { configId } = resolvedParams;
        
        console.log('[SSE] configId:', configId);

        if (!configId) {
            console.error('[SSE] 缺少配置ID');
            return new Response(
                JSON.stringify({ error: '缺少配置ID' }),
                { 
                    status: 400, 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    } 
                }
            );
        }

        // 创建SSE响应流
        const stream = new ReadableStream({
            async start(controller) {
            const encoder = new TextEncoder();
            let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            let mcpClient: Client | null = null;
            let transport: StdioClientTransport | SSEClientTransport | null = null;
            let eventSource: EventSourceInstance | null = null;
            const EventSource = getEventSource();

            try {
                // 读取配置
                const config = getConfigById(configId);
                if (!config) {
                    const errorMsg = { type: 'error', error: '配置不存在' };
                    sendSSEMessage(controller, errorMsg);
                    controller.close();
                    return;
                }

                // 发送连接成功消息，包含代理连接ID
                const proxyConnectionId = `proxy_${configId}`;
                sendSSEMessage(controller, {
                    type: 'connected',
                    message: '代理连接已建立',
                    connectionId: proxyConnectionId,
                    isProxy: true,
                    configId: configId
                });
                console.log(`[MCP Proxy] 发送连接成功消息，connectionId: ${proxyConnectionId}`);

                // 建立到实际MCP服务器的连接
                mcpClient = new Client(
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

                // 包装transport以拦截消息
                const originalTransport = transport;
                const wrappedTransport = {
                    ...originalTransport,
                    // 拦截发送消息（如果是SSE）
                    async send(message: any) {
                        if (originalTransport.send) {
                            return originalTransport.send(message);
                        }
                    },
                };

                await mcpClient.connect(transport);
                console.log(`[MCP Proxy] 已连接到实际MCP服务器，配置ID: ${configId}, 会话ID: ${sessionId}`);

                // 保存会话（先保存，这样后续获取工具等操作可以使用）
                const sessions = getProxySessions();
                sessions.set(sessionId, {
                    configId,
                    mcpClient,
                    transport,
                    eventSource: eventSource || undefined,
                    messageQueue: [],
                    controller,
                });

                // 主动获取工具、资源和提示词，并发送给前端
                try {
                    console.log('[MCP Proxy] 开始获取工具、资源和提示词...');

                    // 并行获取所有信息
                    const [toolsResult, resourcesResult, promptsResult] = await Promise.allSettled([
                        mcpClient.listTools().catch(err => {
                            console.log('[MCP Proxy] 获取工具失败:', err.message);
                            return { tools: [] };
                        }),
                        mcpClient.listResources().catch(err => {
                            console.log('[MCP Proxy] 获取资源失败:', err.message);
                            return { resources: [] };
                        }),
                        mcpClient.listPrompts().catch(err => {
                            console.log('[MCP Proxy] 获取提示词失败:', err.message);
                            return { prompts: [] };
                        }),
                    ]);

                    // 处理工具
                    if (toolsResult.status === 'fulfilled') {
                        const tools = toolsResult.value?.tools || [];
                        console.log(`[MCP Proxy] 获取到 ${tools.length} 个工具`);
                        sendSSEMessage(controller, {
                            type: 'tools',
                            tools: tools,
                        });
                    }

                    // 处理资源
                    if (resourcesResult.status === 'fulfilled') {
                        const resources = resourcesResult.value?.resources || [];
                        console.log(`[MCP Proxy] 获取到 ${resources.length} 个资源`);
                        sendSSEMessage(controller, {
                            type: 'resources',
                            resources: resources,
                        });
                    }

                    // 处理提示词
                    if (promptsResult.status === 'fulfilled') {
                        const prompts = promptsResult.value?.prompts || [];
                        console.log(`[MCP Proxy] 获取到 ${prompts.length} 个提示词`);
                        sendSSEMessage(controller, {
                            type: 'prompts',
                            prompts: prompts,
                        });
                    }
                } catch (error: any) {
                    console.error('[MCP Proxy] 获取工具/资源/提示词时出错:', error);
                    // 不阻断连接，只是记录错误
                }

                // 监听MCP服务器的响应（通过SSE EventSource）
                if (config.connectionType === 'url' || config.connectionType === 'script') {
                    const targetUrl = config.connectionType === 'url'
                        ? connectionConfig.url
                        : (() => {
                            const scriptData = typeof connectionConfig.script === 'string'
                                ? JSON.parse(connectionConfig.script)
                                : connectionConfig.script;
                            return scriptData.url || scriptData.sse || (scriptData.server && scriptData.server.url);
                        })();

                    if (targetUrl) {
                        eventSource = new EventSource(targetUrl);

                        eventSource.onmessage = (event) => {
                            try {
                                const data = JSON.parse(event.data);

                                // 在控制台打印所有MCP应用的返回内容
                                console.log('[MCP Proxy] 收到MCP服务器响应:', JSON.stringify(data, null, 2));

                                // 转发给用户端
                                sendSSEMessage(controller, data);
                            } catch (error: any) {
                                console.error('[MCP Proxy] 解析MCP响应失败:', error);
                            }
                        };

                        eventSource.onerror = (error) => {
                            console.error('[MCP Proxy] EventSource错误:', error);
                            sendSSEMessage(controller, {
                                type: 'error',
                                error: 'MCP服务器连接错误'
                            });
                        };

                        eventSource.onopen = () => {
                            console.log('[MCP Proxy] EventSource连接已打开');
                        };

                        // 更新会话中的 eventSource
                        const currentSession = sessions.get(sessionId);
                        if (currentSession) {
                            currentSession.eventSource = eventSource;
                        }
                    }
                }

                // 对于stdio连接，需要通过其他方式监听响应
                // MCP SDK的Client会处理响应，我们需要通过拦截Client的方法来获取响应
                // 暂时先实现SSE的情况

                // 发送初始化完成消息
                sendSSEMessage(controller, {
                    type: 'ready',
                    message: 'MCP代理已就绪',
                    sessionId,
                    config: {
                        id: config.id,
                        title: config.title,
                    }
                });

                // 监听连接关闭
                request.signal.addEventListener('abort', () => {
                    console.log(`[MCP Proxy] 用户端连接已断开，会话ID: ${sessionId}`);
                    cleanup();
                });

                // 清理函数
                const cleanup = () => {
                    if (eventSource) {
                        eventSource.close();
                    }
                    if (mcpClient) {
                        mcpClient.close().catch(console.error);
                    }
                    sessions.delete(sessionId);
                    controller.close();
                };

                // 定期发送心跳以保持连接
                const heartbeatInterval = setInterval(() => {
                    try {
                        sendSSEMessage(controller, { type: 'ping', timestamp: Date.now() });
                    } catch (error) {
                        clearInterval(heartbeatInterval);
                        cleanup();
                    }
                }, 30000); // 每30秒发送一次心跳

                // 清理心跳定时器
                request.signal.addEventListener('abort', () => {
                    clearInterval(heartbeatInterval);
                });

            } catch (error: any) {
                console.error('[MCP Proxy] 错误:', error);
                const errorMsg = {
                    type: 'error',
                    error: error.message || '代理连接失败'
                };
                sendSSEMessage(controller, errorMsg);

                // 清理资源
                if (eventSource) {
                    eventSource.close();
                }
                if (mcpClient && transport) {
                    mcpClient.close().catch(console.error);
                }

                const sessions = getProxySessions();
                sessions.delete(sessionId);

                controller.close();
            }
        },
    });

        console.log('[SSE] 返回 SSE 流响应');
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', // 禁用Nginx缓冲
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error: any) {
        console.error('[SSE] 路由处理错误:', error);
        return new Response(
            JSON.stringify({ 
                error: 'SSE 路由处理失败', 
                message: error.message 
            }),
            { 
                status: 500, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                } 
            }
        );
    }
}
