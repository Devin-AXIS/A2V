import { NextRequest } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_BMCP_COMPILER || 'http://127.0.0.1:3006';

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
    const url = `${BASE}/api/${params.path.join('/')}`;

    const init: RequestInit = {
        method: req.method,
        headers: { 'content-type': req.headers.get('content-type') || 'application/json' },
        body: req.method === 'GET' ? undefined : await req.text(),
        cache: 'no-store'
    } as any;

    try {
        const res = await fetch(url, init);
        const text = await res.text();
        return new Response(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy failed', message: error.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
}

export { proxy as GET, proxy as POST };


