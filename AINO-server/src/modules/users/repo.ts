import { db } from '../../db'
import { users } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { TUser, TLoginRequest, TRegisterRequest } from './dto'
import bcrypt from 'bcryptjs'

// 密码加密
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// 密码验证
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function findUserByEmail(email: string): Promise<TUser | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (result.length === 0) return null

  const user = result[0]
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || undefined,
    roles: user.roles || ['user'],
    createdAt: user.createdAt.toISOString(),
  }
}

export async function findUserById(id: string): Promise<TUser | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (result.length === 0) return null

  const user = result[0]
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || undefined,
    roles: user.roles || ['user'],
    createdAt: user.createdAt.toISOString(),
  }
}

export async function createUser(data: TRegisterRequest): Promise<TUser> {
  const hashedPassword = await hashPassword(data.password)

  const [newUser] = await db.insert(users).values({
    // let database generate uuid by default
    name: data.name,
    email: data.email,
    password: hashedPassword,
    avatar: '/generic-user-avatar.png',
    roles: ['user'],
  }).returning()

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    avatar: newUser.avatar || undefined,
    roles: newUser.roles || ['user'],
    createdAt: newUser.createdAt.toISOString(),
  }
}

export async function validatePassword(email: string, password: string): Promise<boolean> {
  const result = await db.select({ password: users.password }).from(users).where(eq(users.email, email)).limit(1)
  if (result.length === 0) return false

  return await verifyPassword(password, result[0].password)
}

export async function getAllUsers(): Promise<TUser[]> {
  const result = await db.select().from(users)
  return result.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || undefined,
    roles: user.roles || ['user'],
    createdAt: user.createdAt.toISOString(),
  }))
}

export async function updateUserById(id: string, data: Partial<Pick<TUser, 'name' | 'avatar'>>): Promise<TUser | null> {
  const updateFields: Record<string, any> = {}
  if (typeof data.name === 'string' && data.name.length > 0) updateFields.name = data.name
  if (typeof data.avatar === 'string' && data.avatar.length > 0) updateFields.avatar = data.avatar

  if (Object.keys(updateFields).length === 0) {
    // nothing to update, return current user
    return await findUserById(id)
  }

  const [updated] = await db
    .update(users)
    .set(updateFields)
    .where(eq(users.id, id))
    .returning()

  if (!updated) return null

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatar: updated.avatar || undefined,
    roles: updated.roles || ['user'],
    createdAt: updated.createdAt.toISOString(),
  }
}
