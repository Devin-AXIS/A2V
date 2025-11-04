import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/mcp-client';
import { getProxyClient, isProxyConnection, getActiveProxyConfigIds, hasActiveProxySession } from '@/lib/proxy-client';

export async function POST(request: NextRequest) {
    console.log('\n========== [Call Tool API] 请求开始 ==========');

    try {
        const { connectionId, toolName, arguments: toolArgs, walletAddress } = await request.json();

        console.log(`[Call Tool] 接收到的参数:`);
        console.log(`  - connectionId: ${connectionId}`);
        console.log(`  - toolName: ${toolName}`);
        console.log(`  - walletAddress: ${walletAddress || '未提供'}`);
        console.log(`  - toolArgs: ${JSON.stringify(toolArgs || {})}`);

        if (!connectionId || !toolName) {
            console.error(`  ❌ 缺少必需参数: connectionId=${!!connectionId}, toolName=${!!toolName}`);
            return NextResponse.json(
                { error: '缺少connectionId或toolName参数' },
                { status: 400 }
            );
        }

        // 检查是否是代理连接
        let isProxy = isProxyConnection(connectionId);
        let actualConnectionId = connectionId;

        // 如果 connectionId 不是以 proxy_ 开头，尝试识别为代理连接
        if (!isProxy) {
            console.log(`  [Call Tool] connectionId 不是 proxy_ 格式，尝试识别代理连接...`);

            // 方法1: 检查是否是 configId 格式（32字符的十六进制字符串）
            const configIdPattern = /^[a-f0-9]{32}$/i;
            if (configIdPattern.test(connectionId)) {
                console.log(`  - 检测到可能是 configId 格式`);
                try {
                    // 检查配置是否存在
                    const { promises: fs } = await import('fs');
                    const path = await import('path');
                    const configsFile = path.join(process.cwd(), 'data', 'mcp-configs', 'configs.json');
                    const configsData = await fs.readFile(configsFile, 'utf-8');
                    const configs = JSON.parse(configsData);
                    const configExists = configs.some((c: any) => c.id === connectionId);

                    if (configExists) {
                        // 配置存在，说明这是代理连接
                        const possibleProxyId = `proxy_${connectionId}`;
                        console.log(`  ✅ [Call Tool] 配置存在，确认是代理连接`);
                        console.log(`  - 自动转换为: ${possibleProxyId}`);
                        isProxy = true;
                        actualConnectionId = possibleProxyId;
                    } else {
                        console.log(`  ⚠️  配置不存在，不是代理连接`);
                    }
                } catch (e: any) {
                    console.log(`  ⚠️  检查配置失败: ${e.message}`);
                }
            }

            // 方法2: 如果 connectionId 是 conn_xxx 格式，检查是否有活跃的代理会话
            // 如果有，就认为是代理连接（因为用户可能是通过代理 URL 连接的，但没有被正确识别）
            if (!isProxy && connectionId.startsWith('conn_')) {
                console.log(`  - connectionId 是 conn_xxx 格式，检查是否有活跃的代理会话`);
                const activeConfigIds = getActiveProxyConfigIds();
                console.log(`  - 活跃的代理配置: ${activeConfigIds.join(', ') || '无'}`);

                if (activeConfigIds.length > 0) {
                    // 如果有多个活跃会话，使用第一个（或者可以根据某些规则选择）
                    // 这里我们使用最新的会话（ID 最大的，通常是最后创建的）
                    const configId = activeConfigIds[0];
                    const possibleProxyId = `proxy_${configId}`;
                    console.log(`  ✅ 检测到活跃代理会话，自动识别为代理连接`);
                    console.log(`  - 使用配置: ${configId}`);
                    console.log(`  - 自动转换为: ${possibleProxyId}`);
                    isProxy = true;
                    actualConnectionId = possibleProxyId;
                } else {
                    console.log(`  ⚠️  没有活跃的代理会话`);
                }
            }
        }

        console.log(`\n[Call Tool] 连接类型检查:`);
        console.log(`  - 原始 connectionId: "${connectionId}"`);
        console.log(`  - 实际使用的 connectionId: "${actualConnectionId}"`);
        console.log(`  - 是否是代理连接: ${isProxy}`);
        console.log(`  - 是否以 "proxy_" 开头: ${actualConnectionId.startsWith('proxy_')}`);

        // 获取客户端，如果是代理连接但会话不存在，创建临时会话
        let client;
        if (isProxy) {
            try {
                client = getProxyClient(actualConnectionId);
                console.log(`  ✅ 使用现有代理会话`);
            } catch (sessionError: any) {
                console.log(`  ⚠️  代理会话不存在，尝试创建临时会话...`);
                // 提取 configId
                const configId = actualConnectionId.replace('proxy_', '');

                // 读取配置并创建临时会话
                const { promises: fs } = await import('fs');
                const path = await import('path');
                const configsFile = path.join(process.cwd(), 'data', 'mcp-configs', 'configs.json');
                const configsData = await fs.readFile(configsFile, 'utf-8');
                const configs = JSON.parse(configsData);
                const config = configs.find((c: any) => c.id === configId);

                if (!config) {
                    throw new Error(`配置不存在: ${configId}`);
                }

                // 创建临时会话（参考 proxy/tools 的实现）
                const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
                const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
                const { SSEClientTransport } = await import('@modelcontextprotocol/sdk/client/sse.js');

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
                let transport;

                if (config.connectionType === 'url' && connectionConfig.url) {
                    const url = new URL(connectionConfig.url);
                    transport = new SSEClientTransport(url);
                } else if (config.connectionType === 'command' && connectionConfig.command) {
                    transport = new StdioClientTransport({
                        command: connectionConfig.command,
                        args: connectionConfig.args || [],
                    });
                } else if (config.connectionType === 'script' && connectionConfig.script) {
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

                await mcpClient.connect(transport);
                client = mcpClient;
                console.log(`  ✅ 临时代理会话创建成功`);
            }
        } else {
            client = getClient(actualConnectionId);
        }

        console.log(`\n[Call Tool] 调用工具: ${toolName}`);
        const result = await client.callTool({
            name: toolName,
            arguments: toolArgs || {},
        });
        console.log(`  ✅ 工具调用成功`);

        // 如果是代理连接且提供了钱包地址，自动分发代币
        console.log(`\n[Call Tool] 检查是否需要分发代币:`);
        console.log(`  - 是代理连接: ${isProxy}`);
        console.log(`  - 有钱包地址: ${!!walletAddress}`);
        console.log(`  - 条件满足: ${isProxy && !!walletAddress}`);

        let tokenDistribution = null;
        if (isProxy && walletAddress) {
            console.log(`\n[Call Tool] ✅ 开始代币分发流程...`);
            console.log(`  - 钱包地址: ${walletAddress}`);
            console.log(`  - 准备调用 /api/distribute-tokens`);

            try {
                const distributeUrl = `${request.nextUrl.origin}/api/distribute-tokens`;
                console.log(`  - 分发API URL: ${distributeUrl}`);

                const distributeResponse = await fetch(distributeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        result,
                        walletAddress,
                    }),
                });

                console.log(`  - 分发API响应状态: ${distributeResponse.status}`);
                const distributeData = await distributeResponse.json();
                console.log(`  - 分发API响应数据:`, JSON.stringify(distributeData, null, 2));

                if (distributeData.success) {
                    tokenDistribution = {
                        success: true,
                        amount: distributeData.amount,
                        valueHash: distributeData.valueHash,
                        authorizeTxHash: distributeData.authorizeTxHash,
                        distributeTxHash: distributeData.distributeTxHash,
                    };
                    console.log(`  ✅ [Call Tool] 代币分发成功: ${distributeData.amount} 代币`);
                } else {
                    console.error(`  ❌ [Call Tool] 代币分发失败:`, distributeData.error || distributeData.message);
                    tokenDistribution = {
                        success: false,
                        error: distributeData.error || distributeData.message,
                    };
                }
            } catch (distributeError: any) {
                console.error(`  ❌ [Call Tool] 代币分发异常:`);
                console.error(`    - 错误类型: ${distributeError.constructor.name}`);
                console.error(`    - 错误消息: ${distributeError.message}`);
                if (distributeError.stack) {
                    console.error(`    - 错误堆栈:\n${distributeError.stack}`);
                }
                // 不阻断工具调用结果，只记录错误
                tokenDistribution = {
                    success: false,
                    error: distributeError.message,
                };
            }
        } else {
            console.log(`\n[Call Tool] ⚠️  跳过代币分发:`);
            if (!isProxy) {
                console.log(`  - 原因: 不是代理连接 (connectionId: ${connectionId})`);
            }
            if (!walletAddress) {
                console.log(`  - 原因: 未提供钱包地址`);
            }
        }

        console.log(`\n========== [Call Tool API] 请求完成 ==========\n`);

        return NextResponse.json({
            success: true,
            result: result,
            tokenDistribution,
        });
    } catch (error: any) {
        console.error('\n========== [Call Tool API] 请求失败 ==========');
        console.error('调用工具失败:', error);
        console.error(`错误类型: ${error.constructor.name}`);
        console.error(`错误消息: ${error.message}`);
        if (error.stack) {
            console.error(`错误堆栈:\n${error.stack}`);
        }
        console.error('==========================================\n');

        return NextResponse.json(
            {
                error: '调用工具失败',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
