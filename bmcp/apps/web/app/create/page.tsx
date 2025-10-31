'use client';

import { useMemo, useState } from 'react';

export default function CreatePage() {
    const [tab, setTab] = useState<'mcp' | 'openapi'>('mcp');
    const [originalUrl, setOriginalUrl] = useState('');
    const [openapiUrl, setOpenapiUrl] = useState('');
    const [result, setResult] = useState<any>(null);
    const [defaultMethod, setDefaultMethod] = useState<string>('GET');
    const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
    const [mcpEndpoint, setMcpEndpoint] = useState<string>('');
    const [mcpConnectionConfig, setMcpConnectionConfig] = useState<string>('');
    const [mcpRequestTemplate, setMcpRequestTemplate] = useState<string>('');

    // new states for testing + wallet + contract
    const [bmcpUrl, setBmcpUrl] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [walletAddr, setWalletAddr] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [testingOutput, setTestingOutput] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const registrarBase = useMemo(() => process.env.NEXT_PUBLIC_BMCP_REGISTRAR || 'http://localhost:3001', []);

    function addHeaderRow() {
        setCustomHeaders([...customHeaders, { key: '', value: '' }]);
    }

    function removeHeaderRow(index: number) {
        setCustomHeaders(customHeaders.filter((_, i) => i !== index));
    }

    function updateHeaderRow(index: number, field: 'key' | 'value', value: string) {
        const updated = [...customHeaders];
        updated[index][field] = value;
        setCustomHeaders(updated);
    }

    function getHeadersObject(): Record<string, string> {
        const headers: Record<string, string> = {};
        customHeaders.forEach(({ key, value }) => {
            if (key.trim() && value.trim()) {
                headers[key.trim()] = value.trim();
            }
        });
        return headers;
    }

    async function submitMcp() {
        // 验证必须字段
        if (!mcpEndpoint.trim()) {
            console.error('请填写 MCP 端点 URL');
            return;
        }

        const headersObj = getHeadersObject();

        // 解析 MCP 接入配置（JSON 格式）
        let parsedConnectionConfig = null;
        if (mcpConnectionConfig.trim()) {
            try {
                parsedConnectionConfig = JSON.parse(mcpConnectionConfig);
            } catch (e) {
                console.error('MCP 接入配置格式错误，必须是有效的 JSON 格式');
                return;
            }
        }

        // 解析 MCP 请求体模板（JSON 格式）
        let parsedRequestTemplate = null;
        if (mcpRequestTemplate.trim()) {
            try {
                parsedRequestTemplate = JSON.parse(mcpRequestTemplate);
            } catch (e) {
                console.error('MCP 请求体模板格式错误，必须是有效的 JSON 格式');
                return;
            }
        }

        const payload: any = {
            kind: 'mcp',
            pricing: { policy: 'flat_per_call', pricePerCall: 0.001 },
            enable402: true,
            settlementToken: 'USDC',
            publisherId: crypto.randomUUID(),
            defaultMethod: defaultMethod,
            mcpEndpoint: mcpEndpoint.trim()
        };

        // 只在有值时才添加可选字段
        if (originalUrl.trim()) {
            payload.originalUrl = originalUrl.trim();
        }
        if (Object.keys(headersObj).length > 0) {
            payload.customHeaders = headersObj;
        }
        if (parsedConnectionConfig) {
            payload.mcpConnectionConfig = parsedConnectionConfig;
        }
        if (parsedRequestTemplate) {
            payload.mcpRequestBody = parsedRequestTemplate;
        }

        try {
            const res = await fetch(`${registrarBase}/api/register`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                console.error(`注册失败: ${data.error || data.message || '未知错误'}\n${data.details ? JSON.stringify(data.details, null, 2) : ''}`);
                setResult(data);
                return;
            }

            setResult(data);
            if (data?.gatewayUrl) {
                setBmcpUrl(data.gatewayUrl);
                console.error('注册成功！BMCP 地址: ' + data.gatewayUrl);
            }
        } catch (e: any) {
            console.error('注册请求失败:', e);
            console.error('注册请求失败: ' + (e?.message || '网络错误'));
        }
    }

    async function submitOpenapi() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BMCP_COMPILER || 'http://localhost:3006'}/api/compile/openapi`, {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ openapiUrl })
        });
        setResult(await res.json());
    }

    async function connectWallet() {
        try {
            const eth = (globalThis as any).ethereum;
            if (!eth) {
                console.error('未检测到钱包（MetaMask）。');
                return;
            }
            const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
            const current = accounts?.[0] || null;
            setWalletAddr(current);
            const cidHex: string = await eth.request({ method: 'eth_chainId' });
            setChainId(parseInt(cidHex, 16));
        } catch (e: any) {
            console.error(`连接钱包失败: ${e.message}`);
        }
    }

    function disconnectWallet() {
        setWalletAddr(null);
        setChainId(null);
    }

    async function loadEthersWithRetry() {
        const max = 3;
        for (let i = 0; i < max; i++) {
            try {
                const mod = await import('ethers');
                return mod;
            } catch (e) {
                console.error('加载 ethers 失败，重试中...', e);
                await new Promise(r => setTimeout(r, 600));
            }
        }
        throw new Error('加载 ethers 失败，请刷新页面后重试');
    }

    function isHexAddress(addr: string) {
        return /^0x[0-9a-fA-F]{40}$/.test(addr);
    }

    async function testBmcpAndClaim() {
        if (!bmcpUrl) {
            console.error('请先输入 BMCP 网关链接');
            return;
        }
        if (!contractAddress) {
            console.error('请先输入代币合约地址');
            return;
        }
        if (!isHexAddress(contractAddress)) {
            console.error('无效的合约地址');
            return;
        }
        if (!walletAddr) {
            console.error('请先连接钱包');
            return;
        }

        setLoading(true);
        setTxHash(null);
        setTestingOutput(null);
        try {
            const start = Date.now();
            const resp = await fetch(bmcpUrl, { headers: { 'x-caller-id': walletAddr || 'web' } });
            const text = await resp.text();
            let data: any;
            try { data = JSON.parse(text); } catch { data = text; }
            const end = Date.now();

            // clamp 执行时间到 [1000, 300000] ms
            const rawExec = end - start;
            const executionTime = Math.max(1000, Math.min(300000, rawExec));
            // GET 无请求体，用 URL 长度作为输入大小，至少为 1
            const inputSize = Math.max(1, bmcpUrl.length);
            const outputSize = text.length;
            const timestamp = Date.now();

            setTestingOutput({ status: resp.status, data, executionTime, inputSize, outputSize });

            // 计算 proofHash
            const { ethers } = await loadEthersWithRetry();
            const abiCoder = new ethers.AbiCoder();
            const proofHash = ethers.keccak256(
                abiCoder.encode(
                    ['string', 'string', 'uint256', 'uint256', 'uint256', 'uint256'],
                    ['task-' + crypto.randomUUID(), 'text-processing', inputSize, outputSize, executionTime, timestamp]
                )
            );

            // 调用合约 submitWorkProof
            const eth = (globalThis as any).ethereum;
            const provider = new (await loadEthersWithRetry()).BrowserProvider(eth);
            const signer = await provider.getSigner();

            const minimalAbi = [
                {
                    inputs: [
                        { internalType: 'string', name: 'taskId', type: 'string' },
                        { internalType: 'string', name: 'toolName', type: 'string' },
                        { internalType: 'uint256', name: 'inputSize', type: 'uint256' },
                        { internalType: 'uint256', name: 'outputSize', type: 'uint256' },
                        { internalType: 'uint256', name: 'executionTime', type: 'uint256' },
                        { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
                        { internalType: 'bytes32', name: 'proofHash', type: 'bytes32' }
                    ],
                    name: 'submitWorkProof',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function'
                }
            ];

            const contract = new (await import('ethers')).Contract(contractAddress, minimalAbi, signer);
            const taskId = 'task-' + Math.random().toString(36).slice(2);
            const toolName = 'text-processing';
            const tx = await contract.submitWorkProof(taskId, toolName, inputSize, outputSize, executionTime, timestamp, proofHash);
            const receipt = await tx.wait();
            setTxHash(receipt?.hash || tx?.hash || null);
        } catch (e: any) {
            console.error(`测试调用或领取失败: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h2>创建 BMCP</h2>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button onClick={() => setTab('mcp')} disabled={tab === 'mcp'}>MCP → 价值化</button>
                {/* <button onClick={() => setTab('openapi')} disabled={tab === 'openapi'}>OpenAPI → 自动 MCP</button> */}
            </div>
            {tab === 'mcp' ? (
                <section style={{ marginTop: 16 }}>
                    <label style={{ marginTop: 16, display: 'block' }}>
                        MCP 端点 URL <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                        style={{ display: 'block', width: '100%', padding: 8 }}
                        placeholder="https://mcp.example.com/v1/chat/completions 或 ws://mcp.example.com/ws"
                        value={mcpEndpoint}
                        onChange={e => setMcpEndpoint(e.target.value)}
                        required
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
                        提示: MCP 服务的实际端点 URL，支持 HTTP、WebSocket、SSE 等协议（必填）
                    </small>

                    <label style={{ marginTop: 16, display: 'block' }}>
                        原 MCP 基址 <span style={{ color: '#999', fontSize: '12px' }}>（可选）</span>
                    </label>
                    <input
                        style={{ display: 'block', width: '100%', padding: 8 }}
                        placeholder="https://example.com/mcp（可选，如果不填则使用上面的 MCP 端点 URL）"
                        value={originalUrl}
                        onChange={e => setOriginalUrl(e.target.value)}
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
                        提示: 如果提供，将作为原始 URL；如果不提供，将使用上面的 MCP 端点 URL
                    </small>

                    <label style={{ marginTop: 16, display: 'block' }}>默认请求方法</label>
                    <select
                        style={{ display: 'block', width: '100%', padding: 8 }}
                        value={defaultMethod}
                        onChange={e => setDefaultMethod(e.target.value)}
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                        <option value="HEAD">HEAD</option>
                        <option value="OPTIONS">OPTIONS</option>
                    </select>

                    <label style={{ marginTop: 16, display: 'block' }}>MCP 接入配置 (JSON)</label>
                    <textarea
                        style={{ display: 'block', width: '100%', padding: 8, minHeight: 200, fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder={`HTTP 传输示例:\n{\n  "transport": "http",\n  "endpoint": "https://mcp.example.com/v1",\n  "headers": {\n    "Authorization": "Bearer token",\n    "Content-Type": "application/json"\n  },\n  "timeout": 30000\n}\n\nstdio 传输示例（本地进程）:\n{\n  "transport": "stdio",\n  "command": "node",\n  "args": ["/path/to/mcp-server.js"],\n  "env": {\n    "API_KEY": "your-key"\n  }\n}\n\nSSE 传输示例:\n{\n  "transport": "sse",\n  "endpoint": "https://mcp.example.com/sse",\n  "headers": {\n    "Authorization": "Bearer token"\n  }\n}`}
                        value={mcpConnectionConfig}
                        onChange={e => setMcpConnectionConfig(e.target.value)}
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
                        提示: MCP 接入配置，定义如何连接到 MCP 服务器。支持三种传输方式：
                        <br />• <strong>http</strong>: HTTP/HTTPS 端点，需要 endpoint、headers、timeout 等
                        <br />• <strong>stdio</strong>: 标准输入输出，需要 command、args、env 等（用于本地进程）
                        <br />• <strong>sse</strong>: Server-Sent Events，需要 endpoint、headers 等
                    </small>

                    <label style={{ marginTop: 16, display: 'block' }}>MCP 请求体模板 (JSON-RPC)</label>
                    <textarea
                        style={{ display: 'block', width: '100%', padding: 8, minHeight: 120, fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder={`{\n  "jsonrpc": "2.0",\n  "method": "tools/call",\n  "params": {\n    "name": "tool_name",\n    "arguments": {}\n  },\n  "id": 1\n}`}
                        value={mcpRequestTemplate}
                        onChange={e => setMcpRequestTemplate(e.target.value)}
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
                        提示: 用于调用 MCP 工具的 JSON-RPC 格式请求体模板。实际调用时会根据此模板构建请求，可以使用占位符替换参数。
                    </small>

                    <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>自定义请求头 (Header)</label>
                        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 4 }}>
                            {customHeaders.map((header, index) => (
                                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <input
                                        style={{ flex: 1, padding: 6 }}
                                        placeholder="Header 名称 (如: Authorization)"
                                        value={header.key}
                                        onChange={e => updateHeaderRow(index, 'key', e.target.value)}
                                    />
                                    <input
                                        style={{ flex: 1, padding: 6 }}
                                        placeholder="Header 值 (如: Bearer token123)"
                                        value={header.value}
                                        onChange={e => updateHeaderRow(index, 'value', e.target.value)}
                                    />
                                    {customHeaders.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeHeaderRow(index)}
                                            style={{ padding: '6px 12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                        >
                                            删除
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addHeaderRow}
                                style={{ padding: '6px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                                + 添加 Header
                            </button>
                        </div>
                        <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
                            提示: 可以为 MCP 接口添加认证头等自定义请求头，例如 Authorization、API-Key 等
                        </small>
                    </div>

                    <button style={{ marginTop: 12 }} onClick={submitMcp}>生成 BMCP 地址</button>
                </section>
            ) : (
                <section style={{ marginTop: 16 }}>
                    <label>OpenAPI URL</label>
                    <input style={{ display: 'block', width: '100%', padding: 8 }} placeholder="https://example.com/openapi.json" value={openapiUrl} onChange={e => setOpenapiUrl(e.target.value)} />
                    <button style={{ marginTop: 12 }} onClick={submitOpenapi}>编译并注册</button>
                </section>
            )}

            {result && (
                <pre style={{ marginTop: 16, background: '#fafafa', padding: 12 }}>
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}

            <hr style={{ margin: '24px 0' }} />
            <h3>连接钱包</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!walletAddr ? (
                    <button onClick={connectWallet}>连接 MetaMask</button>
                ) : (
                    <>
                        <span>地址: {walletAddr}</span>
                        <span>链: {chainId ?? '-'}</span>
                        <button onClick={disconnectWallet}>断开</button>
                    </>
                )}
            </div>

            <section style={{ marginTop: 24 }}>
                <h3>测试 BMCP & 领取代币</h3>
                <label>BMCP 网关地址</label>
                <input style={{ display: 'block', width: '100%', padding: 8 }} placeholder={`${registrarBase}/proxy/{mappingId}`} value={bmcpUrl} onChange={e => setBmcpUrl(e.target.value)} />

                <label style={{ marginTop: 12, display: 'block' }}>代币合约地址</label>
                <input style={{ display: 'block', width: '100%', padding: 8 }} placeholder="0x..." value={contractAddress} onChange={e => setContractAddress(e.target.value)} />

                <button style={{ marginTop: 12 }} onClick={testBmcpAndClaim} disabled={loading}>
                    {loading ? '执行中...' : '调用 BMCP 并提交工作量领取代币'}
                </button>

                {testingOutput && (
                    <pre style={{ marginTop: 16, background: '#fafafa', padding: 12 }}>
                        {JSON.stringify(testingOutput, null, 2)}
                    </pre>
                )}

                {txHash && (
                    <div style={{ marginTop: 12 }}>
                        交易哈希: {txHash}
                    </div>
                )}
            </section>
        </main>
    );
}

