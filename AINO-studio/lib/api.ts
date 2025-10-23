// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007'

// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 用户相关类型
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  roles?: string[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  token: string
  user: User
}

// 应用相关类型
export interface Application {
  id: string
  name: string
  description: string
  slug: string
  ownerId: string
  status: string
  template: string
  config: Record<string, any>
  databaseConfig: any
  isPublic: boolean
  version: string
  createdAt: string
  updatedAt: string
}

export interface CreateApplicationRequest {
  name: string
  description?: string
  template?: string
  isPublic?: boolean
  config?: Record<string, any>
}

export interface ApplicationsListResponse {
  applications: Application[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApplicationModule {
  id: string
  applicationId: string
  name: string
  type: string
  icon: string
  config: any
  order: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ApplicationWithModules {
  application: Application
  modules: ApplicationModule[]
}

// 通用 API 请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null

  // 开发环境：如果没有token，使用默认的test-token
  if (!token) {
    token = 'test-token'
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // 检查响应内容类型
    const contentType = response.headers.get('content-type')

    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        data = { error: text }
      }
    }

    // 处理成功状态码 (200, 201, 204 等)
    if (response.ok) {
      return data
    } else {
      // 处理错误状态码
      console.error(`❌ HTTP Error: ${response.status}`, data)

      // 构造详细的错误信息
      let errorMessage = data.error || data.message || `HTTP ${response.status}`
      if (data.details && typeof data.details === 'object') {
        const detailsStr = Object.entries(data.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
        errorMessage += ` (${detailsStr})`
      }

      const error = new Error(errorMessage)
        // 将完整的错误数据附加到错误对象上，供上层处理
        ; (error as any).details = data.details
        ; (error as any).originalData = data
      throw error
    }
  } catch (error) {
    console.error(`❌ API Error:`, error)

    // 构造更详细的错误信息
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      endpoint,
      method: options.method || 'GET',
      status: error instanceof Error && (error as any).status ? (error as any).status : undefined,
      details: error instanceof Error && (error as any).details ? (error as any).details : undefined,
      originalData: error instanceof Error && (error as any).originalData ? (error as any).originalData : undefined
    }

    console.error(`❌ Error Details:`, errorDetails)
    throw error
  }
}

// 认证相关 API
export const authApi = {
  // 用户登录
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiRequest<LoginResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  // 用户注册
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    // 后端已在 /api/users 和 /users 前缀挂载
    return apiRequest<RegisterResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 获取当前用户信息（从后端读取）
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiRequest<User>('/api/users/me')
  },
  // 更新当前用户信息
  async updateCurrentUser(data: Partial<Pick<User, 'name' | 'avatar'>>): Promise<ApiResponse<User>> {
    return apiRequest<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

// 应用用户相关 API
export const applicationUsersApi = {
  // 应用用户登录
  async loginUser(applicationId: string, data: { phone_number: string; password: string }): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/system/user/login?applicationId=${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 应用用户修改密码
  async changePassword(applicationId: string, data: { phone_number: string; old_password: string; new_password: string }): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/system/user/change-password?applicationId=${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  // 获取应用用户列表
  async getApplicationUsers(applicationId: string, params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    role?: string
    department?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.department) queryParams.append('department', params.department)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const queryString = queryParams.toString()
    const endpoint = `/api/modules/system/user?applicationId=${applicationId}${queryString ? `&${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 创建应用用户
  async createApplicationUser(applicationId: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/system/user?applicationId=${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 用户注册
  async registerUser(applicationId: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/system/user/register?applicationId=${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 获取用户详情
  async getApplicationUser(applicationId: string, userId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/system/user/${userId}?applicationId=${applicationId}`)
  },

  // 更新用户
  async updateApplicationUser(applicationId: string, userId: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/system/user/${userId}?applicationId=${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除用户
  async deleteApplicationUser(applicationId: string, userId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/system/user/${userId}?applicationId=${applicationId}`, {
      method: 'DELETE',
    })
  }
}

// 应用相关 API
export const applicationsApi = {
  // 获取应用列表
  async getApplications(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    template?: string
  }): Promise<ApiResponse<ApplicationsListResponse>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/api/applications${queryString ? `?${queryString}` : ''}`

    return apiRequest<ApplicationsListResponse>(endpoint)
  },

  // 创建应用
  async createApplication(data: CreateApplicationRequest): Promise<ApiResponse<Application>> {
    return apiRequest<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 获取应用详情
  async getApplication(id: string): Promise<ApiResponse<Application>> {
    return apiRequest<Application>(`/api/applications/${id}`)
  },

  // 更新应用
  async updateApplication(id: string, data: Partial<CreateApplicationRequest>): Promise<ApiResponse<Application>> {
    return apiRequest<Application>(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除应用
  async deleteApplication(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/applications/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取应用的模块列表
  async getApplicationModules(id: string): Promise<ApiResponse<ApplicationWithModules>> {
    return apiRequest<ApplicationWithModules>(`/api/applications/${id}/modules`)
  }
}

// 目录相关 API
export const directoriesApi = {
  // 获取目录列表
  async getDirectories(params: {
    applicationId: string
    moduleId?: string
    type?: string
    isEnabled?: boolean
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/directories${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 创建目录
  async createDirectory(data: {
    name: string
    type: string
    supportsCategory: boolean
    config: any
    order: number
  }, params: {
    applicationId: string
    moduleId: string
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/directories${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新目录
  async updateDirectory(id: string, data: Partial<{
    name: string
    type: string
    supportsCategory: boolean
    config: any
    order: number
    isEnabled: boolean
  }>): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除目录
  async deleteDirectory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/directories/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取目录详情
  async getDirectory(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directories/${id}`)
  }
}

// 字段分类相关 API
export const fieldCategoriesApi = {
  // 获取字段分类列表
  async getFieldCategories(params: {
    applicationId: string
    directoryId?: string
    enabled?: boolean
    system?: boolean
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/field-categories${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 创建字段分类
  async createFieldCategory(data: {
    name: string
    description?: string
    order?: number
    enabled?: boolean
    system?: boolean
    predefinedFields?: any[]
  }, params: {
    applicationId: string
    directoryId: string
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/field-categories${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新字段分类
  async updateFieldCategory(id: string, data: Partial<{
    name: string
    description: string
    order: number
    enabled: boolean
    system: boolean
    predefinedFields: any[]
  }>): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/field-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除字段分类
  async deleteFieldCategory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/field-categories/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取字段分类详情
  async getFieldCategory(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/field-categories/${id}`)
  }
}

// 目录定义相关 API
export const directoryDefsApi = {
  // 获取目录定义列表
  async getDirectoryDefs(params: {
    applicationId?: string
    directoryId?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/directory-defs${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 获取单个目录定义
  async getDirectoryDef(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directory-defs/${id}`)
  },

  // 根据slug获取目录定义
  async getDirectoryDefBySlug(slug: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directory-defs/slug/${slug}`)
  },

  // 创建目录定义
  async createDirectoryDef(data: {
    slug: string
    title: string
    version?: number
    status?: string
    applicationId: string
    directoryId: string
  }): Promise<ApiResponse<any>> {
    return apiRequest<any>('/api/directory-defs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新目录定义
  async updateDirectoryDef(id: string, data: Partial<{
    slug: string
    title: string
    version: number
    status: string
  }>): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directory-defs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // 删除目录定义
  async deleteDirectoryDef(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/directory-defs/${id}`, {
      method: 'DELETE',
    })
  },

  // 根据旧目录ID获取或创建目录定义
  async getOrCreateDirectoryDefByDirectoryId(directoryId: string, applicationId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directory-defs/by-directory/${directoryId}`, {
      method: 'POST',
      body: JSON.stringify({ applicationId }),
    })
  }
}

// 字段相关 API
export const fieldsApi = {
  // 获取字段列表
  async getFields(params: {
    directoryId?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/field-defs${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 创建字段定义
  async createField(data: {
    directoryId: string
    key: string
    kind: string
    type: string
    schema?: any
    relation?: any
    lookup?: any
    computed?: any
    validators?: any
    readRoles?: string[]
    writeRoles?: string[]
    required?: boolean
  }): Promise<ApiResponse<any>> {
    return apiRequest<any>('/api/field-defs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新字段定义
  async updateField(id: string, data: Partial<{
    key: string
    kind: string
    type: string
    schema?: any
    relation?: any
    lookup?: any
    computed?: any
    validators?: any
    readRoles?: string[]
    writeRoles?: string[]
    required?: boolean
  }>): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/field-defs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // 删除字段
  async deleteField(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/field-defs/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取字段详情
  async getField(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/field-defs/${id}`)
  }
}

// 记录相关 API
export const recordsApi = {
  // 获取记录列表
  async listRecords(dirId: string, params: {
    page?: number
    pageSize?: number
    sort?: string
    fields?: string
    filter?: string
  } = {}): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()

    // 转换参数名：pageSize -> limit
    const backendParams = {
      page: params.page,
      limit: params.pageSize, // 后端期望的是limit参数
      sort: params.sort,
      fields: params.fields,
      filter: params.filter
    }

    Object.entries(backendParams).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/records/${dirId}${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 获取单个记录
  async getRecord(dirId: string, recordId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/records/${dirId}/${recordId}`)
  },

  // 创建记录
  async createRecord(dirId: string, data: {
    props: Record<string, any>
  }): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/records/${dirId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新记录
  async updateRecord(dirId: string, recordId: string, data: {
    props: Record<string, any>
    version?: number
  }): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/records/${dirId}/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // 删除记录
  async deleteRecord(dirId: string, recordId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/records/${dirId}/${recordId}`, {
      method: 'DELETE',
    })
  },

  // 批量删除记录
  async bulkDeleteRecords(dirId: string, recordIds: string[]): Promise<ApiResponse<{
    deletedCount: number
    failedCount: number
    results: Array<{
      recordId: string
      success: boolean
      error?: string
    }>
  }>> {
    return apiRequest(`/api/records/${dirId}/batch`, {
      method: 'DELETE',
      body: JSON.stringify({ recordIds }),
    })
  }
}

// 记录分类相关 API
export const recordCategoriesApi = {
  // 获取记录分类列表
  async getRecordCategories(params: {
    applicationId: string
    directoryId: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/record-categories${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 创建记录分类
  async createRecordCategory(data: {
    name: string
    order?: number
    enabled?: boolean
    parentId?: string
  }, params: {
    applicationId: string
    directoryId: string
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/record-categories${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新记录分类
  async updateRecordCategory(id: string, data: Partial<{
    name: string
    order: number
    enabled: boolean
    parentId: string
  }>): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/record-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除记录分类
  async deleteRecordCategory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/record-categories/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取记录分类详情
  async getRecordCategory(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/record-categories/${id}`)
  }
}

// 关联表相关类型
export interface Relation {
  id: string
  tenantId: string
  fromUrn: string
  toUrn: string
  type: 'one_to_one' | 'one_to_many' | 'many_to_many'
  metadata?: Record<string, any>
  createdAt: string
  createdBy?: string
  deletedAt?: string
}

export interface CreateRelationRequest {
  tenantId?: string
  fromUrn: string
  toUrn: string
  type: 'one_to_one' | 'one_to_many' | 'many_to_many'
  metadata?: Record<string, any>
  createdBy?: string
}

export interface UpdateRelationRequest {
  fromUrn?: string
  toUrn?: string
  type?: 'one_to_one' | 'one_to_many' | 'many_to_many'
  metadata?: Record<string, any>
  createdBy?: string
}

export interface QueryRelationsRequest {
  tenantId?: string
  fromUrn?: string
  toUrn?: string
  type?: 'one_to_one' | 'one_to_many' | 'many_to_many'
  page?: number
  limit?: number
}

// 关联表 API
const relationsApi = {
  // 创建关联
  async createRelation(data: CreateRelationRequest): Promise<ApiResponse<Relation>> {
    return apiRequest<Relation>('/api/relations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 获取关联详情
  async getRelation(id: string): Promise<ApiResponse<Relation>> {
    return apiRequest<Relation>(`/api/relations/${id}`)
  },

  // 查询关联列表
  async queryRelations(query: QueryRelationsRequest = {}): Promise<ApiResponse<{
    relations: Relation[]
    total: number
    page: number
    limit: number
  }>> {
    const params = new URLSearchParams()
    if (query.tenantId) params.append('tenantId', query.tenantId)
    if (query.fromUrn) params.append('fromUrn', query.fromUrn)
    if (query.toUrn) params.append('toUrn', query.toUrn)
    if (query.type) params.append('type', query.type)
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())

    return apiRequest<{
      relations: Relation[]
      total: number
      page: number
      limit: number
    }>(`/api/relations?${params.toString()}`)
  },

  // 更新关联
  async updateRelation(id: string, data: UpdateRelationRequest): Promise<ApiResponse<Relation>> {
    return apiRequest<Relation>(`/api/relations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除关联
  async deleteRelation(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/relations/${id}`, {
      method: 'DELETE',
    })
  },

  // 根据URN获取关联
  async getRelationsByUrn(urn: string): Promise<ApiResponse<Relation[]>> {
    return apiRequest<Relation[]>(`/api/relations/urn/${encodeURIComponent(urn)}`)
  }
}

// 模块管理相关 API
export const modulesApi = {
  // 获取已安装的模块列表
  async getInstalledModules(params: {
    applicationId: string
    page?: number
    limit?: number
    search?: string
    type?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/modules/installed${queryString ? `?${queryString}` : ''}`

    return apiRequest<any>(endpoint)
  },

  // 获取模块详情
  async getModuleDetail(applicationId: string, moduleKey: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/installed/${encodeURIComponent(moduleKey)}?applicationId=${applicationId}`)
  },

  // 安装模块
  async installModule(applicationId: string, data: {
    moduleKey: string
    moduleVersion?: string
    installConfig?: any
  }): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/install?applicationId=${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 卸载模块
  async uninstallModule(applicationId: string, moduleKey: string, data: {
    keepData?: boolean
  } = {}): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/uninstall/${encodeURIComponent(moduleKey)}?applicationId=${applicationId}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    })
  },

  // 更新模块配置（支持同时更新 moduleName 与 icon）
  async updateModuleConfig(
    applicationId: string,
    moduleKey: string,
    data: { config?: any; moduleName?: string; icon?: string } | any,
  ): Promise<ApiResponse<any>> {
    const payload: any = {}
    if (data && typeof data === 'object') {
      if (data.config !== undefined) payload.config = data.config
      else payload.config = { ...data }
      if (typeof data.moduleName === 'string') payload.moduleName = data.moduleName
      if (typeof data.icon === 'string') payload.icon = data.icon
      // 为后端 zod 校验补齐 moduleKey 字段
      payload.moduleKey = moduleKey
    }
    return apiRequest<any>(`/api/modules/config/${encodeURIComponent(moduleKey)}?applicationId=${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  // 简化的模块安装API
  async installModuleSimple(applicationId: string, data: {
    moduleKey: string
    installConfig?: any
  }): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/simple/install?applicationId=${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 简化的获取已安装模块API
  async getInstalledModulesSimple(applicationId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/simple/installed?applicationId=${applicationId}`)
  },

  // 更新模块状态
  async updateModuleStatus(applicationId: string, moduleKey: string, status: 'active' | 'disabled' | 'uninstalling'): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/status/${encodeURIComponent(moduleKey)}?applicationId=${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // 检查模块依赖
  async checkModuleDependencies(applicationId: string, moduleKey: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/dependencies/${encodeURIComponent(moduleKey)}?applicationId=${applicationId}`)
  },

  // 获取模块统计信息
  async getModuleStats(applicationId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/stats?applicationId=${applicationId}`)
  },

  // 获取可用模块列表
  async getAvailableModules(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/api/modules/available')
  },

  // 初始化系统模块
  async initializeSystemModules(applicationId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/initialize-system?applicationId=${applicationId}`, {
      method: 'POST',
    })
  },

  async getCardConfigs(): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/modules/card-configs`)
  }
}



// 导出默认 API 对象
export const api = {
  auth: authApi,
  applications: applicationsApi,
  applicationUsers: applicationUsersApi,
  directories: directoriesApi,
  directoryDefs: directoryDefsApi,
  fieldCategories: fieldCategoriesApi,
  recordCategories: recordCategoriesApi,
  fields: fieldsApi,
  records: recordsApi,
  relations: relationsApi,
  modules: modulesApi,
}
