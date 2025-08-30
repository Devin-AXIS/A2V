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
export declare const apiRoutes: {
    health: {
        method: string;
        path: string;
        tags: string[];
        summary: string;
        description: string;
        responses: {
            200: {
                description: string;
                content: {
                    'text/plain': {
                        schema: z.ZodString;
                    };
                };
            };
        };
    };
    login: {
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
        method: string;
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
};
//# sourceMappingURL=openapi-new.d.ts.map