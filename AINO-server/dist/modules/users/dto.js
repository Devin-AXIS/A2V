import { z } from "zod";
export const LoginReq = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
export const LoginResp = z.object({
    success: z.literal(true),
    data: z.object({
        token: z.string(),
        user: z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string()
        })
    })
});
export const GetCurrentUserResp = z.object({
    success: z.literal(true),
    data: z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string(),
        role: z.enum(["admin", "operator", "viewer"]),
        permissions: z.array(z.string())
    })
});
//# sourceMappingURL=dto.js.map