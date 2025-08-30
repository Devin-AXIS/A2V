import { z } from 'zod';
export declare const openApiConfig: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
        description: string;
    }[];
    tags: {
        name: string;
        description: string;
    }[];
};
export declare const SuccessResponse: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const ErrorResponse: z.ZodObject<{
    success: z.ZodBoolean;
    code: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    detail: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const LoginRequest: z.ZodObject<{
    email: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    username: z.ZodOptional<z.ZodString>;
    account: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
export declare const UserInfo: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
export declare const LoginResponse: z.ZodObject<{
    success: z.ZodBoolean;
    code: z.ZodOptional<z.ZodNumber>;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodObject<{
        token: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    token: z.ZodOptional<z.ZodString>;
    user: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const Application: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    slug: z.ZodString;
    ownerId: z.ZodString;
    status: z.ZodString;
    template: z.ZodString;
    config: z.ZodAny;
    databaseConfig: z.ZodAny;
    isPublic: z.ZodBoolean;
    version: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const CreateApplicationRequest: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    slug: z.ZodString;
    template: z.ZodDefault<z.ZodString>;
    config: z.ZodDefault<z.ZodAny>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UpdateApplicationRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    config: z.ZodOptional<z.ZodAny>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const GetApplicationsQuery: z.ZodObject<{
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ApplicationUser: z.ZodObject<{
    id: z.ZodString;
    applicationId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
    role: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodAny>;
    lastLoginAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const CreateApplicationUserRequest: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const UpdateApplicationUserRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const GetApplicationUsersQuery: z.ZodObject<{
    applicationId: z.ZodString;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ApplicationModule: z.ZodObject<{
    id: z.ZodString;
    applicationId: z.ZodString;
    name: z.ZodString;
    type: z.ZodString;
    icon: z.ZodString;
    config: z.ZodAny;
    order: z.ZodNumber;
    isEnabled: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const ApplicationWithModules: z.ZodObject<{
    application: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        slug: z.ZodString;
        ownerId: z.ZodString;
        status: z.ZodString;
        template: z.ZodString;
        config: z.ZodAny;
        databaseConfig: z.ZodAny;
        isPublic: z.ZodBoolean;
        version: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    modules: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        icon: z.ZodString;
        config: z.ZodAny;
        order: z.ZodNumber;
        isEnabled: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const Directory: z.ZodObject<{
    id: z.ZodString;
    applicationId: z.ZodString;
    moduleId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        table: "table";
        form: "form";
        category: "category";
    }>;
    supportsCategory: z.ZodBoolean;
    config: z.ZodAny;
    order: z.ZodNumber;
    isEnabled: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const CreateDirectoryRequest: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        table: "table";
        form: "form";
        category: "category";
    }>;
    supportsCategory: z.ZodDefault<z.ZodBoolean>;
    config: z.ZodDefault<z.ZodAny>;
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
    config: z.ZodOptional<z.ZodAny>;
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
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const DirectoriesListResponse: z.ZodObject<{
    directories: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        moduleId: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<{
            table: "table";
            form: "form";
            category: "category";
        }>;
        supportsCategory: z.ZodBoolean;
        config: z.ZodAny;
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
export declare const CreateFieldCategoryRequest: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodNumber>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    system: z.ZodDefault<z.ZodBoolean>;
    predefinedFields: z.ZodDefault<z.ZodArray<z.ZodAny>>;
}, z.core.$strip>;
export declare const UpdateFieldCategoryRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    system: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    predefinedFields: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodAny>>>;
}, z.core.$strip>;
export declare const GetFieldCategoriesQuery: z.ZodObject<{
    applicationId: z.ZodOptional<z.ZodString>;
    directoryId: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    system: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const FieldCategoryResponse: z.ZodObject<{
    id: z.ZodString;
    applicationId: z.ZodString;
    directoryId: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    order: z.ZodNumber;
    enabled: z.ZodBoolean;
    system: z.ZodBoolean;
    predefinedFields: z.ZodArray<z.ZodAny>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const FieldCategoriesListResponse: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        directoryId: z.ZodString;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        order: z.ZodNumber;
        enabled: z.ZodBoolean;
        system: z.ZodBoolean;
        predefinedFields: z.ZodArray<z.ZodAny>;
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
export declare const CreateRecordCategoryRequest: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodDefault<z.ZodString>;
    level: z.ZodDefault<z.ZodNumber>;
    parentId: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodNumber>;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UpdateRecordCategoryRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    level: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const GetRecordCategoriesQuery: z.ZodObject<{
    applicationId: z.ZodString;
    directoryId: z.ZodString;
    enabled: z.ZodOptional<z.ZodBoolean>;
    level: z.ZodOptional<z.ZodNumber>;
    parentId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const RecordCategoryResponse: z.ZodObject<{
    id: z.ZodString;
    applicationId: z.ZodString;
    directoryId: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    level: z.ZodNumber;
    parentId: z.ZodNullable<z.ZodString>;
    order: z.ZodNumber;
    enabled: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const RecordCategoriesListResponse: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        directoryId: z.ZodString;
        name: z.ZodString;
        path: z.ZodString;
        level: z.ZodNumber;
        parentId: z.ZodNullable<z.ZodString>;
        order: z.ZodNumber;
        enabled: z.ZodBoolean;
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
export declare const GetRecordsQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodOptional<z.ZodString>;
    fields: z.ZodOptional<z.ZodString>;
    filter: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const RecordResponse: z.ZodObject<{
    id: z.ZodString;
    data: z.ZodAny;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const RecordsListResponse: z.ZodObject<{
    records: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        data: z.ZodAny;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const apiRoutes: {
    health: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            status: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    login: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            email: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
                            username: z.ZodOptional<z.ZodString>;
                            account: z.ZodOptional<z.ZodString>;
                            password: z.ZodString;
                        }, z.core.$strip>;
                    };
                    'application/x-www-form-urlencoded': {
                        schema: z.ZodObject<{
                            email: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
                            username: z.ZodOptional<z.ZodString>;
                            account: z.ZodOptional<z.ZodString>;
                            password: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodNumber>;
                            message: z.ZodString;
                            data: z.ZodOptional<z.ZodObject<{
                                token: z.ZodString;
                                user: z.ZodObject<{
                                    id: z.ZodString;
                                    email: z.ZodString;
                                    name: z.ZodString;
                                }, z.core.$strip>;
                            }, z.core.$strip>>;
                            token: z.ZodOptional<z.ZodString>;
                            user: z.ZodOptional<z.ZodObject<{
                                id: z.ZodString;
                                email: z.ZodString;
                                name: z.ZodString;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getApplications: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                page: z.ZodOptional<z.ZodString>;
                limit: z.ZodOptional<z.ZodString>;
                search: z.ZodOptional<z.ZodString>;
                status: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                                description: z.ZodOptional<z.ZodString>;
                                slug: z.ZodString;
                                ownerId: z.ZodString;
                                status: z.ZodString;
                                template: z.ZodString;
                                config: z.ZodAny;
                                databaseConfig: z.ZodAny;
                                isPublic: z.ZodBoolean;
                                version: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createApplication: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodString;
                            description: z.ZodOptional<z.ZodString>;
                            slug: z.ZodString;
                            template: z.ZodDefault<z.ZodString>;
                            config: z.ZodDefault<z.ZodAny>;
                            isPublic: z.ZodDefault<z.ZodBoolean>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                                description: z.ZodOptional<z.ZodString>;
                                slug: z.ZodString;
                                ownerId: z.ZodString;
                                status: z.ZodString;
                                template: z.ZodString;
                                config: z.ZodAny;
                                databaseConfig: z.ZodAny;
                                isPublic: z.ZodBoolean;
                                version: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getApplication: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                                description: z.ZodOptional<z.ZodString>;
                                slug: z.ZodString;
                                ownerId: z.ZodString;
                                status: z.ZodString;
                                template: z.ZodString;
                                config: z.ZodAny;
                                databaseConfig: z.ZodAny;
                                isPublic: z.ZodBoolean;
                                version: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateApplication: {
        method: "put";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodOptional<z.ZodString>;
                            description: z.ZodOptional<z.ZodString>;
                            config: z.ZodOptional<z.ZodAny>;
                            isPublic: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                                description: z.ZodOptional<z.ZodString>;
                                slug: z.ZodString;
                                ownerId: z.ZodString;
                                status: z.ZodString;
                                template: z.ZodString;
                                config: z.ZodAny;
                                databaseConfig: z.ZodAny;
                                isPublic: z.ZodBoolean;
                                version: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteApplication: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            message: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getApplicationModules: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                application: z.ZodObject<{
                                    id: z.ZodString;
                                    name: z.ZodString;
                                    description: z.ZodOptional<z.ZodString>;
                                    slug: z.ZodString;
                                    ownerId: z.ZodString;
                                    status: z.ZodString;
                                    template: z.ZodString;
                                    config: z.ZodAny;
                                    databaseConfig: z.ZodAny;
                                    isPublic: z.ZodBoolean;
                                    version: z.ZodString;
                                    createdAt: z.ZodString;
                                    updatedAt: z.ZodString;
                                }, z.core.$strip>;
                                modules: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    applicationId: z.ZodString;
                                    name: z.ZodString;
                                    type: z.ZodString;
                                    icon: z.ZodString;
                                    config: z.ZodAny;
                                    order: z.ZodNumber;
                                    isEnabled: z.ZodBoolean;
                                    createdAt: z.ZodString;
                                    updatedAt: z.ZodString;
                                }, z.core.$strip>>;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getApplicationUsers: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodString;
                page: z.ZodOptional<z.ZodString>;
                limit: z.ZodOptional<z.ZodString>;
                search: z.ZodOptional<z.ZodString>;
                status: z.ZodOptional<z.ZodString>;
                role: z.ZodOptional<z.ZodString>;
                department: z.ZodOptional<z.ZodString>;
                sortBy: z.ZodOptional<z.ZodString>;
                sortOrder: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                users: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    applicationId: z.ZodString;
                                    name: z.ZodString;
                                    email: z.ZodString;
                                    phone: z.ZodOptional<z.ZodString>;
                                    avatar: z.ZodOptional<z.ZodString>;
                                    status: z.ZodString;
                                    role: z.ZodString;
                                    department: z.ZodOptional<z.ZodString>;
                                    position: z.ZodOptional<z.ZodString>;
                                    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    metadata: z.ZodOptional<z.ZodAny>;
                                    lastLoginAt: z.ZodOptional<z.ZodString>;
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
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createApplicationUser: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodString;
                            email: z.ZodString;
                            phone: z.ZodOptional<z.ZodString>;
                            avatar: z.ZodOptional<z.ZodString>;
                            role: z.ZodDefault<z.ZodString>;
                            department: z.ZodOptional<z.ZodString>;
                            position: z.ZodOptional<z.ZodString>;
                            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            metadata: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                name: z.ZodString;
                                email: z.ZodString;
                                phone: z.ZodOptional<z.ZodString>;
                                avatar: z.ZodOptional<z.ZodString>;
                                status: z.ZodString;
                                role: z.ZodString;
                                department: z.ZodOptional<z.ZodString>;
                                position: z.ZodOptional<z.ZodString>;
                                tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                metadata: z.ZodOptional<z.ZodAny>;
                                lastLoginAt: z.ZodOptional<z.ZodString>;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getApplicationUser: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            query: z.ZodObject<{
                applicationId: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                name: z.ZodString;
                                email: z.ZodString;
                                phone: z.ZodOptional<z.ZodString>;
                                avatar: z.ZodOptional<z.ZodString>;
                                status: z.ZodString;
                                role: z.ZodString;
                                department: z.ZodOptional<z.ZodString>;
                                position: z.ZodOptional<z.ZodString>;
                                tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                metadata: z.ZodOptional<z.ZodAny>;
                                lastLoginAt: z.ZodOptional<z.ZodString>;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateApplicationUser: {
        method: "put";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            query: z.ZodObject<{
                applicationId: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodOptional<z.ZodString>;
                            email: z.ZodOptional<z.ZodString>;
                            phone: z.ZodOptional<z.ZodString>;
                            avatar: z.ZodOptional<z.ZodString>;
                            status: z.ZodOptional<z.ZodString>;
                            role: z.ZodOptional<z.ZodString>;
                            department: z.ZodOptional<z.ZodString>;
                            position: z.ZodOptional<z.ZodString>;
                            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            metadata: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                name: z.ZodString;
                                email: z.ZodString;
                                phone: z.ZodOptional<z.ZodString>;
                                avatar: z.ZodOptional<z.ZodString>;
                                status: z.ZodString;
                                role: z.ZodString;
                                department: z.ZodOptional<z.ZodString>;
                                position: z.ZodOptional<z.ZodString>;
                                tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                metadata: z.ZodOptional<z.ZodAny>;
                                lastLoginAt: z.ZodOptional<z.ZodString>;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteApplicationUser: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            query: z.ZodObject<{
                applicationId: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            message: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getSystemModules: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                name: z.ZodString;
                                type: z.ZodString;
                                icon: z.ZodString;
                                config: z.ZodAny;
                                order: z.ZodNumber;
                                isEnabled: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getDirectories: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodOptional<z.ZodString>;
                moduleId: z.ZodOptional<z.ZodString>;
                type: z.ZodOptional<z.ZodEnum<{
                    table: "table";
                    form: "form";
                    category: "category";
                }>>;
                isEnabled: z.ZodOptional<z.ZodBoolean>;
                page: z.ZodOptional<z.ZodString>;
                limit: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                directories: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    applicationId: z.ZodString;
                                    moduleId: z.ZodString;
                                    name: z.ZodString;
                                    type: z.ZodEnum<{
                                        table: "table";
                                        form: "form";
                                        category: "category";
                                    }>;
                                    supportsCategory: z.ZodBoolean;
                                    config: z.ZodAny;
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
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createDirectory: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodString;
                moduleId: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodString;
                            type: z.ZodEnum<{
                                table: "table";
                                form: "form";
                                category: "category";
                            }>;
                            supportsCategory: z.ZodDefault<z.ZodBoolean>;
                            config: z.ZodDefault<z.ZodAny>;
                            order: z.ZodDefault<z.ZodNumber>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                moduleId: z.ZodString;
                                name: z.ZodString;
                                type: z.ZodEnum<{
                                    table: "table";
                                    form: "form";
                                    category: "category";
                                }>;
                                supportsCategory: z.ZodBoolean;
                                config: z.ZodAny;
                                order: z.ZodNumber;
                                isEnabled: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getDirectory: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                moduleId: z.ZodString;
                                name: z.ZodString;
                                type: z.ZodEnum<{
                                    table: "table";
                                    form: "form";
                                    category: "category";
                                }>;
                                supportsCategory: z.ZodBoolean;
                                config: z.ZodAny;
                                order: z.ZodNumber;
                                isEnabled: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateDirectory: {
        method: "put";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodOptional<z.ZodString>;
                            type: z.ZodOptional<z.ZodEnum<{
                                table: "table";
                                form: "form";
                                category: "category";
                            }>>;
                            supportsCategory: z.ZodOptional<z.ZodBoolean>;
                            config: z.ZodOptional<z.ZodAny>;
                            order: z.ZodOptional<z.ZodNumber>;
                            isEnabled: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                moduleId: z.ZodString;
                                name: z.ZodString;
                                type: z.ZodEnum<{
                                    table: "table";
                                    form: "form";
                                    category: "category";
                                }>;
                                supportsCategory: z.ZodBoolean;
                                config: z.ZodAny;
                                order: z.ZodNumber;
                                isEnabled: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteDirectory: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            message: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getFieldCategories: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodOptional<z.ZodString>;
                directoryId: z.ZodOptional<z.ZodString>;
                enabled: z.ZodOptional<z.ZodBoolean>;
                system: z.ZodOptional<z.ZodBoolean>;
                page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
                limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                categories: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    applicationId: z.ZodString;
                                    directoryId: z.ZodString;
                                    name: z.ZodString;
                                    description: z.ZodNullable<z.ZodString>;
                                    order: z.ZodNumber;
                                    enabled: z.ZodBoolean;
                                    system: z.ZodBoolean;
                                    predefinedFields: z.ZodArray<z.ZodAny>;
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
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createFieldCategory: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodString;
                directoryId: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodString;
                            description: z.ZodOptional<z.ZodString>;
                            order: z.ZodDefault<z.ZodNumber>;
                            enabled: z.ZodDefault<z.ZodBoolean>;
                            system: z.ZodDefault<z.ZodBoolean>;
                            predefinedFields: z.ZodDefault<z.ZodArray<z.ZodAny>>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                name: z.ZodString;
                                description: z.ZodNullable<z.ZodString>;
                                order: z.ZodNumber;
                                enabled: z.ZodBoolean;
                                system: z.ZodBoolean;
                                predefinedFields: z.ZodArray<z.ZodAny>;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getFieldCategory: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                name: z.ZodString;
                                description: z.ZodNullable<z.ZodString>;
                                order: z.ZodNumber;
                                enabled: z.ZodBoolean;
                                system: z.ZodBoolean;
                                predefinedFields: z.ZodArray<z.ZodAny>;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateFieldCategory: {
        method: "put";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodOptional<z.ZodString>;
                            description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                            order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
                            enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
                            system: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
                            predefinedFields: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodAny>>>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                name: z.ZodString;
                                description: z.ZodNullable<z.ZodString>;
                                order: z.ZodNumber;
                                enabled: z.ZodBoolean;
                                system: z.ZodBoolean;
                                predefinedFields: z.ZodArray<z.ZodAny>;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteFieldCategory: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            message: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getFieldDefs: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                directoryId: z.ZodOptional<z.ZodString>;
                page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
                limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                directoryId: z.ZodString;
                                key: z.ZodString;
                                kind: z.ZodString;
                                type: z.ZodString;
                                schema: z.ZodAny;
                                relation: z.ZodOptional<z.ZodAny>;
                                lookup: z.ZodOptional<z.ZodAny>;
                                computed: z.ZodOptional<z.ZodAny>;
                                validators: z.ZodOptional<z.ZodAny>;
                                readRoles: z.ZodArray<z.ZodString>;
                                writeRoles: z.ZodArray<z.ZodString>;
                                required: z.ZodBoolean;
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getFieldDef: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                directoryId: z.ZodString;
                                key: z.ZodString;
                                kind: z.ZodString;
                                type: z.ZodString;
                                schema: z.ZodAny;
                                relation: z.ZodOptional<z.ZodAny>;
                                lookup: z.ZodOptional<z.ZodAny>;
                                computed: z.ZodOptional<z.ZodAny>;
                                validators: z.ZodOptional<z.ZodAny>;
                                readRoles: z.ZodArray<z.ZodString>;
                                writeRoles: z.ZodArray<z.ZodString>;
                                required: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createFieldDef: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            json: z.ZodObject<{
                directoryId: z.ZodString;
                key: z.ZodString;
                kind: z.ZodEnum<{
                    relation: "relation";
                    lookup: "lookup";
                    computed: "computed";
                    primitive: "primitive";
                    composite: "composite";
                }>;
                type: z.ZodString;
                schema: z.ZodOptional<z.ZodAny>;
                relation: z.ZodOptional<z.ZodAny>;
                lookup: z.ZodOptional<z.ZodAny>;
                computed: z.ZodOptional<z.ZodAny>;
                validators: z.ZodOptional<z.ZodAny>;
                readRoles: z.ZodDefault<z.ZodArray<z.ZodString>>;
                writeRoles: z.ZodDefault<z.ZodArray<z.ZodString>>;
                required: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>;
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                directoryId: z.ZodString;
                                key: z.ZodString;
                                kind: z.ZodString;
                                type: z.ZodString;
                                schema: z.ZodAny;
                                relation: z.ZodOptional<z.ZodAny>;
                                lookup: z.ZodOptional<z.ZodAny>;
                                computed: z.ZodOptional<z.ZodAny>;
                                validators: z.ZodOptional<z.ZodAny>;
                                readRoles: z.ZodArray<z.ZodString>;
                                writeRoles: z.ZodArray<z.ZodString>;
                                required: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateFieldDef: {
        method: "patch";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            json: z.ZodObject<{
                key: z.ZodOptional<z.ZodString>;
                kind: z.ZodOptional<z.ZodEnum<{
                    relation: "relation";
                    lookup: "lookup";
                    computed: "computed";
                    primitive: "primitive";
                    composite: "composite";
                }>>;
                type: z.ZodOptional<z.ZodString>;
                schema: z.ZodOptional<z.ZodAny>;
                relation: z.ZodOptional<z.ZodAny>;
                lookup: z.ZodOptional<z.ZodAny>;
                computed: z.ZodOptional<z.ZodAny>;
                validators: z.ZodOptional<z.ZodAny>;
                readRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
                writeRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
                required: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                directoryId: z.ZodString;
                                key: z.ZodString;
                                kind: z.ZodString;
                                type: z.ZodString;
                                schema: z.ZodAny;
                                relation: z.ZodOptional<z.ZodAny>;
                                lookup: z.ZodOptional<z.ZodAny>;
                                computed: z.ZodOptional<z.ZodAny>;
                                validators: z.ZodOptional<z.ZodAny>;
                                readRoles: z.ZodArray<z.ZodString>;
                                writeRoles: z.ZodArray<z.ZodString>;
                                required: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteFieldDef: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getDirectoryDefs: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodOptional<z.ZodString>;
                directoryId: z.ZodOptional<z.ZodString>;
                status: z.ZodOptional<z.ZodString>;
                page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
                limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                slug: z.ZodString;
                                title: z.ZodString;
                                version: z.ZodNumber;
                                status: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getDirectoryDef: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                slug: z.ZodString;
                                title: z.ZodString;
                                version: z.ZodNumber;
                                status: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getDirectoryDefBySlug: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                slug: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                slug: z.ZodString;
                                title: z.ZodString;
                                version: z.ZodNumber;
                                status: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createDirectoryDef: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            json: z.ZodObject<{
                slug: z.ZodString;
                title: z.ZodString;
                version: z.ZodOptional<z.ZodNumber>;
                status: z.ZodOptional<z.ZodString>;
                applicationId: z.ZodString;
                directoryId: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                slug: z.ZodString;
                                title: z.ZodString;
                                version: z.ZodNumber;
                                status: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateDirectoryDef: {
        method: "patch";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            json: z.ZodObject<{
                slug: z.ZodOptional<z.ZodString>;
                title: z.ZodOptional<z.ZodString>;
                version: z.ZodOptional<z.ZodNumber>;
                status: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                slug: z.ZodString;
                                title: z.ZodString;
                                version: z.ZodNumber;
                                status: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteDirectoryDef: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                slug: z.ZodString;
                                title: z.ZodString;
                                version: z.ZodNumber;
                                status: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getOrCreateDirectoryDefByDirectoryId: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                directoryId: z.ZodString;
            }, z.core.$strip>;
            json: z.ZodObject<{
                applicationId: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                slug: z.ZodString;
                                title: z.ZodString;
                                version: z.ZodNumber;
                                status: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            500: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getRecordCategories: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodString;
                directoryId: z.ZodString;
                enabled: z.ZodOptional<z.ZodBoolean>;
                level: z.ZodOptional<z.ZodNumber>;
                parentId: z.ZodOptional<z.ZodString>;
                page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
                limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                categories: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    applicationId: z.ZodString;
                                    directoryId: z.ZodString;
                                    name: z.ZodString;
                                    path: z.ZodString;
                                    level: z.ZodNumber;
                                    parentId: z.ZodNullable<z.ZodString>;
                                    order: z.ZodNumber;
                                    enabled: z.ZodBoolean;
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
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createRecordCategory: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            query: z.ZodObject<{
                applicationId: z.ZodString;
                directoryId: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodString;
                            path: z.ZodDefault<z.ZodString>;
                            level: z.ZodDefault<z.ZodNumber>;
                            parentId: z.ZodOptional<z.ZodString>;
                            order: z.ZodDefault<z.ZodNumber>;
                            enabled: z.ZodDefault<z.ZodBoolean>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                name: z.ZodString;
                                path: z.ZodString;
                                level: z.ZodNumber;
                                parentId: z.ZodNullable<z.ZodString>;
                                order: z.ZodNumber;
                                enabled: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getRecordCategory: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                name: z.ZodString;
                                path: z.ZodString;
                                level: z.ZodNumber;
                                parentId: z.ZodNullable<z.ZodString>;
                                order: z.ZodNumber;
                                enabled: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateRecordCategory: {
        method: "put";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            name: z.ZodOptional<z.ZodString>;
                            path: z.ZodOptional<z.ZodDefault<z.ZodString>>;
                            level: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
                            parentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                            order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
                            enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                applicationId: z.ZodString;
                                directoryId: z.ZodString;
                                name: z.ZodString;
                                path: z.ZodString;
                                level: z.ZodNumber;
                                parentId: z.ZodNullable<z.ZodString>;
                                order: z.ZodNumber;
                                enabled: z.ZodBoolean;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteRecordCategory: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            message: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getRecords: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                dirId: z.ZodString;
            }, z.core.$strip>;
            query: z.ZodObject<{
                page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
                pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
                sort: z.ZodOptional<z.ZodString>;
                fields: z.ZodOptional<z.ZodString>;
                filter: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                records: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    data: z.ZodAny;
                                    createdAt: z.ZodString;
                                    updatedAt: z.ZodString;
                                }, z.core.$strip>>;
                                pagination: z.ZodObject<{
                                    page: z.ZodNumber;
                                    pageSize: z.ZodNumber;
                                    total: z.ZodNumber;
                                    totalPages: z.ZodNumber;
                                }, z.core.$strip>;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    createRecord: {
        method: "post";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                dirId: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            data: z.ZodAny;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            201: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                data: z.ZodAny;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    getRecord: {
        method: "get";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                dirId: z.ZodString;
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                data: z.ZodAny;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    updateRecord: {
        method: "put";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                dirId: z.ZodString;
                id: z.ZodString;
            }, z.core.$strip>;
            body: {
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            data: z.ZodAny;
                        }, z.core.$strip>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            data: z.ZodObject<{
                                id: z.ZodString;
                                data: z.ZodAny;
                                createdAt: z.ZodString;
                                updatedAt: z.ZodString;
                            }, z.core.$strip>;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
    deleteRecord: {
        method: "delete";
        path: string;
        tags: string[];
        summary: string;
        description: string;
        request: {
            params: z.ZodObject<{
                dirId: z.ZodString;
                id: z.ZodString;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            message: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    'application/json': {
                        schema: z.ZodObject<{
                            success: z.ZodBoolean;
                            code: z.ZodOptional<z.ZodString>;
                            message: z.ZodString;
                            detail: z.ZodOptional<z.ZodAny>;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=openapi.d.ts.map