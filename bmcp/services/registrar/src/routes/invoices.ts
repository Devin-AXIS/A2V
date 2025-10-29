import { Hono } from 'hono';
import { BillingService } from '../services/billing';
import { db, invoices } from '@bmcp/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();
const billing = new BillingService();

app.get('/', async (c) => {
    const callerId = c.req.query('caller_id');
    if (!callerId) return c.json({ error: 'caller_id 必填' }, 400);
    const list = await db.select().from(invoices).where(eq(invoices.callerId, callerId));
    return c.json({ invoices: list });
});

app.post('/:id/pay', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const payReq = await billing.createPaymentRequest({
        callerId: body.callerId,
        amount: Number(body.amount),
        currency: body.token || 'USDC',
        chainId: Number(body.chainId) || 56,
        mappingId: body.mappingId || ''
    });
    return c.json({ payment: payReq });
});

// 简化支付回调，标记发票已支付
app.get('/pay/:invoiceId', async (c) => {
    const invoiceId = c.req.param('invoiceId');
    await db.update(invoices)
        .set({ status: 'paid', paidAt: new Date() as any })
        .where(eq(invoices.id, invoiceId));
    return c.json({ ok: true, invoiceId });
});

app.get('/receipts/:id', async (c) => {
    // 占位：可查询收据
    return c.json({ todo: true });
});

app.post('/verify', async (c) => {
    // 占位：校验签名
    return c.json({ valid: true });
});

export { app as invoicesRoutes };



