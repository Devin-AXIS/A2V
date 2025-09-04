import jwt from 'jsonwebtoken'
import { env } from '../env'
import { TJWTPayload, TIdentity } from './identity'
import { findUserById } from '../modules/users/repo'

// JWT 密钥（实际应该从环境变量获取）
const JWT_SECRET = process.env.JWT_SECRET || 'aino-jwt-secret-key-2024'

// 生成 JWT Token
export function generateToken(userId: string, email: string, roles: string[]): string {
  const payload: TJWTPayload = {
    userId,
    email,
    roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时过期
  }
  
  return jwt.sign(payload, JWT_SECRET)
}

// 验证 JWT Token
export function verifyToken(token: string): TJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TJWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

// 从 Token 获取用户身份
export async function getUserFromToken(token: string): Promise<TIdentity | null> {
  const payload = verifyToken(token)
  if (!payload) return null
  
  // 检查 token 是否过期
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null
  }
  
  // 从数据库获取最新用户信息
  const user = await findUserById(payload.userId)
  if (!user) return null
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    avatar: user.avatar,
  }
}

// 从请求头提取 Token
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}
