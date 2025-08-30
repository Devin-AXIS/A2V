import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApplicationUserService } from "./service";
import { mockRequireAuthMiddleware } from "../../middleware/auth";
import { CreateApplicationUserRequest, UpdateApplicationUserRequest, GetApplicationUsersQuery } from "./dto";
const app = new Hono();
const service = new ApplicationUserService();
app.get("/", mockRequireAuthMiddleware, zValidator("query", GetApplicationUsersQuery), async (c) => {
    try {
        const query = c.req.valid("query");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
        if (!applicationId) {
            return c.json({
                success: false,
                error: "缺少应用ID参数",
            }, 400);
        }
        const result = await service.getApplicationUsers(applicationId, query);
        return c.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error("获取应用用户列表失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "获取应用用户列表失败",
        }, 500);
    }
});
app.post("/", mockRequireAuthMiddleware, zValidator("json", CreateApplicationUserRequest), async (c) => {
    try {
        const data = c.req.valid("json");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
        if (!applicationId) {
            return c.json({
                success: false,
                error: "缺少应用ID参数",
            }, 400);
        }
        const applicationUser = await service.createApplicationUser(applicationId, data);
        return c.json({
            success: true,
            data: applicationUser,
        }, 201);
    }
    catch (error) {
        console.error("创建应用用户失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "创建应用用户失败",
        }, 400);
    }
});
app.get("/:id", mockRequireAuthMiddleware, async (c) => {
    try {
        const id = c.req.param("id");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
        if (!applicationId) {
            return c.json({
                success: false,
                error: "缺少应用ID参数",
            }, 400);
        }
        const applicationUser = await service.getApplicationUserById(applicationId, id);
        return c.json({
            success: true,
            data: applicationUser,
        });
    }
    catch (error) {
        console.error("获取应用用户详情失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "获取应用用户详情失败",
        }, 404);
    }
});
app.put("/:id", mockRequireAuthMiddleware, zValidator("json", UpdateApplicationUserRequest), async (c) => {
    try {
        const id = c.req.param("id");
        const data = c.req.valid("json");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
        if (!applicationId) {
            return c.json({
                success: false,
                error: "缺少应用ID参数",
            }, 400);
        }
        const applicationUser = await service.updateApplicationUser(applicationId, id, data);
        return c.json({
            success: true,
            data: applicationUser,
        });
    }
    catch (error) {
        console.error("更新应用用户失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "更新应用用户失败",
        }, 400);
    }
});
app.delete("/:id", mockRequireAuthMiddleware, async (c) => {
    try {
        const id = c.req.param("id");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
        if (!applicationId) {
            return c.json({
                success: false,
                error: "缺少应用ID参数",
            }, 400);
        }
        await service.deleteApplicationUser(applicationId, id);
        return c.json({
            success: true,
            message: "应用用户删除成功",
        });
    }
    catch (error) {
        console.error("删除应用用户失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "删除应用用户失败",
        }, 400);
    }
});
app.patch("/batch", mockRequireAuthMiddleware, zValidator("json", z.object({
    userIds: z.array(z.string().uuid()),
    data: UpdateApplicationUserRequest,
})), async (c) => {
    try {
        const { userIds, data } = c.req.valid("json");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
        if (!applicationId) {
            return c.json({
                success: false,
                error: "缺少应用ID参数",
            }, 400);
        }
        const results = await service.batchUpdateUsers(applicationId, userIds, data);
        return c.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        console.error("批量更新应用用户失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "批量更新应用用户失败",
        }, 400);
    }
});
app.delete("/batch", mockRequireAuthMiddleware, zValidator("json", z.object({
    userIds: z.array(z.string().uuid()),
})), async (c) => {
    try {
        const { userIds } = c.req.valid("json");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId") || c.req.header("x-application-id");
        if (!applicationId) {
            return c.json({
                success: false,
                error: "缺少应用ID参数",
            }, 400);
        }
        const results = await service.batchDeleteUsers(applicationId, userIds);
        return c.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        console.error("批量删除应用用户失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "批量删除应用用户失败",
        }, 400);
    }
});
export default app;
//# sourceMappingURL=routes.js.map