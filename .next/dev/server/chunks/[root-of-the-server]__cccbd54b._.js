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
"[project]/new-flow/A2V/app/api/tools/[connectionId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/new-flow/A2V/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$lib$2f$mcp$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/new-flow/A2V/lib/mcp-client.ts [app-route] (ecmascript)");
;
;
async function GET(request, { params }) {
    try {
        // 处理 Next.js 15 中 params 可能是 Promise 的情况
        const resolvedParams = params instanceof Promise ? await params : params;
        const { connectionId } = resolvedParams;
        if (!connectionId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: '缺少 connectionId 参数'
            }, {
                status: 400
            });
        }
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$lib$2f$mcp$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClient"])(connectionId);
        const tools = await client.listTools();
        return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            tools: tools.tools || []
        });
    } catch (error) {
        console.error('获取工具列表失败:', error);
        // MCP 错误码 -32601 表示 "Method not found"，说明服务器不支持此功能
        // 这是正常情况，返回空列表而不是错误
        if (error.code === -32601 || error.message?.includes('Method not found')) {
            console.log('MCP 服务器不支持 tools 功能，返回空列表');
            return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                tools: [],
                message: '该 MCP 服务器不支持工具功能'
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$new$2d$flow$2f$A2V$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: '获取工具列表失败',
            message: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cccbd54b._.js.map