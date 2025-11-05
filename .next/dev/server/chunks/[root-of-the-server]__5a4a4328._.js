module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:child_process [external] (node:child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:child_process", () => require("node:child_process"));

module.exports = mod;
}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[project]/new-flow/A2V/lib/mcp-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// MCP客户端连接管理
__turbopack_context__.s([
    "activeClients",
    ()=>activeClients,
    "connectMCP",
    ()=>connectMCP,
    "disconnectMCP",
    ()=>disconnectMCP,
    "getClient",
    ()=>getClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f40$modelcontextprotocol$2b$sdk$40$0$2e$5$2e$0$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$client$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/new-flow/A2V/node_modules/.pnpm/@modelcontextprotocol+sdk@0.5.0/node_modules/@modelcontextprotocol/sdk/dist/client/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f40$modelcontextprotocol$2b$sdk$40$0$2e$5$2e$0$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$client$2f$stdio$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/new-flow/A2V/node_modules/.pnpm/@modelcontextprotocol+sdk@0.5.0/node_modules/@modelcontextprotocol/sdk/dist/client/stdio.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f40$modelcontextprotocol$2b$sdk$40$0$2e$5$2e$0$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$client$2f$sse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/new-flow/A2V/node_modules/.pnpm/@modelcontextprotocol+sdk@0.5.0/node_modules/@modelcontextprotocol/sdk/dist/client/sse.js [app-route] (ecmascript)");
;
;
;
// 在 Node.js 环境中设置 EventSource polyfill
if (typeof globalThis.EventSource === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const EventSourceModule = __turbopack_context__.r("[project]/new-flow/A2V/node_modules/.pnpm/eventsource@4.0.0/node_modules/eventsource/dist/index.cjs [app-route] (ecmascript)");
    // eventsource 包导出的 EventSource 类在其 EventSource 属性中
    const EventSourceConstructor = EventSourceModule.EventSource || EventSourceModule.default?.EventSource || EventSourceModule.default || EventSourceModule;
    if (typeof EventSourceConstructor === 'function') {
        globalThis.EventSource = EventSourceConstructor;
    } else {
        throw new Error('无法加载 EventSource polyfill');
    }
}
// 获取或创建全局的 activeClients Map
function getActiveClients() {
    if (typeof globalThis !== 'undefined') {
        if (!globalThis.__mcpActiveClients) {
            globalThis.__mcpActiveClients = new Map();
            console.log('[MCP Client] 初始化全局连接存储');
        }
        return globalThis.__mcpActiveClients;
    }
    // 如果没有 globalThis，创建新的 Map（理论上不应该发生）
    return new Map();
}
const activeClients = {
    get size () {
        return getActiveClients().size;
    },
    get: (key)=>getActiveClients().get(key),
    set: (key, value)=>{
        getActiveClients().set(key, value);
        return getActiveClients();
    },
    has: (key)=>getActiveClients().has(key),
    delete: (key)=>getActiveClients().delete(key),
    clear: ()=>getActiveClients().clear(),
    keys: ()=>getActiveClients().keys(),
    values: ()=>getActiveClients().values(),
    entries: ()=>getActiveClients().entries(),
    forEach: (callbackfn)=>{
        getActiveClients().forEach(callbackfn);
    },
    [Symbol.iterator]: ()=>getActiveClients()[Symbol.iterator]()
};
async function connectMCP(urlOrCommand, args, connectionId) {
    if (!urlOrCommand) {
        throw new Error('缺少连接参数（URL 或命令）');
    }
    const client = new __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f40$modelcontextprotocol$2b$sdk$40$0$2e$5$2e$0$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$client$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Client"]({
        name: 'mcp-web-client',
        version: '1.0.0'
    }, {
        capabilities: {
            tools: {},
            prompts: {},
            resources: {}
        }
    });
    let transport;
    // 判断是 URL 还是命令行
    if (urlOrCommand.startsWith('http://') || urlOrCommand.startsWith('https://')) {
        // SSE 连接
        try {
            const url = new URL(urlOrCommand);
            // 检测是否是前端页面 URL（包含 configId 或指向根路径的页面）
            const isFrontendPage = url.searchParams.has('configId') || url.pathname === '/' || url.pathname === '' || !url.pathname.includes('/sse') && !url.pathname.includes('/mcp') && !url.pathname.includes('/api');
            if (isFrontendPage) {
                const configId = url.searchParams.get('configId');
                if (configId) {
                    throw new Error(`您提供的是前端页面 URL，不是 MCP 服务器的 SSE 端点。\n` + `如果您想使用配置 ID "${configId}" 连接，请使用以下方式之一：\n` + `1. 访问 /config/${configId} 页面来自动连接\n` + `2. 在"配置管理"中查看该配置的实际 MCP 服务器 URL\n` + `3. 在连接表单中输入 MCP 服务器的 SSE URL（通常以 /sse 结尾）`);
                } else {
                    throw new Error(`您提供的是前端页面 URL，不是 MCP 服务器的 SSE 端点。\n` + `请提供 MCP 服务器的 SSE URL（例如：https://mcp.example.com/sse）`);
                }
            }
            transport = new __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f40$modelcontextprotocol$2b$sdk$40$0$2e$5$2e$0$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$client$2f$sse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SSEClientTransport"](url);
        } catch (error) {
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
        transport = new __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f40$modelcontextprotocol$2b$sdk$40$0$2e$5$2e$0$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$client$2f$stdio$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StdioClientTransport"]({
            command: urlOrCommand,
            args: args || []
        });
    }
    try {
        await client.connect(transport);
    // connect() 方法会自动处理初始化流程，无需手动调用 initialize()
    } catch (error) {
        // 如果是 SSE 连接失败，检查是否是内容类型错误
        if (transport instanceof __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f40$modelcontextprotocol$2b$sdk$40$0$2e$5$2e$0$2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$client$2f$sse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SSEClientTransport"]) {
            const errorMessage = error.message || String(error);
            if (errorMessage.includes('text/event-stream') || errorMessage.includes('Invalid content type')) {
                throw new Error(`SSE 连接失败：服务器未返回正确的 SSE 流（text/event-stream）。\n` + `这可能是因为：\n` + `1. URL 不正确（您提供的是前端页面 URL 而不是 MCP SSE 端点）\n` + `2. MCP 服务器未正确配置 SSE 端点\n` + `3. URL 指向的不是 MCP 服务器\n\n` + `请确认您使用的是 MCP 服务器的 SSE URL（通常以 /sse 结尾）`);
            }
        }
        throw error;
    }
    const id = connectionId || `conn_${Date.now()}`;
    const clientsMap = getActiveClients();
    clientsMap.set(id, {
        client,
        transport
    });
    console.log(`[MCP Client] 连接成功，ID: ${id}`);
    console.log(`[MCP Client] 当前活跃连接数: ${clientsMap.size}`);
    console.log(`[MCP Client] 所有连接ID:`, Array.from(clientsMap.keys()));
    return id;
}
async function disconnectMCP(connectionId) {
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
function getClient(connectionId) {
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
}),
"[project]/new-flow/A2V/app/api/connect/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/new-flow/A2V/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$lib$2f$mcp$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/new-flow/A2V/lib/mcp-client.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const { url, command, args, connectionId, script } = await request.json();
        let urlOrCommand;
        let finalArgs;
        let finalConnectionId = connectionId;
        // 支持三种连接方式：
        // 1. URL 连接（SSE）- 用于 FastGPT 等远程 MCP 服务器
        // 2. 接入脚本（JSON）- 从 FastGPT 获取的完整配置脚本
        // 3. 命令行连接（stdio）- 用于本地 MCP 服务器
        if (script) {
            // 解析接入脚本
            try {
                // script 可能是字符串（需要解析）或已经是对象
                const scriptData = typeof script === 'string' ? JSON.parse(script) : script;
                // 从脚本中提取连接信息
                // FastGPT 的接入脚本通常包含 url 或 sse 字段
                if (scriptData.url) {
                    urlOrCommand = scriptData.url;
                } else if (scriptData.sse) {
                    urlOrCommand = scriptData.sse;
                } else if (scriptData.server && scriptData.server.url) {
                    urlOrCommand = scriptData.server.url;
                } else {
                    throw new Error('接入脚本中未找到有效的 URL 字段');
                }
                // 如果脚本中有连接 ID，使用它
                if (scriptData.connectionId || scriptData.id) {
                    finalConnectionId = scriptData.connectionId || scriptData.id;
                }
                // 如果脚本中有其他配置，可以在这里处理
                console.log('解析接入脚本:', {
                    url: urlOrCommand,
                    connectionId: finalConnectionId
                });
            } catch (parseError) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: '脚本解析失败',
                    message: parseError.message || '无法解析接入脚本'
                }, {
                    status: 400
                });
            }
        } else {
            urlOrCommand = url || command;
            finalArgs = args;
        }
        if (!urlOrCommand) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: '缺少连接参数',
                message: '请提供 URL、命令或接入脚本'
            }, {
                status: 400
            });
        }
        // 检测是否是代理链接（格式：/api/proxy/[configId]/sse 或 http://.../api/proxy/[configId]/sse）
        console.log('[Connect] 检查是否是代理链接...');
        console.log(`  - urlOrCommand: ${urlOrCommand}`);
        console.log(`  - 类型: ${typeof urlOrCommand}`);
        if (urlOrCommand && typeof urlOrCommand === 'string') {
            // 匹配 /api/proxy/[configId]/sse 格式（支持完整URL和相对路径）
            const proxyUrlPattern = /\/api\/proxy\/([^\/]+)\/sse/i;
            const proxyMatch = urlOrCommand.match(proxyUrlPattern);
            console.log(`  - 正则匹配结果:`, proxyMatch);
            if (proxyMatch) {
                const configId = proxyMatch[1];
                console.log(`  ✅ [Connect] 检测到代理链接，configId: ${configId}`);
                // 对于代理链接，返回一个特殊的连接ID格式：proxy_[configId]
                // 前端可以通过这个ID识别是代理连接，并使用代理API端点
                const proxyConnectionId = `proxy_${configId}`;
                console.log(`  - 生成的 connectionId: ${proxyConnectionId}`);
                return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    connectionId: proxyConnectionId,
                    isProxy: true,
                    configId: configId,
                    message: '代理连接已识别，请使用代理API端点获取工具、资源和提示词'
                });
            } else {
                console.log(`  ⚠️  [Connect] 不是代理链接格式`);
            }
        }
        const id = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$lib$2f$mcp$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectMCP"])(urlOrCommand, finalArgs, finalConnectionId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            connectionId: id,
            message: 'MCP服务器连接成功'
        });
    } catch (error) {
        console.error('连接MCP服务器失败:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: '连接失败',
            message: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5a4a4328._.js.map