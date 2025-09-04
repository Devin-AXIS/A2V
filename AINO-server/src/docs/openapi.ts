import { OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'

// OpenAPI 配置
export const openApiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'AINO API',
    version: '1.0.0',
    description: 'AINO 应用管理平台 API 文档',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: '开发环境',
    },
  ],
  tags: [
    { name: '认证', description: '用户认证相关接口' },
    { name: '应用', description: '应用管理相关接口' },
    { name: '应用用户', description: '应用内用户管理相关接口' },
    { name: '应用模块', description: '应用模块管理相关接口' },
    { name: '目录管理', description: '目录管理相关接口' },
    { name: '字段分类', description: '字段分类管理相关接口' },
    { name: '记录分类', description: '记录分类管理相关接口' },
    { name: '字段定义', description: '字段定义管理相关接口' },
    { name: '目录定义', description: '目录定义管理相关接口' },
    { name: '记录管理', description: '记录管理相关接口' },
    { name: '健康检查', description: '系统健康检查' },
  ],
}

// 通用响应模式
export const SuccessResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
})

export const ErrorResponse = z.object({
  success: z.boolean(),
  code: z.string().optional(),
  message: z.string(),
  detail: z.any().optional(),
})

// 用户相关 Schema
export const LoginRequest = z.object({
  email: z.string().email().or(z.string().min(1)).optional(),
  username: z.string().optional(),
  account: z.string().optional(),
  password: z.string().min(1),
})

export const UserInfo = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
})

export const LoginResponse = z.object({
  success: z.boolean(),
  code: z.number().optional(),
  message: z.string(),
  data: z.object({
    token: z.string(),
    user: UserInfo,
  }).optional(),
  token: z.string().optional(),
  user: UserInfo.optional(),
})

// 应用相关 Schema
export const Application = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  ownerId: z.string(),
  status: z.string(),
  template: z.string(),
  config: z.any(),
  databaseConfig: z.any(),
  isPublic: z.boolean(),
  version: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateApplicationRequest = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  template: z.string().default('blank'),
  config: z.any().default({}),
  isPublic: z.boolean().default(false),
})

export const UpdateApplicationRequest = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  config: z.any().optional(),
  isPublic: z.boolean().optional(),
})

export const GetApplicationsQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
})

// 应用用户相关 Schema
export const ApplicationUser = z.object({
  id: z.string(),
  applicationId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  status: z.string(),
  role: z.string(),
  department: z.string().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
  lastLoginAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateApplicationUserRequest = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  role: z.string().default('user'),
  department: z.string().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
})

export const UpdateApplicationUserRequest = z.object({
  name: z.string().min(1, '姓名不能为空').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
})

export const GetApplicationUsersQuery = z.object({
  applicationId: z.string().min(1, '应用ID不能为空'),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
})

// 应用模块相关 Schema
export const ApplicationModule = z.object({
  id: z.string(),
  applicationId: z.string(),
  name: z.string(),
  type: z.string(),
  icon: z.string(),
  config: z.any(),
  order: z.number(),
  isEnabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ApplicationWithModules = z.object({
  application: Application,
  modules: z.array(ApplicationModule),
})

// 目录相关 Schema
export const Directory = z.object({
  id: z.string(),
  applicationId: z.string(),
  moduleId: z.string(),
  name: z.string(),
  type: z.enum(['table', 'category', 'form']),
  supportsCategory: z.boolean(),
  config: z.any(),
  order: z.number(),
  isEnabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateDirectoryRequest = z.object({
  name: z.string().min(1, '目录名称不能为空').max(64, '目录名称不能超过64个字符'),
  type: z.enum(['table', 'category', 'form']),
  supportsCategory: z.boolean().default(false),
  config: z.any().default({}),
  order: z.number().default(0),
})

export const UpdateDirectoryRequest = z.object({
  name: z.string().min(1, '目录名称不能为空').max(64, '目录名称不能超过64个字符').optional(),
  type: z.enum(['table', 'category', 'form']).optional(),
  supportsCategory: z.boolean().optional(),
  config: z.any().optional(),
  order: z.number().optional(),
  isEnabled: z.boolean().optional(),
})

export const GetDirectoriesQuery = z.object({
  applicationId: z.string().optional(),
  moduleId: z.string().optional(),
  type: z.enum(['table', 'category', 'form']).optional(),
  isEnabled: z.boolean().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const DirectoriesListResponse = z.object({
  directories: z.array(Directory),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// 字段分类相关 Schema
export const CreateFieldCategoryRequest = z.object({
  name: z.string().min(1, "分类名称不能为空").max(128, "分类名称不能超过128个字符"),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
  system: z.boolean().default(false),
  predefinedFields: z.array(z.any()).default([]),
})

export const UpdateFieldCategoryRequest = CreateFieldCategoryRequest.partial()

export const GetFieldCategoriesQuery = z.object({
  applicationId: z.string().optional(),
  directoryId: z.string().optional(),
  enabled: z.boolean().optional(),
  system: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const FieldCategoryResponse = z.object({
  id: z.string(),
  applicationId: z.string(),
  directoryId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  enabled: z.boolean(),
  system: z.boolean(),
  predefinedFields: z.array(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const FieldCategoriesListResponse = z.object({
  categories: z.array(FieldCategoryResponse),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// 记录分类相关 Schema
export const CreateRecordCategoryRequest = z.object({
  name: z.string().min(1, "分类名称不能为空").max(128, "分类名称不能超过128个字符"),
  path: z.string().default("/"),
  level: z.number().int().min(1).default(1),
  parentId: z.string().optional(),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
})

export const UpdateRecordCategoryRequest = CreateRecordCategoryRequest.partial()

export const GetRecordCategoriesQuery = z.object({
  applicationId: z.string().min(1, '应用ID不能为空'),
  directoryId: z.string().min(1, '目录ID不能为空'),
  enabled: z.boolean().optional(),
  level: z.number().int().min(1).optional(),
  parentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const RecordCategoryResponse = z.object({
  id: z.string(),
  applicationId: z.string(),
  directoryId: z.string(),
  name: z.string(),
  path: z.string(),
  level: z.number(),
  parentId: z.string().nullable(),
  order: z.number(),
  enabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const RecordCategoriesListResponse = z.object({
  categories: z.array(RecordCategoryResponse),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// 记录相关 Schema
export const GetRecordsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  fields: z.string().optional(),
  filter: z.string().optional(),
})

export const RecordResponse = z.object({
  id: z.string(),
  data: z.any(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const RecordsListResponse = z.object({
  records: z.array(RecordResponse),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})



// API 路由定义
export const apiRoutes = {
  // 健康检查
  health: {
    method: 'get' as const,
    path: '/health',
    tags: ['健康检查'],
    summary: '健康检查',
    description: '检查系统健康状态',
    responses: {
      200: {
        description: '系统健康',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
            }),
          },
        },
      },
    },
  },

  // 用户登录
  login: {
    method: 'post' as const,
    path: '/users/login',
    tags: ['认证'],
    summary: '用户登录',
    description: '用户登录接口，支持邮箱、用户名或账号登录',
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginRequest,
          },
          'application/x-www-form-urlencoded': {
            schema: LoginRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '登录成功',
        content: {
          'application/json': {
            schema: LoginResponse,
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取应用列表
  getApplications: {
    method: 'get' as const,
    path: '/applications',
    tags: ['应用'],
    summary: '获取应用列表',
    description: '获取当前用户的应用列表',
    request: {
      query: GetApplicationsQuery.openapi({
        param: {
          name: 'query',
          in: 'query',
        },
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(Application),
            }),
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 创建应用
  createApplication: {
    method: 'post' as const,
    path: '/applications',
    tags: ['应用'],
    summary: '创建应用',
    description: '创建新的应用',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateApplicationRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: Application,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取应用详情
  getApplication: {
    method: 'get' as const,
    path: '/applications/{id}',
    tags: ['应用'],
    summary: '获取应用详情',
    description: '根据应用ID获取应用详情',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: Application,
            }),
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '应用不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 更新应用
  updateApplication: {
    method: 'put' as const,
    path: '/applications/{id}',
    tags: ['应用'],
    summary: '更新应用',
    description: '更新应用信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateApplicationRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: Application,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '应用不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 删除应用
  deleteApplication: {
    method: 'delete' as const,
    path: '/applications/{id}',
    tags: ['应用'],
    summary: '删除应用',
    description: '删除指定应用',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: '删除失败',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '应用不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取应用模块列表
  getApplicationModules: {
    method: 'get' as const,
    path: '/applications/{id}/modules',
    tags: ['应用模块'],
    summary: '获取应用模块列表',
    description: '获取指定应用的所有模块列表，包括系统模块和自定义模块',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: ApplicationWithModules,
            }),
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '应用不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取应用用户列表
  getApplicationUsers: {
    method: 'get' as const,
    path: '/application-users',
    tags: ['应用用户'],
    summary: '获取应用用户列表',
    description: '获取指定应用的用户列表，支持分页、搜索、过滤等功能',
    request: {
      query: GetApplicationUsersQuery.openapi({
        param: {
          name: 'query',
          in: 'query',
        },
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                users: z.array(ApplicationUser),
                pagination: z.object({
                  page: z.number(),
                  limit: z.number(),
                  total: z.number(),
                  totalPages: z.number(),
                }),
              }),
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 创建应用用户
  createApplicationUser: {
    method: 'post' as const,
    path: '/application-users',
    tags: ['应用用户'],
    summary: '创建应用用户',
    description: '在指定应用中创建新用户',
    request: {
      query: z.object({
        applicationId: z.string().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: CreateApplicationUserRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: ApplicationUser,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取应用用户详情
  getApplicationUser: {
    method: 'get' as const,
    path: '/application-users/{id}',
    tags: ['应用用户'],
    summary: '获取应用用户详情',
    description: '根据用户ID获取用户详情',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
          },
        }),
      }),
      query: z.object({
        applicationId: z.string().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: ApplicationUser,
            }),
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '用户不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 更新应用用户
  updateApplicationUser: {
    method: 'put' as const,
    path: '/application-users/{id}',
    tags: ['应用用户'],
    summary: '更新应用用户',
    description: '更新指定用户的信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
          },
        }),
      }),
      query: z.object({
        applicationId: z.string().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateApplicationUserRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: ApplicationUser,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '用户不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 删除应用用户
  deleteApplicationUser: {
    method: 'delete' as const,
    path: '/application-users/{id}',
    tags: ['应用用户'],
    summary: '删除应用用户',
    description: '删除指定的应用用户',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
          },
        }),
      }),
      query: z.object({
        applicationId: z.string().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: '删除失败',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '用户不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取系统模块列表
  getSystemModules: {
    method: 'get' as const,
    path: '/modules/system',
    tags: ['应用模块'],
    summary: '获取系统模块列表',
    description: '获取所有可用的系统模块',
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(ApplicationModule),
            }),
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取目录列表
  getDirectories: {
    method: 'get' as const,
    path: '/directories',
    tags: ['目录管理'],
    summary: '获取目录列表',
    description: '获取目录列表，支持分页、搜索、过滤等功能',
    request: {
      query: GetDirectoriesQuery.openapi({
        param: {
          name: 'query',
          in: 'query',
        },
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: DirectoriesListResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该应用',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 创建目录
  createDirectory: {
    method: 'post' as const,
    path: '/directories',
    tags: ['目录管理'],
    summary: '创建目录',
    description: '创建目录并返回目录信息',
    request: {
      query: z.object({
        applicationId: z.string().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
            required: true,
            description: '应用ID',
          },
        }),
        moduleId: z.string().openapi({
          param: {
            name: 'moduleId',
            in: 'query',
            required: true,
            description: '模块ID',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: CreateDirectoryRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: Directory,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该应用',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 获取目录详情
  getDirectory: {
    method: 'get' as const,
    path: '/directories/{id}',
    tags: ['目录管理'],
    summary: '获取目录详情',
    description: '根据目录ID获取完整的目录信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '目录ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: Directory,
            }),
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该目录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '目录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 更新目录
  updateDirectory: {
    method: 'put' as const,
    path: '/directories/{id}',
    tags: ['目录管理'],
    summary: '更新目录',
    description: '更新目录信息并返回更新后的目录',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '目录ID',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateDirectoryRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: Directory,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限修改该目录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '目录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 删除目录
  deleteDirectory: {
    method: 'delete' as const,
    path: '/directories/{id}',
    tags: ['目录管理'],
    summary: '删除目录',
    description: '删除目录并返回删除结果',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '目录ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: '删除失败',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限删除该目录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '目录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 字段分类相关API
  getFieldCategories: {
    method: 'get' as const,
    path: '/field-categories',
    tags: ['字段分类'],
    summary: '获取字段分类列表',
    description: '获取字段分类列表，支持分页、过滤等功能',
    request: {
      query: GetFieldCategoriesQuery.openapi({
        param: {
          name: 'query',
          in: 'query',
        },
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: FieldCategoriesListResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该应用',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  createFieldCategory: {
    method: 'post' as const,
    path: '/field-categories',
    tags: ['字段分类'],
    summary: '创建字段分类',
    description: '创建新的字段分类',
    request: {
      query: z.object({
        applicationId: z.string().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
            description: '应用ID',
            required: true,
          },
        }),
        directoryId: z.string().openapi({
          param: {
            name: 'directoryId',
            in: 'query',
            description: '目录ID',
            required: true,
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: CreateFieldCategoryRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: FieldCategoryResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该应用',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  getFieldCategory: {
    method: 'get' as const,
    path: '/field-categories/{id}',
    tags: ['字段分类'],
    summary: '获取字段分类详情',
    description: '根据ID获取字段分类详细信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '字段分类ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: FieldCategoryResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '字段分类不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  updateFieldCategory: {
    method: 'put' as const,
    path: '/field-categories/{id}',
    tags: ['字段分类'],
    summary: '更新字段分类',
    description: '更新字段分类信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '字段分类ID',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateFieldCategoryRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: FieldCategoryResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限修改该字段分类',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '字段分类不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  deleteFieldCategory: {
    method: 'delete' as const,
    path: '/field-categories/{id}',
    tags: ['字段分类'],
    summary: '删除字段分类',
    description: '删除字段分类并返回删除结果',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '字段分类ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: '删除失败',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限删除该字段分类',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '字段分类不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 字段定义相关API
  getFieldDefs: {
    method: 'get' as const,
    path: '/field-defs',
    tags: ['字段定义'],
    summary: '获取字段定义列表',
    description: '获取字段定义列表，支持分页和筛选',
    request: {
      query: z.object({
        directoryId: z.string().optional().openapi({
          param: {
            name: 'directoryId',
            in: 'query',
            description: '目录定义ID',
          },
        }),
        page: z.coerce.number().min(1).default(1).openapi({
          param: {
            name: 'page',
            in: 'query',
            description: '页码',
          },
        }),
        limit: z.coerce.number().min(1).max(100).default(20).openapi({
          param: {
            name: 'limit',
            in: 'query',
            description: '每页数量',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(z.object({
                id: z.string(),
                directoryId: z.string(),
                key: z.string(),
                kind: z.string(),
                type: z.string(),
                schema: z.any(),
                relation: z.any().optional(),
                lookup: z.any().optional(),
                computed: z.any().optional(),
                validators: z.any().optional(),
                readRoles: z.array(z.string()),
                writeRoles: z.array(z.string()),
                required: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              })),
              pagination: z.object({
                page: z.number(),
                limit: z.number(),
                total: z.number(),
                totalPages: z.number(),
              }),
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  getFieldDef: {
    method: 'get' as const,
    path: '/field-defs/{id}',
    tags: ['字段定义'],
    summary: '获取单个字段定义',
    description: '根据ID获取单个字段定义详情',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '字段定义ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                directoryId: z.string(),
                key: z.string(),
                kind: z.string(),
                type: z.string(),
                schema: z.any(),
                relation: z.any().optional(),
                lookup: z.any().optional(),
                computed: z.any().optional(),
                validators: z.any().optional(),
                readRoles: z.array(z.string()),
                writeRoles: z.array(z.string()),
                required: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      404: {
        description: '字段定义不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  createFieldDef: {
    method: 'post' as const,
    path: '/field-defs',
    tags: ['字段定义'],
    summary: '创建字段定义',
    description: '创建新的字段定义',
    request: {
      json: z.object({
        directoryId: z.string(),
        key: z.string(),
        kind: z.enum(['primitive', 'composite', 'relation', 'lookup', 'computed']),
        type: z.string(),
        schema: z.any().optional(),
        relation: z.any().optional(),
        lookup: z.any().optional(),
        computed: z.any().optional(),
        validators: z.any().optional(),
        readRoles: z.array(z.string()).default(['admin', 'member']),
        writeRoles: z.array(z.string()).default(['admin']),
        required: z.boolean().default(false),
      }),
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                directoryId: z.string(),
                key: z.string(),
                kind: z.string(),
                type: z.string(),
                schema: z.any(),
                relation: z.any().optional(),
                lookup: z.any().optional(),
                computed: z.any().optional(),
                validators: z.any().optional(),
                readRoles: z.array(z.string()),
                writeRoles: z.array(z.string()),
                required: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  updateFieldDef: {
    method: 'patch' as const,
    path: '/field-defs/{id}',
    tags: ['字段定义'],
    summary: '更新字段定义',
    description: '更新字段定义信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '字段定义ID',
          },
        }),
      }),
      json: z.object({
        key: z.string().optional(),
        kind: z.enum(['primitive', 'composite', 'relation', 'lookup', 'computed']).optional(),
        type: z.string().optional(),
        schema: z.any().optional(),
        relation: z.any().optional(),
        lookup: z.any().optional(),
        computed: z.any().optional(),
        validators: z.any().optional(),
        readRoles: z.array(z.string()).optional(),
        writeRoles: z.array(z.string()).optional(),
        required: z.boolean().optional(),
      }),
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                directoryId: z.string(),
                key: z.string(),
                kind: z.string(),
                type: z.string(),
                schema: z.any(),
                relation: z.any().optional(),
                lookup: z.any().optional(),
                computed: z.any().optional(),
                validators: z.any().optional(),
                readRoles: z.array(z.string()),
                writeRoles: z.array(z.string()),
                required: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      404: {
        description: '字段定义不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  deleteFieldDef: {
    method: 'delete' as const,
    path: '/field-defs/{id}',
    tags: ['字段定义'],
    summary: '删除字段定义',
    description: '删除字段定义',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '字段定义ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
      404: {
        description: '字段定义不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 目录定义相关API
  getDirectoryDefs: {
    method: 'get' as const,
    path: '/directory-defs',
    tags: ['目录定义'],
    summary: '获取目录定义列表',
    description: '获取目录定义列表，支持分页和筛选',
    request: {
      query: z.object({
        applicationId: z.string().optional().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
            description: '应用ID',
          },
        }),
        directoryId: z.string().optional().openapi({
          param: {
            name: 'directoryId',
            in: 'query',
            description: '目录ID',
          },
        }),
        status: z.string().optional().openapi({
          param: {
            name: 'status',
            in: 'query',
            description: '状态',
          },
        }),
        page: z.coerce.number().min(1).default(1).openapi({
          param: {
            name: 'page',
            in: 'query',
            description: '页码',
          },
        }),
        limit: z.coerce.number().min(1).max(100).default(20).openapi({
          param: {
            name: 'limit',
            in: 'query',
            description: '每页数量',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
                version: z.number(),
                status: z.string(),
                applicationId: z.string(),
                directoryId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              })),
              pagination: z.object({
                page: z.number(),
                limit: z.number(),
                total: z.number(),
                totalPages: z.number(),
              }),
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  getDirectoryDef: {
    method: 'get' as const,
    path: '/directory-defs/{id}',
    tags: ['目录定义'],
    summary: '获取单个目录定义',
    description: '根据ID获取单个目录定义详情',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '目录定义ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
                version: z.number(),
                status: z.string(),
                applicationId: z.string(),
                directoryId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      404: {
        description: '目录定义不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  getDirectoryDefBySlug: {
    method: 'get' as const,
    path: '/directory-defs/slug/{slug}',
    tags: ['目录定义'],
    summary: '根据slug获取目录定义',
    description: '根据slug获取目录定义详情',
    request: {
      params: z.object({
        slug: z.string().openapi({
          param: {
            name: 'slug',
            in: 'path',
            description: '目录定义slug',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
                version: z.number(),
                status: z.string(),
                applicationId: z.string(),
                directoryId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      404: {
        description: '目录定义不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  createDirectoryDef: {
    method: 'post' as const,
    path: '/directory-defs',
    tags: ['目录定义'],
    summary: '创建目录定义',
    description: '创建新的目录定义',
    request: {
      json: z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        version: z.number().min(1).optional(),
        status: z.string().optional(),
        applicationId: z.string(),
        directoryId: z.string(),
      }),
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
                version: z.number(),
                status: z.string(),
                applicationId: z.string(),
                directoryId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  updateDirectoryDef: {
    method: 'patch' as const,
    path: '/directory-defs/{id}',
    tags: ['目录定义'],
    summary: '更新目录定义',
    description: '更新目录定义信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '目录定义ID',
          },
        }),
      }),
      json: z.object({
        slug: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        version: z.number().min(1).optional(),
        status: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
                version: z.number(),
                status: z.string(),
                applicationId: z.string(),
                directoryId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      404: {
        description: '目录定义不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  deleteDirectoryDef: {
    method: 'delete' as const,
    path: '/directory-defs/{id}',
    tags: ['目录定义'],
    summary: '删除目录定义',
    description: '删除目录定义',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '目录定义ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
                version: z.number(),
                status: z.string(),
                applicationId: z.string(),
                directoryId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      404: {
        description: '目录定义不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  getOrCreateDirectoryDefByDirectoryId: {
    method: 'post' as const,
    path: '/directory-defs/by-directory/{directoryId}',
    tags: ['目录定义'],
    summary: '根据旧目录ID获取或创建目录定义',
    description: '根据旧的目录ID获取或创建目录定义，用于兼容旧系统',
    request: {
      params: z.object({
        directoryId: z.string().openapi({
          param: {
            name: 'directoryId',
            in: 'path',
            description: '旧目录ID',
          },
        }),
      }),
      json: z.object({
        applicationId: z.string(),
      }),
    },
    responses: {
      200: {
        description: '获取或创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                id: z.string(),
                slug: z.string(),
                title: z.string(),
                version: z.number(),
                status: z.string(),
                applicationId: z.string(),
                directoryId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      500: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 记录分类相关API
  getRecordCategories: {
    method: 'get' as const,
    path: '/record-categories',
    tags: ['记录分类'],
    summary: '获取记录分类列表',
    description: '获取记录分类列表，支持分页、过滤等功能',
    request: {
      query: GetRecordCategoriesQuery.openapi({
        param: {
          name: 'query',
          in: 'query',
        },
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordCategoriesListResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该应用',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  createRecordCategory: {
    method: 'post' as const,
    path: '/record-categories',
    tags: ['记录分类'],
    summary: '创建记录分类',
    description: '创建新的记录分类',
    request: {
      query: z.object({
        applicationId: z.string().openapi({
          param: {
            name: 'applicationId',
            in: 'query',
            description: '应用ID',
            required: true,
          },
        }),
        directoryId: z.string().openapi({
          param: {
            name: 'directoryId',
            in: 'query',
            description: '目录ID',
            required: true,
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: CreateRecordCategoryRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordCategoryResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该应用',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  getRecordCategory: {
    method: 'get' as const,
    path: '/record-categories/{id}',
    tags: ['记录分类'],
    summary: '获取记录分类详情',
    description: '根据ID获取记录分类详细信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '记录分类ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordCategoryResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '记录分类不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  updateRecordCategory: {
    method: 'put' as const,
    path: '/record-categories/{id}',
    tags: ['记录分类'],
    summary: '更新记录分类',
    description: '更新记录分类信息',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '记录分类ID',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateRecordCategoryRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordCategoryResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限修改该记录分类',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '记录分类不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  deleteRecordCategory: {
    method: 'delete' as const,
    path: '/record-categories/{id}',
    tags: ['记录分类'],
    summary: '删除记录分类',
    description: '删除记录分类并返回删除结果',
    request: {
      params: z.object({
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '记录分类ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: '删除失败',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限删除该记录分类',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '记录分类不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  // 记录管理相关API
  getRecords: {
    method: 'get' as const,
    path: '/records/{dirId}',
    tags: ['记录管理'],
    summary: '获取记录列表',
    description: '获取指定目录的记录列表，支持分页、排序、过滤等功能',
    request: {
      params: z.object({
        dirId: z.string().openapi({
          param: {
            name: 'dirId',
            in: 'path',
            description: '目录ID',
          },
        }),
      }),
      query: GetRecordsQuery.openapi({
        param: {
          name: 'query',
          in: 'query',
        },
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordsListResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该目录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '目录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  createRecord: {
    method: 'post' as const,
    path: '/records/{dirId}',
    tags: ['记录管理'],
    summary: '创建记录',
    description: '在指定目录中创建新记录',
    request: {
      params: z.object({
        dirId: z.string().openapi({
          param: {
            name: 'dirId',
            in: 'path',
            description: '目录ID',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              data: z.any(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限在该目录创建记录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '目录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  getRecord: {
    method: 'get' as const,
    path: '/records/{dirId}/{id}',
    tags: ['记录管理'],
    summary: '获取记录详情',
    description: '根据ID获取记录详细信息',
    request: {
      params: z.object({
        dirId: z.string().openapi({
          param: {
            name: 'dirId',
            in: 'path',
            description: '目录ID',
          },
        }),
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '记录ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordResponse,
            }),
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限访问该记录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '记录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  updateRecord: {
    method: 'put' as const,
    path: '/records/{dirId}/{id}',
    tags: ['记录管理'],
    summary: '更新记录',
    description: '更新记录信息',
    request: {
      params: z.object({
        dirId: z.string().openapi({
          param: {
            name: 'dirId',
            in: 'path',
            description: '目录ID',
          },
        }),
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '记录ID',
          },
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              data: z.any(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: RecordResponse,
            }),
          },
        },
      },
      400: {
        description: '参数错误',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限修改该记录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '记录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },

  deleteRecord: {
    method: 'delete' as const,
    path: '/records/{dirId}/{id}',
    tags: ['记录管理'],
    summary: '删除记录',
    description: '删除记录并返回删除结果',
    request: {
      params: z.object({
        dirId: z.string().openapi({
          param: {
            name: 'dirId',
            in: 'path',
            description: '目录ID',
          },
        }),
        id: z.string().openapi({
          param: {
            name: 'id',
            in: 'path',
            description: '记录ID',
          },
        }),
      }),
    },
    responses: {
      200: {
        description: '删除成功',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: '删除失败',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: '未授权',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      403: {
        description: '没有权限删除该记录',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: '记录不存在',
        content: {
          'application/json': {
            schema: ErrorResponse,
          },
        },
      },
    },
  },


}
