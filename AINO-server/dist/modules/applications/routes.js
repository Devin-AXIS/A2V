import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ApplicationService } from "./service";
import { mockRequireAuthMiddleware } from "../../middleware/auth";
import { CreateApplicationRequest, UpdateApplicationRequest, GetApplicationsQuery } from "./dto";
const app = new Hono();
const service = new ApplicationService();
app.get("/", mockRequireAuthMiddleware, zValidator("query", GetApplicationsQuery), async (c) => {
    try {
        const query = c.req.valid("query");
        const user = c.get("user");
        const result = await service.getApplications(query, user.id);
        return c.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error("获取应用列表失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "获取应用列表失败",
        }, 500);
    }
});
app.post("/", mockRequireAuthMiddleware, zValidator("json", CreateApplicationRequest), async (c) => {
    try {
        const data = c.req.valid("json");
        const user = c.get("user");
        const application = await service.createApplicationFromTemplate(data, user.id);
        return c.json({
            success: true,
            data: application,
        }, 201);
    }
    catch (error) {
        console.error("创建应用失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "创建应用失败",
        }, 400);
    }
});
app.get("/:id", mockRequireAuthMiddleware, async (c) => {
    try {
        const id = c.req.param("id");
        const user = c.get("user");
        const application = await service.getApplicationById(id, user.id);
        return c.json({
            success: true,
            data: application,
        });
    }
    catch (error) {
        console.error("获取应用详情失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "获取应用详情失败",
        }, 404);
    }
});
app.put("/:id", mockRequireAuthMiddleware, zValidator("json", UpdateApplicationRequest), async (c) => {
    try {
        const id = c.req.param("id");
        const data = c.req.valid("json");
        const user = c.get("user");
        const application = await service.updateApplication(id, data, user.id);
        return c.json({
            success: true,
            data: application,
        });
    }
    catch (error) {
        console.error("更新应用失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "更新应用失败",
        }, 400);
    }
});
app.delete("/:id", mockRequireAuthMiddleware, async (c) => {
    try {
        const id = c.req.param("id");
        const user = c.get("user");
        await service.deleteApplication(id, user.id);
        return c.json({
            success: true,
            message: "应用删除成功",
        });
    }
    catch (error) {
        console.error("删除应用失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "删除应用失败",
        }, 400);
    }
});
app.get("/:id/modules", mockRequireAuthMiddleware, async (c) => {
    try {
        const id = c.req.param("id");
        const user = c.get("user");
        const result = await service.getApplicationModules(id, user.id);
        return c.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error("获取应用模块失败:", error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : "获取应用模块失败",
        }, 404);
    }
});
export default app;
//# sourceMappingURL=routes.js.map