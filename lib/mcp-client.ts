// MCP客户端连接管理
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// 在 Node.js 环境中设置 EventSource polyfill
if (typeof globalThis.EventSource === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const EventSourceModule = require('eventsource');
    // eventsource 包导出的 EventSource 类在其 EventSource 属性中
    const EventSourceConstructor = EventSourceModule.EventSource || EventSourceModule.default?.EventSource || EventSourceModule.default || EventSourceModule;
    if (typeof EventSourceConstructor === 'function') {
        globalThis.EventSource = EventSourceConstructor;
    } else {
        throw new Error('无法加载 EventSource polyfill');
    }
}

interface ClientData {
    client: Client;
    transport: StdioClientTransport | SSEClientTransport;
}

// 使用 globalThis 存储活跃的MCP客户端连接，避免开发模式热重载时丢失
// 在 TypeScript 中需要声明 globalThis 的类型
declare global {
    // eslint-disable-next-line no-var
    var __mcpActiveClients: Map<string, ClientData> | undefined;
}

// 获取或创建全局的 activeClients Map
function getActiveClients(): Map<string, ClientData> {
    if (typeof globalThis !== 'undefined') {
        if (!globalThis.__mcpActiveClients) {
            globalThis.__mcpActiveClients = new Map<string, ClientData>();
            console.log('[MCP Client] 初始化全局连接存储');
        }
        return globalThis.__mcpActiveClients;
    }
    // 如果没有 globalThis，创建新的 Map（理论上不应该发生）
    return new Map<string, ClientData>();
}

// 存储活跃的MCP客户端连接（通过函数访问，确保使用全局存储）
export const activeClients = {
    get size() {
        return getActiveClients().size;
    },
    get: (key: string) => getActiveClients().get(key),
    set: (key: string, value: ClientData) => {
        getActiveClients().set(key, value);
        return getActiveClients();
    },
    has: (key: string) => getActiveClients().has(key),
    delete: (key: string) => getActiveClients().delete(key),
    clear: () => getActiveClients().clear(),
    keys: () => getActiveClients().keys(),
    values: () => getActiveClients().values(),
    entries: () => getActiveClients().entries(),
    forEach: (callbackfn: (value: ClientData, key: string, map: Map<string, ClientData>) => void) => {
        getActiveClients().forEach(callbackfn);
    },
    [Symbol.iterator]: () => getActiveClients()[Symbol.iterator](),
};

export async function connectMCP(
    urlOrCommand: string,
    args?: string[],
    connectionId?: string
): Promise<string> {
    if (!urlOrCommand) {
        throw new Error('缺少连接参数（URL 或命令）');
    }

    const client = new Client(
        {
            name: 'mcp-web-client',
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

    let transport: StdioClientTransport | SSEClientTransport;

    // 判断是 URL 还是命令行
    if (urlOrCommand.startsWith('http://') || urlOrCommand.startsWith('https://')) {
        // SSE 连接
        try {
            const url = new URL(urlOrCommand);

            // 检测是否是前端页面 URL（包含 configId 或指向根路径的页面）
            const isFrontendPage =
                url.searchParams.has('configId') ||
                url.pathname === '/' ||
                url.pathname === '' ||
                (!url.pathname.includes('/sse') && !url.pathname.includes('/mcp') && !url.pathname.includes('/api'));

            if (isFrontendPage) {
                const configId = url.searchParams.get('configId');
                if (configId) {
                    throw new Error(
                        `您提供的是前端页面 URL，不是 MCP 服务器的 SSE 端点。\n` +
                        `如果您想使用配置 ID "${configId}" 连接，请使用以下方式之一：\n` +
                        `1. 访问 /config/${configId} 页面来自动连接\n` +
                        `2. 在"配置管理"中查看该配置的实际 MCP 服务器 URL\n` +
                        `3. 在连接表单中输入 MCP 服务器的 SSE URL（通常以 /sse 结尾）`
                    );
                } else {
                    throw new Error(
                        `您提供的是前端页面 URL，不是 MCP 服务器的 SSE 端点。\n` +
                        `请提供 MCP 服务器的 SSE URL（例如：https://mcp.example.com/sse）`
                    );
                }
            }

            transport = new SSEClientTransport(url);
        } catch (error: any) {
            // 如果是我们抛出的错误，直接抛出
            if (error.message && (error.message.includes('前端页面') || error.message.includes('SSE 端点'))) {
                throw error;
            }
            throw new Error(`无效的 URL: ${error.message}`);
        }
    } else {
        // Stdio 连接（命令行）
        if (!args) {
            throw new Error('使用命令行连接时，必须提供 args 参数');
        }
        transport = new StdioClientTransport({
            command: urlOrCommand,
            args: args || [],
        });
    }

    try {
        await client.connect(transport);
        // connect() 方法会自动处理初始化流程，无需手动调用 initialize()
    } catch (error: any) {
        // 如果是 SSE 连接失败，检查是否是内容类型错误
        if (transport instanceof SSEClientTransport) {
            const errorMessage = error.message || String(error);
            if (errorMessage.includes('text/event-stream') || errorMessage.includes('Invalid content type')) {
                throw new Error(
                    `SSE 连接失败：服务器未返回正确的 SSE 流（text/event-stream）。\n` +
                    `这可能是因为：\n` +
                    `1. URL 不正确（您提供的是前端页面 URL 而不是 MCP SSE 端点）\n` +
                    `2. MCP 服务器未正确配置 SSE 端点\n` +
                    `3. URL 指向的不是 MCP 服务器\n\n` +
                    `请确认您使用的是 MCP 服务器的 SSE URL（通常以 /sse 结尾）`
                );
            }
        }
        throw error;
    }

    const id = connectionId || `conn_${Date.now()}`;
    const clientsMap = getActiveClients();
    clientsMap.set(id, { client, transport });

    console.log(`[MCP Client] 连接成功，ID: ${id}`);
    console.log(`[MCP Client] 当前活跃连接数: ${clientsMap.size}`);
    console.log(`[MCP Client] 所有连接ID:`, Array.from(clientsMap.keys()));

    return id;
}

export async function disconnectMCP(connectionId: string): Promise<void> {
    const clientsMap = getActiveClients();
    const clientData = clientsMap.get(connectionId);
    if (!clientData) {
        throw new Error('连接不存在');
    }

    const { client } = clientData;
    await client.close();
    clientsMap.delete(connectionId);
    console.log(`[MCP Client] 已断开连接: ${connectionId}`);
}

export function getClient(connectionId: string): Client {
    const clientsMap = getActiveClients();
    console.log(`[MCP Client] 查找连接: ${connectionId}`);
    console.log(`[MCP Client] 当前活跃连接:`, Array.from(clientsMap.keys()));
    console.log(`[MCP Client] 连接总数: ${clientsMap.size}`);

    const clientData = clientsMap.get(connectionId);
    if (!clientData) {
        console.error(`[MCP Client] 连接不存在: ${connectionId}`);
        console.error(`[MCP Client] 可用连接ID:`, Array.from(clientsMap.keys()));
        throw new Error(`连接不存在: ${connectionId}`);
    }

    console.log(`[MCP Client] 找到连接: ${connectionId}`);
    return clientData.client;
}
