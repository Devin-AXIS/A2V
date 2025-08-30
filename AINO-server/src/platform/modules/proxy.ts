import { Hono } from 'hono'
import crypto from 'node:crypto'
import { TIdentity } from '../identity'
import { moduleRegistry, isRemoteModule, getRemoteModuleBaseUrl } from './registry'

// 代理中间件类型
export interface ProxyContext {
  user?: TIdentity
}

// 创建HMAC签名
function createHmacSignature(body: Buffer, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

// 验证HMAC签名
function verifyHmacSignature(body: Buffer, signature: string, secret: string): boolean {
  const expectedSignature = createHmacSignature(body, secret)
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
}

// 远程模块代理
export const remoteProxy = new Hono<{ Variables: ProxyContext }>()

// 处理所有远程模块请求
remoteProxy.all('/:key/*', async (c) => {
  const key = c.req.param('key')
  const user = c.get('user')

  // 检查模块是否存在且为远程模块
  if (!isRemoteModule(key)) {
    return c.json({
      success: false,
      error: '模块不存在或不是远程模块',
    }, 404)
  }

  // 获取远程模块的基础URL
  const baseUrl = getRemoteModuleBaseUrl(key)
  if (!baseUrl) {
    return c.json({
      success: false,
      error: '远程模块基础URL未配置',
    }, 500)
  }

  try {
    // 获取请求体
    const body = await c.req.arrayBuffer()
    const bodyBuffer = Buffer.from(body)

    // 获取HMAC密钥（优先使用模块配置的密钥，否则使用环境变量）
    const module = moduleRegistry.get(key)
    const hmacSecret = module?.hmacSecret || process.env.MODULE_HMAC_SECRET

    if (!hmacSecret) {
      return c.json({
        success: false,
        error: 'HMAC密钥未配置',
      }, 500)
    }

    // 创建HMAC签名
    const signature = createHmacSignature(bodyBuffer, hmacSecret)

    // 构建目标URL
    const originalPath = c.req.path
    const remotePath = originalPath.replace(`/api/remote/${key}`, '')
    const targetUrl = `${baseUrl}${remotePath}`

    // 构建请求头
    const headers: Record<string, string> = {
      'x-platform-user-id': user?.id || '',
      'x-platform-user-roles': user?.roles?.join(',') || '',
      'x-sign': signature,
      'content-type': c.req.header('content-type') || 'application/json',
    }

    // 添加用户显示名称（如果存在）
    if (user?.displayName) {
      headers['x-platform-user-display-name'] = user.displayName
    }

    // 发送请求到远程模块
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers,
      body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : bodyBuffer,
    })

    // 获取响应体
    const responseBody = await response.arrayBuffer()

    // 返回响应
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })

  } catch (error) {
    console.error('远程模块代理错误:', error)
    return c.json({
      success: false,
      error: '远程模块调用失败',
      details: error instanceof Error ? error.message : '未知错误',
    }, 500)
  }
})

// 获取远程模块健康状态
remoteProxy.get('/:key/health', async (c) => {
  const key = c.req.param('key')

  if (!isRemoteModule(key)) {
    return c.json({
      success: false,
      error: '模块不存在或不是远程模块',
    }, 404)
  }

  const baseUrl = getRemoteModuleBaseUrl(key)
  if (!baseUrl) {
    return c.json({
      success: false,
      error: '远程模块基础URL未配置',
    }, 500)
  }

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'x-platform-user-id': c.get('user')?.id || '',
      },
    })

    const isHealthy = response.ok
    return c.json({
      success: true,
      data: {
        module: key,
        healthy: isHealthy,
        status: response.status,
        statusText: response.statusText,
      },
    })

  } catch (error) {
    return c.json({
      success: true,
      data: {
        module: key,
        healthy: false,
        error: error instanceof Error ? error.message : '连接失败',
      },
    })
  }
})

// 获取远程模块信息
remoteProxy.get('/:key/info', async (c) => {
  const key = c.req.param('key')
  const module = moduleRegistry.get(key)

  if (!module || !isRemoteModule(key)) {
    return c.json({
      success: false,
      error: '模块不存在或不是远程模块',
    }, 404)
  }

  return c.json({
    success: true,
    data: {
      key: module.key,
      name: module.name,
      version: module.version,
      kind: module.kind,
      baseUrl: module.baseUrl,
      description: module.description,
      author: module.author,
      homepage: module.homepage,
      routes: module.routes,
    },
  })
})

// 导出代理实例
export default remoteProxy
