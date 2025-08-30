import type { CreateDirectoryRequest, UpdateDirectoryRequest, GetDirectoriesQuery, DirectoryResponse, DirectoriesListResponse } from "./dto";
export declare class DirectoryRepository {
    create(data: CreateDirectoryRequest, applicationId: string, moduleId: string): Promise<DirectoryResponse>;
    findMany(query: GetDirectoriesQuery): Promise<DirectoriesListResponse>;
    findById(id: string): Promise<any>;
    update(id: string, data: UpdateDirectoryRequest): Promise<DirectoryResponse | null>;
    delete(id: string): Promise<boolean>;
    checkNameExists(name: string, applicationId: string, excludeId?: string): Promise<boolean>;
    findApplicationById(applicationId: string): Promise<any>;
    private convertToResponse;
    getDirectoryDefByDirectoryId(directoryId: string): Promise<any>;
}
//# sourceMappingURL=repo.d.ts.map