import { z } from 'zod';
export declare const SystemModuleConfig: z.ZodObject<{
    allowRegistration: z.ZodDefault<z.ZodBoolean>;
    requireEmailVerification: z.ZodDefault<z.ZodBoolean>;
    defaultRole: z.ZodDefault<z.ZodString>;
    passwordPolicy: z.ZodDefault<z.ZodObject<{
        minLength: z.ZodDefault<z.ZodNumber>;
        requireUppercase: z.ZodDefault<z.ZodBoolean>;
        requireLowercase: z.ZodDefault<z.ZodBoolean>;
        requireNumbers: z.ZodDefault<z.ZodBoolean>;
        requireSpecialChars: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type TSystemModuleConfig = z.infer<typeof SystemModuleConfig>;
export declare const SYSTEM_MODULES: readonly [{
    readonly key: "user";
    readonly name: "用户管理";
    readonly type: "system";
    readonly icon: "users";
    readonly description: "应用内用户管理，支持用户注册、登录、权限管理";
    readonly config: {
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        defaultRole: string;
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSpecialChars: boolean;
        };
    };
}, {
    readonly key: "config";
    readonly name: "系统配置";
    readonly type: "system";
    readonly icon: "settings";
    readonly description: "应用基础配置管理";
    readonly config: {};
}, {
    readonly key: "audit";
    readonly name: "审计日志";
    readonly type: "system";
    readonly icon: "activity";
    readonly description: "记录用户操作和系统事件";
    readonly config: {};
}];
export type SystemModuleKey = typeof SYSTEM_MODULES[number]['key'];
export declare function getSystemModule(key: SystemModuleKey): {
    readonly key: "user";
    readonly name: "用户管理";
    readonly type: "system";
    readonly icon: "users";
    readonly description: "应用内用户管理，支持用户注册、登录、权限管理";
    readonly config: {
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        defaultRole: string;
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSpecialChars: boolean;
        };
    };
} | {
    readonly key: "config";
    readonly name: "系统配置";
    readonly type: "system";
    readonly icon: "settings";
    readonly description: "应用基础配置管理";
    readonly config: {};
} | {
    readonly key: "audit";
    readonly name: "审计日志";
    readonly type: "system";
    readonly icon: "activity";
    readonly description: "记录用户操作和系统事件";
    readonly config: {};
} | undefined;
export declare function getAllSystemModules(): readonly [{
    readonly key: "user";
    readonly name: "用户管理";
    readonly type: "system";
    readonly icon: "users";
    readonly description: "应用内用户管理，支持用户注册、登录、权限管理";
    readonly config: {
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        defaultRole: string;
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSpecialChars: boolean;
        };
    };
}, {
    readonly key: "config";
    readonly name: "系统配置";
    readonly type: "system";
    readonly icon: "settings";
    readonly description: "应用基础配置管理";
    readonly config: {};
}, {
    readonly key: "audit";
    readonly name: "审计日志";
    readonly type: "system";
    readonly icon: "activity";
    readonly description: "记录用户操作和系统事件";
    readonly config: {};
}];
//# sourceMappingURL=system-modules.d.ts.map