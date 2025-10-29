async function fetchMappings() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BMCP_REGISTRAR || 'http://localhost:3001'}/api/register`, { cache: 'no-store' });
        if (!res.ok) return [] as any[];
        const data = await res.json();
        return data.mappings || [];
    } catch {
        return [] as any[];
    }
}

export default async function MarketPage() {
    const mappings = await fetchMappings();
    return (
        <main style={{ padding: 24 }}>
            <h2>BMCP 市场</h2>
            <a href="/create">+ 创建 BMCP</a>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
                {mappings.map((m: any) => (
                    <div key={m.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                        <div style={{ fontWeight: 600 }}>{m.kind?.toUpperCase()} 工具</div>
                        <div style={{ fontSize: 12, color: '#666' }}>发布者: {m.publisherId?.slice(0, 8)}</div>
                        <div style={{ marginTop: 8 }}>BMCP 地址</div>
                        <code style={{ fontSize: 12 }}>{m.gatewayUrl}</code>
                        <details style={{ marginTop: 8 }}>
                            <summary>原始地址</summary>
                            <code style={{ fontSize: 12 }}>{m.originalUrl}</code>
                        </details>
                    </div>
                ))}
            </div>
        </main>
    );
}


