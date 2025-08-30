import { z } from 'zod';
export declare const Identity: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    roles: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type TIdentity = z.infer<typeof Identity>;
export interface IdentityContext {
    user?: TIdentity;
}
export declare function createIdentity(id: string, displayName?: string, roles?: string[]): TIdentity;
export declare function validateIdentity(data: unknown): TIdentity;
//# sourceMappingURL=identity.d.ts.map