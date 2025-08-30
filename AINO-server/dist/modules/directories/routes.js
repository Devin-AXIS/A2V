import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { DirectoryService } from "./service";
import { mockRequireAuthMiddleware } from "../../middleware/auth";
import { CreateDirectoryRequest, UpdateDirectoryRequest, GetDirectoriesQuery } from "./dto";
const app = new Hono();
const service = new DirectoryService();
app.get("/", mockRequireAuthMiddleware, zValidator("query", GetDirectoriesQuery), async (c) => {
    try {
        const query = c.req.valid("query");
        const user = c.get("user");
        if (query.applicationId) {
            const hasAccess = await service.checkUserAccess(query.applicationId, user.id);
            if (!hasAccess) {
                return c.json({
                    success: false,
                    error: "没有权限访问该应用"
                }, 403);
            }
        }
        const result = await service.findMany(query, user.id);
        return c.json({ success: true, data: result });
    }
    catch (error) {
        console.error("获取目录列表失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "获取目录列表失败"
        }, 500);
    }
});
app.post("/", mockRequireAuthMiddleware, zValidator("json", CreateDirectoryRequest), async (c) => {
    try {
        const data = c.req.valid("json");
        const user = c.get("user");
        const applicationId = c.req.query("applicationId");
        const moduleId = c.req.query("moduleId");
        if (!applicationId || !moduleId) {
            return c.json({
                success: false,
                error: "缺少必要的参数：applicationId 和 moduleId"
            }, 400);
        }
        const hasAccess = await service.checkUserAccess(applicationId, user.id);
        if (!hasAccess) {
            return c.json({
                success: false,
                error: "没有权限访问该应用"
            }, 403);
        }
        const result = await service.create(data, applicationId, moduleId, user.id);
        return c.json({ success: true, data: result }, 201);
    }
    catch (error) {
        console.error("创建目录失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "创建目录失败"
        }, 500);
    }
});
app.get("/:id", mockRequireAuthMiddleware, async (c) => {
    try {
        const id = c.req.param("id");
        const user = c.get("user");
        const result = await service.findById(id, user.id);
        if (!result) {
            return c.json({ success: false, error: "目录不存在" }, 404);
        }
        return c.json({ success: true, data: result });
    }
    catch (error) {
        console.error("获取目录详情失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "获取目录详情失败"
        }, 500);
    }
});
app.put("/:id", mockRequireAuthMiddleware, zValidator("json", UpdateDirectoryRequest), async (c) => {
    try {
        const id = c.req.param("id");
        const data = c.req.valid("json");
        const user = c.get("user");
        const result = await service.update(id, data, user.id);
        if (!result) {
            return c.json({ success: false, error: "目录不存在" }, 404);
        }
        return c.json({ success: true, data: result });
    }
    catch (error) {
        console.error("更新目录失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "更新目录失败"
        }, 500);
    }
});
app.delete("/:id", mockRequireAuthMiddleware, async (c) => {
    try {
        const id = c.req.param("id");
        const user = c.get("user");
        const result = await service.delete(id, user.id);
        if (!result) {
            return c.json({ success: false, error: "目录不存在" }, 404);
        }
        return c.json({ success: true, message: "目录删除成功" });
    }
    catch (error) {
        console.error("删除目录失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "删除目录失败"
        }, 500);
    }
});
export default app;
//# sourceMappingURL=routes.js.map