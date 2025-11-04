import { NextRequest, NextResponse } from 'next/server';
import { connectMCP } from '@/lib/mcp-client';

export async function POST(request: NextRequest) {
    try {
        const { url, command, args, connectionId, script } = await request.json();

        let urlOrCommand: string | undefined;
        let finalArgs: string[] | undefined;
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
                console.log('解析接入脚本:', { url: urlOrCommand, connectionId: finalConnectionId });
            } catch (parseError: any) {
                return NextResponse.json(
                    {
                        success: false,
                        error: '脚本解析失败',
                        message: parseError.message || '无法解析接入脚本',
                    },
                    { status: 400 }
                );
            }
        } else {
            urlOrCommand = url || command;
            finalArgs = args;
        }

        if (!urlOrCommand) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少连接参数',
                    message: '请提供 URL、命令或接入脚本',
                },
                { status: 400 }
            );
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

                return NextResponse.json({
                    success: true,
                    connectionId: proxyConnectionId,
                    isProxy: true,
                    configId: configId,
                    message: '代理连接已识别，请使用代理API端点获取工具、资源和提示词',
                });
            } else {
                console.log(`  ⚠️  [Connect] 不是代理链接格式`);
            }
        }

        const id = await connectMCP(urlOrCommand, finalArgs, finalConnectionId);

        return NextResponse.json({
            success: true,
            connectionId: id,
            message: 'MCP服务器连接成功',
        });
    } catch (error: any) {
        console.error('连接MCP服务器失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '连接失败',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
