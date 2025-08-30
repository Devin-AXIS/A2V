import { TJWTPayload, TIdentity } from './identity';
export declare function generateToken(userId: string, email: string, roles: string[]): string;
export declare function verifyToken(token: string): TJWTPayload | null;
export declare function getUserFromToken(token: string): Promise<TIdentity | null>;
export declare function extractTokenFromHeader(authHeader: string | undefined): string | null;
//# sourceMappingURL=auth.d.ts.map