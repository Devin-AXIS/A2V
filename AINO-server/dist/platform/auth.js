import jwt from 'jsonwebtoken';
import { findUserById } from '../modules/users/repo';
const JWT_SECRET = process.env.JWT_SECRET || 'aino-jwt-secret-key-2024';
export function generateToken(userId, email, roles) {
    const payload = {
        userId,
        email,
        roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    };
    return jwt.sign(payload, JWT_SECRET);
}
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
}
export async function getUserFromToken(token) {
    const payload = verifyToken(token);
    if (!payload)
        return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
    }
    const user = await findUserById(payload.userId);
    if (!user)
        return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        avatar: user.avatar,
    };
}
export function extractTokenFromHeader(authHeader) {
    if (!authHeader)
        return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1];
}
//# sourceMappingURL=auth.js.map