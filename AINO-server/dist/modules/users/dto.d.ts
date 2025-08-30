import { z } from "zod";
export declare const LoginReq: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const LoginResp: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        token: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TLoginReq = z.infer<typeof LoginReq>;
export declare const GetCurrentUserResp: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<{
            admin: "admin";
            operator: "operator";
            viewer: "viewer";
        }>;
        permissions: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TGetCurrentUserResp = z.infer<typeof GetCurrentUserResp>;
//# sourceMappingURL=dto.d.ts.map