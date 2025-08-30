import { TUser, TRegisterRequest } from './dto';
export declare function findUserByEmail(email: string): Promise<TUser | null>;
export declare function findUserById(id: string): Promise<TUser | null>;
export declare function createUser(data: TRegisterRequest): Promise<TUser>;
export declare function validatePassword(email: string, password: string): Promise<boolean>;
export declare function getAllUsers(): Promise<TUser[]>;
//# sourceMappingURL=repo.d.ts.map