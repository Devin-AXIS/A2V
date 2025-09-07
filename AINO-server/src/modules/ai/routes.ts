import { Hono } from 'hono'
import { streamText } from 'hono/streaming'
import { resolveConfigFromHeaders, callOpenAIChat, type ChatPayload } from '../../platform/ai/openai'

const aiRoute = new Hono()

aiRoute.post('/chat', async (c) => {
  try {
    const cfg = resolveConfigFromHeaders(c.req.raw.headers)
    if (!cfg) return c.json({ success: false, code: 'NO_OPENAI_CONFIG', message: 'OpenAI key not provided' }, 400)
    const body = await c.req.json<ChatPayload>()
    const upstream = await callOpenAIChat(cfg, { ...body, stream: false })
    const data = await upstream.json().catch(async () => ({ error: await upstream.text().catch(() => '') }))
    if (!upstream.ok) return c.json({ success: false, code: 'UPSTREAM_ERROR', data }, upstream.status)
    return c.json({ success: true, data })
  } catch (e: any) {
    return c.json({ success: false, code: 'INTERNAL', message: e?.message || 'internal error' }, 500)
  }
})

aiRoute.post('/chat/stream', async (c) => {
  try {
    const cfg = resolveConfigFromHeaders(c.req.raw.headers)
    if (!cfg) return streamText(c, async (stream) => { await stream.writeln('event: error\n' + 'data: {"message":"NO_OPENAI_CONFIG"}\n\n') })
    const body = await c.req.json<ChatPayload>()
    return streamText(c, async (stream) => {
      await stream.writeln('event: start\n' + 'data: {}\n\n')
      const ctrl = new AbortController()
      try {
        const res = await fetch((cfg.endpoint.replace(/\/$/, '')) + '/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
          body: JSON.stringify({ ...body, stream: true }),
          signal: ctrl.signal,
        })
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        while (reader) {
          const { done, value } = await reader.read()
          if (done) break
          await stream.write(decoder.decode(value, { stream: true }))
        }
        await stream.writeln('event: done\n' + 'data: {}\n\n')
      } catch (err: any) {
        await stream.writeln('event: error\n' + 'data: ' + JSON.stringify({ message: err?.message || 'stream error' }) + '\n\n')
      }
    })
  } catch (e: any) {
    return c.json({ success: false, code: 'INTERNAL', message: e?.message || 'internal error' }, 500)
  }
})

export default aiRoute


