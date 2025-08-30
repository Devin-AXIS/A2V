import { z } from 'zod';
export const Identity = z.object({
    id: z.string(),
    displayName: z.string().optional(),
    roles: z.array(z.string()).default([]),
});
export function createIdentity(id, displayName, roles = []) {
    return {
        id,
        displayName,
        roles,
    };
}
export function validateIdentity(data) {
    return Identity.parse(data);
}
//# sourceMappingURL=identity.js.map