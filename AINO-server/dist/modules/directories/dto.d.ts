import { z } from "zod";
export declare const CreateDirectoryRequest: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        table: "table";
        form: "form";
        category: "category";
    }>;
    supportsCategory: z.ZodDefault<z.ZodBoolean>;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    order: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const UpdateDirectoryRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        table: "table";
        form: "form";
        category: "category";
    }>>;
    supportsCategory: z.ZodOptional<z.ZodBoolean>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    order: z.ZodOptional<z.ZodNumber>;
    isEnabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const GetDirectoriesQuery: z.ZodObject<{
    applicationId: z.ZodOptional<z.ZodString>;
    moduleId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        table: "table";
        form: "form";
        category: "category";
    }>>;
    isEnabled: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const DirectoryResponse: z.ZodObject<{
    id: z.ZodString;
    applicationId: z.ZodString;
    moduleId: z.ZodString;
    name: z.ZodString;
    type: z.ZodString;
    supportsCategory: z.ZodBoolean;
    config: z.ZodRecord<z.ZodString, z.ZodAny>;
    order: z.ZodNumber;
    isEnabled: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const DirectoriesListResponse: z.ZodObject<{
    directories: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        moduleId: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        supportsCategory: z.ZodBoolean;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        order: z.ZodNumber;
        isEnabled: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateDirectoryRequest = z.infer<typeof CreateDirectoryRequest>;
export type UpdateDirectoryRequest = z.infer<typeof UpdateDirectoryRequest>;
export type GetDirectoriesQuery = z.infer<typeof GetDirectoriesQuery>;
export type DirectoryResponse = z.infer<typeof DirectoryResponse>;
export type DirectoriesListResponse = z.infer<typeof DirectoriesListResponse>;
//# sourceMappingURL=dto.d.ts.map