import { Hono } from "hono";
import { mockRequireAuthMiddleware } from "../../middleware/auth";
import applicationUsersRoute from "../application-users/routes";
import { moduleRegistry, registerSystemModules, isRemoteModule } from "../../platform/modules/registry";
import remoteProxy from "../../platform/modules/proxy";
const app = new Hono();
registerSystemModules();
app.get("/system", mockRequireAuthMiddleware, async (c) => {
    const user = c.get("user");
    const systemModules = moduleRegistry.getLocalModules();
    return c.json({
        success: true,
        data: {
            modules: systemModules.map(module => ({
                key: module.key,
                name: module.name,
                type: "system",
                icon: getModuleIcon(module.key),
                description: module.description,
                version: module.version,
                routes: module.routes,
            })),
        },
    });
});
app.all("/system/:moduleKey/*", mockRequireAuthMiddleware, async (c) => {
    const moduleKey = c.req.param("moduleKey");
    const user = c.get("user");
    if (!moduleRegistry.has(moduleKey)) {
        return c.json({
            success: false,
            error: "模块不存在",
        }, 404);
    }
    if (isRemoteModule(moduleKey)) {
        return remoteProxy.fetch(c.req, { user });
    }
    const validModules = ["user", "config", "audit"];
    if (!validModules.includes(moduleKey)) {
        return c.json({
            success: false,
            error: "系统模块不存在",
        }, 404);
    }
    switch (moduleKey) {
        case "user":
            return await handleUserModule(c, user);
        case "config":
            return await handleConfigModule(c, user);
        case "audit":
            return await handleAuditModule(c, user);
        default:
            return c.json({
                success: false,
                error: "系统模块暂未实现",
            }, 501);
    }
});
async function handleUserModule(c, user) {
    const path = c.req.path.replace("/api/modules/system/user", "");
    const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
    if (!applicationId) {
        return c.json({
            success: false,
            error: "缺少应用ID参数",
        }, 400);
    }
    c.req.header("x-application-id", applicationId);
    return applicationUsersRoute.fetch(c.req, {
        applicationId,
    });
}
async function handleConfigModule(c, user) {
    const path = c.req.path.replace("/api/modules/system/config", "");
    const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
    if (!applicationId) {
        return c.json({
            success: false,
            error: "缺少应用ID参数",
        }, 400);
    }
    switch (c.req.method) {
        case "GET":
            if (path === "/" || path === "") {
                return c.json({
                    success: true,
                    data: {
                        applicationId,
                        config: {
                            name: "应用配置",
                            description: "应用基础配置管理",
                            allowRegistration: true,
                            requireEmailVerification: false,
                        },
                    },
                });
            }
            break;
        case "PUT":
            if (path === "/" || path === "") {
                const body = await c.req.json();
                return c.json({
                    success: true,
                    data: {
                        applicationId,
                        config: body,
                        updatedAt: new Date().toISOString(),
                    },
                });
            }
            break;
    }
    return c.json({
        success: false,
        error: "配置模块API暂未实现",
    }, 501);
}
async function handleAuditModule(c, user) {
    const path = c.req.path.replace("/api/modules/system/audit", "");
    const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
    if (!applicationId) {
        return c.json({
            success: false,
            error: "缺少应用ID参数",
        }, 400);
    }
    switch (c.req.method) {
        case "GET":
            if (path === "/" || path === "") {
                return c.json({
                    success: true,
                    data: {
                        applicationId,
                        logs: [
                            {
                                id: "log-1",
                                action: "user.login",
                                userId: user.id,
                                timestamp: new Date().toISOString(),
                                details: {
                                    ip: "127.0.0.1",
                                    userAgent: "Mozilla/5.0...",
                                },
                            },
                        ],
                        pagination: {
                            page: 1,
                            limit: 20,
                            total: 1,
                            totalPages: 1,
                        },
                    },
                });
            }
            break;
    }
    return c.json({
        success: false,
        error: "审计模块API暂未实现",
    }, 501);
}
app.get("/", mockRequireAuthMiddleware, async (c) => {
    const user = c.get("user");
    const allModules = moduleRegistry.getAll();
    return c.json({
        success: true,
        data: {
            modules: allModules.map(module => ({
                key: module.key,
                name: module.name,
                version: module.version,
                kind: module.kind,
                description: module.description,
                author: module.author,
                homepage: module.homepage,
                routes: module.routes,
                ...(module.kind === 'remote' && {
                    baseUrl: module.baseUrl,
                }),
            })),
        },
    });
});
app.get("/list", mockRequireAuthMiddleware, async (c) => {
    const user = c.get("user");
    const allModules = moduleRegistry.getAll();
    return c.json({
        success: true,
        data: {
            modules: allModules.map(module => ({
                key: module.key,
                name: module.name,
                version: module.version,
                kind: module.kind,
                description: module.description,
                author: module.author,
                homepage: module.homepage,
                routes: module.routes,
                ...(module.kind === 'remote' && {
                    baseUrl: module.baseUrl,
                }),
            })),
        },
    });
});
app.get("/remote", mockRequireAuthMiddleware, async (c) => {
    const user = c.get("user");
    const remoteModules = moduleRegistry.getRemoteModules();
    return c.json({
        success: true,
        data: {
            modules: remoteModules.map(module => ({
                key: module.key,
                name: module.name,
                version: module.version,
                baseUrl: module.baseUrl,
                description: module.description,
                author: module.author,
                homepage: module.homepage,
                routes: module.routes,
            })),
        },
    });
});
app.all("/remote/:moduleKey/*", mockRequireAuthMiddleware, async (c) => {
    const user = c.get("user");
    return remoteProxy.fetch(c.req, { user });
});
app.get("/:moduleKey", mockRequireAuthMiddleware, async (c) => {
    const moduleKey = c.req.param("moduleKey");
    const user = c.get("user");
    const module = moduleRegistry.get(moduleKey);
    if (!module) {
        return c.json({
            success: false,
            error: "模块不存在",
        }, 404);
    }
    return c.json({
        success: true,
        data: {
            key: module.key,
            name: module.name,
            version: module.version,
            kind: module.kind,
            description: module.description,
            author: module.author,
            homepage: module.homepage,
            routes: module.routes,
            ...(module.kind === 'remote' && {
                baseUrl: module.baseUrl,
            }),
        },
    });
});
function getModuleIcon(moduleKey) {
    const iconMap = {
        user: "users",
        config: "settings",
        audit: "activity",
    };
    return iconMap[moduleKey] || "package";
}
export default app;
//# sourceMappingURL=routes.js.map