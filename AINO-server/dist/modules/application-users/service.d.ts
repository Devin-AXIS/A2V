import type { TCreateApplicationUserRequest, TUpdateApplicationUserRequest, TGetApplicationUsersQuery } from './dto';
export declare class ApplicationUserService {
    createApplicationUser(applicationId: string, data: TCreateApplicationUserRequest): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        applicationId: string;
        metadata: unknown;
        avatar: string | null;
        role: string;
        department: string | null;
        position: string | null;
        tags: string[] | null;
        lastLoginAt: Date | null;
    }>;
    getApplicationUsers(applicationId: string, query: TGetApplicationUsersQuery): Promise<{
        users: {
            id: string;
            applicationId: string;
            name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            status: string;
            role: string;
            department: string | null;
            position: string | null;
            tags: string[] | null;
            metadata: unknown;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getApplicationUserById(applicationId: string, userId: string): Promise<{
        id: string;
        applicationId: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        status: string;
        role: string;
        department: string | null;
        position: string | null;
        tags: string[] | null;
        metadata: unknown;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateApplicationUser(applicationId: string, userId: string, data: TUpdateApplicationUserRequest): Promise<{
        id: string;
        applicationId: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        status: string;
        role: string;
        department: string | null;
        position: string | null;
        tags: string[] | null;
        metadata: unknown;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteApplicationUser(applicationId: string, userId: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        applicationId: string;
        metadata: unknown;
        avatar: string | null;
        role: string;
        department: string | null;
        position: string | null;
        tags: string[] | null;
        lastLoginAt: Date | null;
    }>;
    updateLastLoginTime(applicationId: string, userId: string): Promise<{
        id: string;
        applicationId: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        status: string;
        role: string;
        department: string | null;
        position: string | null;
        tags: string[] | null;
        metadata: unknown;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private getAdminCount;
    batchUpdateUsers(applicationId: string, userIds: string[], data: Partial<TUpdateApplicationUserRequest>): Promise<({
        userId: string;
        success: boolean;
        data: {
            id: string;
            applicationId: string;
            name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            status: string;
            role: string;
            department: string | null;
            position: string | null;
            tags: string[] | null;
            metadata: unknown;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        error?: undefined;
    } | {
        userId: string;
        success: boolean;
        error: string;
        data?: undefined;
    })[]>;
    batchDeleteUsers(applicationId: string, userIds: string[]): Promise<({
        userId: string;
        success: boolean;
        data: {
            id: string;
            email: string;
            phone: string | null;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            applicationId: string;
            metadata: unknown;
            avatar: string | null;
            role: string;
            department: string | null;
            position: string | null;
            tags: string[] | null;
            lastLoginAt: Date | null;
        };
        error?: undefined;
    } | {
        userId: string;
        success: boolean;
        error: string;
        data?: undefined;
    })[]>;
}
//# sourceMappingURL=service.d.ts.map