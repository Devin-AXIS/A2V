'use client';

import { useState } from 'react';

export default function CreatePage() {
    const [tab, setTab] = useState<'mcp' | 'openapi'>('mcp');
    const [originalUrl, setOriginalUrl] = useState('');
    const [openapiUrl, setOpenapiUrl] = useState('');
    const [result, setResult] = useState<any>(null);

    async function submitMcp() {
        const payload = {
            originalUrl,
            kind: 'mcp',
            pricing: { policy: 'flat_per_call', pricePerCall: 0.001 },
            enable402: true,
            settlementToken: 'USDC',
            publisherId: crypto.randomUUID()
        };
        const res = await fetch(`${process.env.NEXT_PUBLIC_BMCP_REGISTRAR || 'http://localhost:3001'}/api/register`, {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
        });
        setResult(await res.json());
    }

    async function submitOpenapi() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BMCP_COMPILER || 'http://localhost:3006'}/api/compile/openapi`, {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ openapiUrl })
        });
        setResult(await res.json());
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
                    <label>原 MCP 基址</label>
                    <input style={{ display: 'block', width: '100%', padding: 8 }} placeholder="https://example.com/mcp" value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} />
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
        </main>
    );
}


