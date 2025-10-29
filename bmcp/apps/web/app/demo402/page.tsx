'use client';
import { useState } from 'react';

export default function Demo402() {
    const [gatewayUrl, setGatewayUrl] = useState('');
    const [resp, setResp] = useState<any>(null);
    const [payment, setPayment] = useState<any>(null);

    async function callProxy() {
        setPayment(null);
        const res = await fetch(gatewayUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-caller-id': crypto.randomUUID() },
            body: JSON.stringify({ ping: true })
        });
        if (res.status === 402) {
            const data = await res.json();
            setPayment(data.paymentRequired);
            setResp(null);
        } else {
            setResp(await res.json());
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h2>402 支付流程演示（占位）</h2>
            <input style={{ display: 'block', width: '100%', padding: 8 }} placeholder="输入 BMCP 网关地址 /proxy/:id/path" value={gatewayUrl} onChange={e => setGatewayUrl(e.target.value)} />
            <button style={{ marginTop: 12 }} onClick={callProxy}>发起请求</button>

            {payment && (
                <div style={{ marginTop: 16, border: '1px solid #eee', padding: 12 }}>
                    <h4>需要支付 (402)</h4>
                    <div>金额: {payment.amount} {payment.currency}</div>
                    <div>链: {payment.chainId}</div>
                    <div>支付链接: <a href={payment.paymentUrl} target="_blank">{payment.paymentUrl}</a></div>
                    {payment.qrCode && <img src={payment.qrCode} alt="qr" style={{ marginTop: 8, width: 180, height: 180 }} />}
                </div>
            )}

            {resp && (
                <pre style={{ marginTop: 16 }}>{JSON.stringify(resp, null, 2)}</pre>
            )}
        </main>
    );
}


