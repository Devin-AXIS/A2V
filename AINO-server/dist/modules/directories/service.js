import { DirectoryRepository } from "./repo";
import { RecordCategoriesRepository } from "../record-categories/repo";
import { FieldDefsService } from "../field-defs/service";
export class DirectoryService {
    repo = new DirectoryRepository();
    recordCategoriesRepo = new RecordCategoriesRepository();
    fieldDefsService = new FieldDefsService();
    async checkUserAccess(applicationId, userId) {
        try {
            console.log("权限检查:", { applicationId, userId });
            return true;
        }
        catch (error) {
            console.error("检查用户权限失败:", error);
            return false;
        }
    }
    async getDirectoryCategories(directoryId, applicationId) {
        try {
            const categories = await this.recordCategoriesRepo.findMany({
                applicationId,
                directoryId,
                page: 1,
                limit: 100
            }, applicationId);
            return this.convertCategoriesToFrontendFormat(categories.categories);
        }
        catch (error) {
            console.error("获取目录分类数据失败:", error);
            return [
                {
                    id: "mock-category-1",
                    name: "测试分类",
                    children: []
                }
            ];
        }
    }
    async getDirectoryFields(directoryId) {
        try {
            const directoryDef = await this.repo.getDirectoryDefByDirectoryId(directoryId);
            if (!directoryDef) {
                console.log("未找到目录定义:", directoryId);
                return [];
            }
            const fieldDefs = await this.fieldDefsService.getFieldDefsByDirectoryId(directoryDef.id);
            return fieldDefs.map(field => ({
                id: field.id,
                key: field.key,
                type: field.type,
                label: field.schema?.label || field.key,
                required: field.required,
                showInForm: field.schema?.showInForm ?? true,
                showInList: field.schema?.showInList ?? true,
                showInDetail: field.schema?.showInDetail ?? true,
                enabled: true,
                options: field.schema?.options || [],
                validators: field.validators,
                description: field.schema?.description || "",
                placeholder: field.schema?.placeholder || "",
                preset: field.schema?.preset || undefined
            }));
        }
        catch (error) {
            console.error("获取目录字段定义失败:", error);
            return [];
        }
    }
    convertCategoriesToFrontendFormat(categories) {
        return categories.map(category => ({
            id: category.id,
            name: category.name,
            children: category.children ? this.convertCategoriesToFrontendFormat(category.children) : []
        }));
    }
    async create(data, applicationId, moduleId, userId) {
        const hasAccess = await this.checkUserAccess(applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限访问该应用");
        }
        const nameExists = await this.repo.checkNameExists(data.name, applicationId);
        if (nameExists) {
            throw new Error("目录名称已存在");
        }
        const result = await this.repo.create(data, applicationId, moduleId);
        console.log("创建目录成功:", result.id);
        return result;
    }
    async findMany(query, userId) {
        console.log("获取目录列表:", { query, userId });
        try {
            const result = await this.repo.findMany(query);
            const directoriesWithData = await Promise.all(result.directories.map(async (dir) => {
                try {
                    const [categories, fields] = await Promise.all([
                        this.getDirectoryCategories(dir.id, query.applicationId),
                        this.getDirectoryFields(dir.id)
                    ]);
                    return {
                        ...dir,
                        config: {
                            ...dir.config,
                            categories: categories,
                            fields: fields
                        }
                    };
                }
                catch (error) {
                    console.error(`获取目录 ${dir.id} 的数据失败:`, error);
                    return {
                        ...dir,
                        config: {
                            ...dir.config,
                            categories: [],
                            fields: []
                        }
                    };
                }
            }));
            console.log("查询目录列表成功，共", directoriesWithData.length, "个目录");
            return {
                ...result,
                directories: directoriesWithData
            };
        }
        catch (error) {
            console.error("获取目录列表失败:", error);
            const mockDirectories = [
                {
                    id: "c9f11a42-19fc-4e3f-a9d3-0e6ffa695b1b",
                    applicationId: query.applicationId || "0f6c007e-0d10-4119-abb9-85eef2e82dcc",
                    moduleId: "fa9d9c7c-9cc6-4aa1-ade9-b259c99b74e3",
                    name: "测试目录",
                    type: "table",
                    supportsCategory: false,
                    config: {
                        categories: [
                            {
                                id: "mock-category-1",
                                name: "测试分类",
                                children: []
                            }
                        ]
                    },
                    order: 0,
                    isEnabled: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            return {
                directories: mockDirectories,
                pagination: {
                    page: query.page || 1,
                    limit: query.limit || 20,
                    total: mockDirectories.length,
                    totalPages: 1
                }
            };
        }
    }
    async findById(id, userId) {
        const result = await this.repo.findById(id);
        if (!result) {
            return null;
        }
        const hasAccess = await this.checkUserAccess(result.applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限访问该目录");
        }
        console.log("查询目录详情成功:", result.id);
        return result;
    }
    async update(id, data, userId) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            return null;
        }
        const hasAccess = await this.checkUserAccess(existing.applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限修改该目录");
        }
        if (data.name && data.name !== existing.name) {
            const nameExists = await this.repo.checkNameExists(data.name, existing.applicationId, id);
            if (nameExists) {
                throw new Error("目录名称已存在");
            }
        }
        const result = await this.repo.update(id, data);
        console.log("更新目录成功:", result?.id);
        return result;
    }
    async delete(id, userId) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            return false;
        }
        const hasAccess = await this.checkUserAccess(existing.applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限删除该目录");
        }
        const result = await this.repo.delete(id);
        console.log("删除目录成功:", result);
        return result;
    }
}
//# sourceMappingURL=service.js.map