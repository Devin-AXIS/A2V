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

// API 路由定义
export const apiRoutes = {
  // 健康检查
  health: {
    method: 'get',
    path: '/health',
    tags: ['健康检查'],
    summary: '健康检查',
    description: '检查服务是否正常运行',
    responses: {
      200: {
        description: '服务正常',
        content: {
          'text/plain': {
            schema: z.string(),
          },
        },
      },
    },
  },

  // 用户登录
  login: {
    method: 'post',
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
    method: 'get',
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
    method: 'post',
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
    method: 'get',
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
    method: 'put',
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
    method: 'delete',
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
    method: 'get',
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
    method: 'get',
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
    method: 'post',
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
    method: 'get',
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
    method: 'put',
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
    method: 'delete',
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
    method: 'get',
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
}
