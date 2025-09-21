import type { IncomingHttpHeaders } from 'http'

export type OpenAIConfig = {
  endpoint: string
  apiKey: string
  extraHeaders?: Record<string, string>
}

export type ChatPayload = {
  model: string
  messages: Array<{ role: 'system'|'user'|'assistant'|'tool'; content?: any; name?: string; tool_call_id?: string }>
  temperature?: number
  max_tokens?: number
  tools?: any
  tool_choice?: any
  response_format?: any
  stream?: boolean
  // 允许附加任意 OpenAI 兼容字段
  [k: string]: any
}

export function resolveConfigFromHeaders(headers: Headers | IncomingHttpHeaders, fallback?: Partial<OpenAIConfig>): OpenAIConfig | null {
  const get = (k: string) => headers instanceof Headers ? headers.get(k) : String((headers as any)[k] ?? '')
  const endpoint = (get('x-aino-openai-endpoint') || fallback?.endpoint || process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1').toString()
  const apiKey = (get('x-aino-openai-key') || fallback?.apiKey || process.env.OPENAI_API_KEY || '').toString()
  if (!apiKey) return null
  return { endpoint, apiKey, extraHeaders: fallback?.extraHeaders }
}

export async function callOpenAIChat(cfg: OpenAIConfig, body: ChatPayload, signal?: AbortSignal) {
  const url = new URL('/chat/completions', cfg.endpoint.endsWith('/') ? cfg.endpoint.slice(0, -1) : cfg.endpoint)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
      ...(cfg.extraHeaders || {}),
    },
    body: JSON.stringify(body),
    signal,
  })
  return res
}

export async function streamOpenAIChat(cfg: OpenAIConfig, body: ChatPayload, onChunk: (chunk: string) => void, signal?: AbortSignal) {
  const res = await callOpenAIChat(cfg, { ...body, stream: true }, signal)
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Upstream error: ${res.status}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}


