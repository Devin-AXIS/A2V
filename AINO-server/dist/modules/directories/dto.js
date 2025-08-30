import { z } from "zod";
export const CreateDirectoryRequest = z.object({
    name: z.string().min(1, "目录名称不能为空").max(64, "目录名称不能超过64个字符"),
    type: z.enum(["table", "category", "form"]),
    supportsCategory: z.boolean().default(false),
    config: z.record(z.string(), z.any()).default({}),
    order: z.number().default(0),
});
export const UpdateDirectoryRequest = z.object({
    name: z.string().min(1, "目录名称不能为空").max(64, "目录名称不能超过64个字符").optional(),
    type: z.enum(["table", "category", "form"]).optional(),
    supportsCategory: z.boolean().optional(),
    config: z.record(z.string(), z.any()).optional(),
    order: z.number().optional(),
    isEnabled: z.boolean().optional(),
});
export const GetDirectoriesQuery = z.object({
    applicationId: z.string().optional(),
    moduleId: z.string().optional(),
    type: z.enum(["table", "category", "form"]).optional(),
    isEnabled: z.boolean().optional(),
    page: z.coerce.number().min(1, "页码不能少于1").default(1),
    limit: z.coerce.number().min(1, "每页数量不能少于1").max(100, "每页数量不能超过100").default(20),
});
export const DirectoryResponse = z.object({
    id: z.string(),
    applicationId: z.string(),
    moduleId: z.string(),
    name: z.string(),
    type: z.string(),
    supportsCategory: z.boolean(),
    config: z.record(z.string(), z.any()),
    order: z.number(),
    isEnabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const DirectoriesListResponse = z.object({
    directories: z.array(DirectoryResponse),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
});
//# sourceMappingURL=dto.js.map