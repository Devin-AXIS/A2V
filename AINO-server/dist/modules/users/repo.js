import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
export async function findUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0)
        return null;
    const user = result[0];
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        roles: user.roles || ['user'],
        createdAt: user.createdAt.toISOString(),
    };
}
export async function findUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0)
        return null;
    const user = result[0];
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        roles: user.roles || ['user'],
        createdAt: user.createdAt.toISOString(),
    };
}
export async function createUser(data) {
    const hashedPassword = await hashPassword(data.password);
    const userId = Math.random().toString(36).slice(2, 10);
    const [newUser] = await db.insert(users).values({
        id: userId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        avatar: '/generic-user-avatar.png',
        roles: ['user'],
    }).returning();
    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar || undefined,
        roles: newUser.roles || ['user'],
        createdAt: newUser.createdAt.toISOString(),
    };
}
export async function validatePassword(email, password) {
    const result = await db.select({ password: users.password }).from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0)
        return false;
    return await verifyPassword(password, result[0].password);
}
export async function getAllUsers() {
    const result = await db.select().from(users);
    return result.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        roles: user.roles || ['user'],
        createdAt: user.createdAt.toISOString(),
    }));
}
//# sourceMappingURL=repo.js.map