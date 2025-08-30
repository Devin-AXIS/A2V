import { Context, Next } from 'hono'
import { getUserFromToken, extractTokenFromHeader } from '../platform/auth'
import { TIdentity } from '../platform/identity'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'

// Mock 认证中间件（临时使用）
export async function mockAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (token === 'test-token') {
    // 动态查询数据库中的管理员用户
    const [admin] = await db.select().from(users).where(eq(users.email, 'admin@aino.com')).limit(1)
    if (admin) {
      const mockUser: TIdentity = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        roles: admin.roles as unknown as string[],
      }
      c.set('user', mockUser)
    }
  }

  await next()
}

// Mock 必需认证中间件（临时使用）
export async function mockRequireAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return c.json({ success: false, error: '认证失败' }, 401)
  }

  // 兼容 test-token
  if (token === 'test-token') {
    const [admin] = await db.select().from(users).where(eq(users.email, 'admin@aino.com')).limit(1)
    if (!admin) {
      return c.json({ success: false, error: '管理员用户不存在' }, 401)
    }
    const mockUser: TIdentity = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      roles: admin.roles as unknown as string[],
    }
    c.set('user', mockUser)
    return next()
  }

  // 尝试严格 JWT 校验
  const identity = await getUserFromToken(token)
  if (identity) {
    c.set('user', identity)
    return next()
  }

  // 开发环境下，尝试宽松解码
  if (process.env.NODE_ENV !== 'production') {
    try {
      const decoded: any = jwt.decode(token)
      if (decoded && decoded.userId) {
        const [u] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1)
        if (u) {
          const ident: TIdentity = {
            id: u.id,
            email: u.email,
            name: u.name,
            roles: u.roles as unknown as string[],
          }
          c.set('user', ident)
          return next()
        }
      }
    } catch { }
  }

  return c.json({ success: false, error: '认证失败' }, 401)
}

// 认证中间件
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (token) {
    const user = await getUserFromToken(token)
    if (user) {
      c.set('user', user)
    }
  }

  await next()
}

// 必需认证中间件（未认证返回 401）
export async function requireAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return c.json({ success: false, error: '未提供认证令牌' }, 401)
  }

  // 兼容 test-token（开发联调）
  if (token === 'test-token') {
    const [admin] = await db.select().from(users).where(eq(users.email, 'admin@aino.com')).limit(1)
    if (!admin) {
      return c.json({ success: false, error: '管理员用户不存在' }, 401)
    }
    const mockUser: TIdentity = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      roles: admin.roles as unknown as string[],
    }
    c.set('user', mockUser)
    return next()
  }

  // 优先严格校验 JWT
  const user = await getUserFromToken(token)
  if (user) {
    c.set('user', user)
    return next()
  }

  // 开发环境下，尝试宽松解码（不校验签名，仅做联调用）
  if (process.env.NODE_ENV !== 'production') {
    try {
      const decoded: any = jwt.decode(token)
      if (decoded && decoded.userId) {
        const [u] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1)
        if (u) {
          const identity: TIdentity = {
            id: u.id,
            email: u.email,
            name: u.name,
            roles: u.roles as unknown as string[],
          }
          c.set('user', identity)
          return next()
        }
      }
    } catch { }
  }

  return c.json({ success: false, error: '认证令牌无效或已过期' }, 401)
}

// 角色验证中间件
export function requireRole(roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as TIdentity | undefined

    if (!user) {
      return c.json({ success: false, error: '需要认证' }, 401)
    }

    const hasRole = user.roles.some(role => roles.includes(role))
    if (!hasRole) {
      return c.json({ success: false, error: '权限不足' }, 403)
    }

    await next()
  }
}
