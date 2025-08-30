import * as repo from './repo';
export class ApplicationUserService {
    async createApplicationUser(applicationId, data) {
        const emailExists = await repo.checkEmailExists(applicationId, data.email);
        if (emailExists) {
            throw new Error('邮箱已存在');
        }
        const user = await repo.createApplicationUser(applicationId, data);
        return user;
    }
    async getApplicationUsers(applicationId, query) {
        const result = await repo.getApplicationUsers(applicationId, query);
        return result;
    }
    async getApplicationUserById(applicationId, userId) {
        const user = await repo.getApplicationUserById(applicationId, userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        return user;
    }
    async updateApplicationUser(applicationId, userId, data) {
        const existingUser = await repo.getApplicationUserById(applicationId, userId);
        if (!existingUser) {
            throw new Error('用户不存在');
        }
        if (data.email && data.email !== existingUser.email) {
            const emailExists = await repo.checkEmailExists(applicationId, data.email, userId);
            if (emailExists) {
                throw new Error('邮箱已存在');
            }
        }
        const user = await repo.updateApplicationUser(applicationId, userId, data);
        return user;
    }
    async deleteApplicationUser(applicationId, userId) {
        const existingUser = await repo.getApplicationUserById(applicationId, userId);
        if (!existingUser) {
            throw new Error('用户不存在');
        }
        if (existingUser.role === 'admin') {
            const adminCount = await this.getAdminCount(applicationId);
            if (adminCount <= 1) {
                throw new Error('不能删除最后一个管理员');
            }
        }
        const user = await repo.deleteApplicationUser(applicationId, userId);
        return user;
    }
    async updateLastLoginTime(applicationId, userId) {
        const user = await repo.updateLastLoginTime(applicationId, userId);
        return user;
    }
    async getAdminCount(applicationId) {
        const result = await repo.getApplicationUsers(applicationId, {
            page: 1,
            limit: 1000,
            role: 'admin',
        });
        return result.users.length;
    }
    async batchUpdateUsers(applicationId, userIds, data) {
        const results = [];
        for (const userId of userIds) {
            try {
                const result = await this.updateApplicationUser(applicationId, userId, data);
                results.push({ userId, success: true, data: result });
            }
            catch (error) {
                results.push({ userId, success: false, error: error instanceof Error ? error.message : '未知错误' });
            }
        }
        return results;
    }
    async batchDeleteUsers(applicationId, userIds) {
        const results = [];
        for (const userId of userIds) {
            try {
                const result = await this.deleteApplicationUser(applicationId, userId);
                results.push({ userId, success: true, data: result });
            }
            catch (error) {
                results.push({ userId, success: false, error: error instanceof Error ? error.message : '未知错误' });
            }
        }
        return results;
    }
}
//# sourceMappingURL=service.js.map