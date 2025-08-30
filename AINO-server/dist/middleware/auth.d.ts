import { Context, Next } from 'hono';
export declare function mockAuthMiddleware(c: Context, next: Next): Promise<void>;
export declare function mockRequireAuthMiddleware(c: Context, next: Next): Promise<void | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">)>;
export declare function authMiddleware(c: Context, next: Next): Promise<void>;
export declare function requireAuthMiddleware(c: Context, next: Next): Promise<void | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">)>;
export declare function requireRole(roles: string[]): (c: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 403, "json">) | undefined>;
//# sourceMappingURL=auth.d.ts.map