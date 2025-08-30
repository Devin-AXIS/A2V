import { z } from "zod";
export declare const CreateApplicationRequest: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    template: z.ZodDefault<z.ZodEnum<{
        blank: "blank";
        ecom: "ecom";
        edu: "edu";
        content: "content";
        project: "project";
    }>>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const UpdateApplicationRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
        archived: "archived";
    }>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    databaseConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const GetApplicationsQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
        archived: "archived";
    }>>;
    template: z.ZodOptional<z.ZodEnum<{
        blank: "blank";
        ecom: "ecom";
        edu: "edu";
        content: "content";
        project: "project";
    }>>;
}, z.core.$strip>;
export declare const ApplicationResponse: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    ownerId: z.ZodString;
    status: z.ZodString;
    template: z.ZodString;
    config: z.ZodRecord<z.ZodString, z.ZodAny>;
    databaseConfig: z.ZodRecord<z.ZodString, z.ZodAny>;
    isPublic: z.ZodBoolean;
    version: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    owner: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>;
    _count: z.ZodOptional<z.ZodObject<{
        modules: z.ZodNumber;
        members: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const ApplicationsListResponse: z.ZodObject<{
    applications: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        ownerId: z.ZodString;
        status: z.ZodString;
        template: z.ZodString;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        databaseConfig: z.ZodRecord<z.ZodString, z.ZodAny>;
        isPublic: z.ZodBoolean;
        version: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        owner: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodString;
        }, z.core.$strip>>;
        _count: z.ZodOptional<z.ZodObject<{
            modules: z.ZodNumber;
            members: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ApplicationDetailResponse: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    ownerId: z.ZodString;
    status: z.ZodString;
    template: z.ZodString;
    config: z.ZodRecord<z.ZodString, z.ZodAny>;
    databaseConfig: z.ZodRecord<z.ZodString, z.ZodAny>;
    isPublic: z.ZodBoolean;
    version: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    owner: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>;
    _count: z.ZodOptional<z.ZodObject<{
        modules: z.ZodNumber;
        members: z.ZodNumber;
    }, z.core.$strip>>;
    modules: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        icon: z.ZodNullable<z.ZodString>;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        order: z.ZodNumber;
        isEnabled: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        directories: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            supportsCategory: z.ZodBoolean;
            config: z.ZodRecord<z.ZodString, z.ZodAny>;
            order: z.ZodNumber;
            isEnabled: z.ZodBoolean;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            _count: z.ZodObject<{
                fields: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    members: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodString;
        permissions: z.ZodRecord<z.ZodString, z.ZodAny>;
        joinedAt: z.ZodString;
        status: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodString;
            avatar: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequest>;
export type UpdateApplicationRequest = z.infer<typeof UpdateApplicationRequest>;
export type GetApplicationsQuery = z.infer<typeof GetApplicationsQuery>;
export type ApplicationResponse = z.infer<typeof ApplicationResponse>;
export type ApplicationsListResponse = z.infer<typeof ApplicationsListResponse>;
export type ApplicationDetailResponse = z.infer<typeof ApplicationDetailResponse>;
//# sourceMappingURL=dto.d.ts.map