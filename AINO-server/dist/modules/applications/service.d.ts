import type { CreateApplicationRequest, UpdateApplicationRequest, GetApplicationsQuery } from "./dto";
export declare class ApplicationService {
    createApplication(data: CreateApplicationRequest, userId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        version: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
        template: string | null;
        config: unknown;
        databaseConfig: unknown;
        isPublic: boolean | null;
    }>;
    private createSystemModules;
    private createDefaultDirectories;
    getApplications(query: GetApplicationsQuery, userId: string): Promise<{
        applications: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getApplicationById(id: string, userId: string): Promise<{
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
    updateApplication(id: string, data: UpdateApplicationRequest, userId: string): Promise<{
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
    deleteApplication(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    createApplicationFromTemplate(data: CreateApplicationRequest, userId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        version: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
        template: string | null;
        config: unknown;
        databaseConfig: unknown;
        isPublic: boolean | null;
    }>;
    getApplicationModules(applicationId: string, userId: string): Promise<{
        application: {
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
        };
        modules: {
            id: string;
            applicationId: string;
            name: string;
            type: string;
            icon: string | null;
            config: unknown;
            order: number | null;
            isEnabled: boolean | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
}
//# sourceMappingURL=service.d.ts.map