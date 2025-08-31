import type { CreateApplicationRequest, UpdateApplicationRequest, GetApplicationsQuery } from "./dto";
export declare class ApplicationRepository {
    create(data: CreateApplicationRequest & {
        ownerId: string;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        slug: string;
        ownerId: string;
        status: string;
        template: string | null;
        config: unknown;
        databaseConfig: unknown;
        isPublic: boolean | null;
        version: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findMany(query: GetApplicationsQuery & {
        userId: string;
    }): Promise<{
        applications: any[];
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    findById(id: string, userId: string): Promise<{
        modules: {
            directories: {
                id: string;
                name: string;
                type: string;
                supportsCategory: boolean | null;
                config: unknown;
                order: number | null;
                isEnabled: boolean | null;
                createdAt: Date;
                updatedAt: Date;
                _count: {
                    fields: number;
                };
            }[];
            id: string;
            name: string;
            type: string;
            icon: string | null;
            config: unknown;
            order: number | null;
            isEnabled: boolean | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        members: any[];
        id: string;
        name: string;
        description: string | null;
        slug: string;
        ownerId: string;
        status: string;
        template: string | null;
        config: unknown;
        databaseConfig: unknown;
        isPublic: boolean | null;
        version: string | null;
        createdAt: Date;
        updatedAt: Date;
        owner: {
            id: string;
            name: string;
            email: string;
        } | null;
    } | null>;
    update(id: string, data: UpdateApplicationRequest, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        slug: string;
        ownerId: string;
        status: string;
        template: string | null;
        config: unknown;
        databaseConfig: unknown;
        isPublic: boolean | null;
        version: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    delete(id: string, userId: string): Promise<boolean>;
    findMember(applicationId: string, userId: string): Promise<any>;
    private generateSlug;
}
//# sourceMappingURL=repo.d.ts.map