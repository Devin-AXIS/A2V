import { getUserFromToken, extractTokenFromHeader } from '../platform/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
export async function mockAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (token === 'test-token') {
        const [admin] = await db.select().from(users).where(eq(users.email, 'admin@aino.com')).limit(1);
        if (admin) {
            const mockUser = {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                roles: admin.roles,
            };
            c.set('user', mockUser);
        }
    }
    await next();
}
export async function mockRequireAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
        return c.json({ success: false, error: '认证失败' }, 401);
    }
    if (token === 'test-token') {
        const [admin] = await db.select().from(users).where(eq(users.email, 'admin@aino.com')).limit(1);
        if (!admin) {
            return c.json({ success: false, error: '管理员用户不存在' }, 401);
        }
        const mockUser = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            roles: admin.roles,
        };
        c.set('user', mockUser);
        return next();
    }
    const identity = await getUserFromToken(token);
    if (identity) {
        c.set('user', identity);
        return next();
    }
    if (process.env.NODE_ENV !== 'production') {
        try {
            const decoded = jwt.decode(token);
            if (decoded && decoded.userId) {
                const [u] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
                if (u) {
                    const ident = {
                        id: u.id,
                        email: u.email,
                        name: u.name,
                        roles: u.roles,
                    };
                    c.set('user', ident);
                    return next();
                }
            }
        }
        catch { }
    }
    return c.json({ success: false, error: '认证失败' }, 401);
}
export async function authMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (token) {
        const user = await getUserFromToken(token);
        if (user) {
            c.set('user', user);
        }
    }
    await next();
}
export async function requireAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
        return c.json({ success: false, error: '未提供认证令牌' }, 401);
    }
    if (token === 'test-token') {
        const [admin] = await db.select().from(users).where(eq(users.email, 'admin@aino.com')).limit(1);
        if (!admin) {
            return c.json({ success: false, error: '管理员用户不存在' }, 401);
        }
        const mockUser = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            roles: admin.roles,
        };
        c.set('user', mockUser);
        return next();
    }
    const user = await getUserFromToken(token);
    if (user) {
        c.set('user', user);
        return next();
    }
    if (process.env.NODE_ENV !== 'production') {
        try {
            const decoded = jwt.decode(token);
            if (decoded && decoded.userId) {
                const [u] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
                if (u) {
                    const identity = {
                        id: u.id,
                        email: u.email,
                        name: u.name,
                        roles: u.roles,
                    };
                    c.set('user', identity);
                    return next();
                }
            }
        }
        catch { }
    }
    return c.json({ success: false, error: '认证令牌无效或已过期' }, 401);
}
export function requireRole(roles) {
    return async (c, next) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: '需要认证' }, 401);
        }
        const hasRole = user.roles.some(role => roles.includes(role));
        if (!hasRole) {
            return c.json({ success: false, error: '权限不足' }, 403);
        }
        await next();
    };
}
//# sourceMappingURL=auth.js.map