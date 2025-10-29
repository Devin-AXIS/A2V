import { Hono } from 'hono';
import { PricingService } from '../services/pricing';

const app = new Hono();
const pricingService = new PricingService();

app.put('/:id/pricing', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const updated = await pricingService.updatePricing(id, body);
    if (!updated) return c.json({ error: 'not found' }, 404);
    return c.json({ ok: true, config: updated });
});

app.put('/:id/splits', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const updated = await pricingService.updateSplits(id, body);
    if (!updated) return c.json({ error: 'not found' }, 404);
    return c.json({ ok: true, config: updated });
});

app.put('/:id/wallet', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const updated = await pricingService.updateWallet(id, body.walletAddr, body.chainPref);
    if (!updated) return c.json({ error: 'not found' }, 404);
    return c.json({ ok: true, config: updated });
});

export { app as publisherRoutes };


