import { z } from 'zod';
export declare const ApplicationUser: z.ZodObject<{
    id: z.ZodString;
    applicationId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
        pending: "pending";
    }>>;
    role: z.ZodDefault<z.ZodEnum<{
        admin: "admin";
        user: "user";
        guest: "guest";
    }>>;
    department: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
    lastLoginAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TApplicationUser = z.infer<typeof ApplicationUser>;
export declare const CreateApplicationUserRequest: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        admin: "admin";
        user: "user";
        guest: "guest";
    }>>;
    department: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
}, z.core.$strip>;
export type TCreateApplicationUserRequest = z.infer<typeof CreateApplicationUserRequest>;
export declare const UpdateApplicationUserRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
        pending: "pending";
    }>>;
    role: z.ZodOptional<z.ZodEnum<{
        admin: "admin";
        user: "user";
        guest: "guest";
    }>>;
    department: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
}, z.core.$strip>;
export type TUpdateApplicationUserRequest = z.infer<typeof UpdateApplicationUserRequest>;
export declare const GetApplicationUsersQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
        pending: "pending";
    }>>;
    role: z.ZodOptional<z.ZodEnum<{
        admin: "admin";
        user: "user";
        guest: "guest";
    }>>;
    department: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        email: "email";
        name: "name";
        createdAt: "createdAt";
        lastLoginAt: "lastLoginAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type TGetApplicationUsersQuery = z.infer<typeof GetApplicationUsersQuery>;
export declare const ApplicationUserListResponse: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodObject<{
        users: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            applicationId: z.ZodString;
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            avatar: z.ZodOptional<z.ZodString>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                inactive: "inactive";
                pending: "pending";
            }>>;
            role: z.ZodDefault<z.ZodEnum<{
                admin: "admin";
                user: "user";
                guest: "guest";
            }>>;
            department: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            metadata: z.ZodDefault<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
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
export type TApplicationUserListResponse = z.infer<typeof ApplicationUserListResponse>;
export declare const ApplicationUserResponse: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<{
            active: "active";
            inactive: "inactive";
            pending: "pending";
        }>>;
        role: z.ZodDefault<z.ZodEnum<{
            admin: "admin";
            user: "user";
            guest: "guest";
        }>>;
        department: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
        lastLoginAt: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TApplicationUserResponse = z.infer<typeof ApplicationUserResponse>;
export declare const SuccessResponse: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export type TSuccessResponse = z.infer<typeof SuccessResponse>;
//# sourceMappingURL=dto.d.ts.map