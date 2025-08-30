import type { TLoginReq } from "./dto";
export declare function loginSvc(body: TLoginReq): Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}>;
export declare function getCurrentUserSvc(token: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: "admin";
    permissions: string[];
} | {
    id: string;
    email: string;
    name: string;
    role: "operator";
    permissions: string[];
} | {
    id: string;
    email: string;
    name: string;
    role: "viewer";
    permissions: string[];
}>;
//# sourceMappingURL=service.d.ts.map