import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const apiEndpoints = [
    {
        method: 'GET',
        path: '/health',
        tags: ['健康检查'],
        summary: '健康检查',
        description: '检查服务是否正常运行',
        responses: {
            200: '服务正常',
        },
    },
    {
        method: 'GET',
        path: '/api/modules/system',
        tags: ['系统模块'],
        summary: '获取系统模块列表',
        description: '获取所有可用的系统模块',
        responses: {
            200: '获取成功',
            401: '未授权',
        },
    },
    {
        method: 'GET',
        path: '/api/modules/system/user',
        tags: ['应用用户'],
        summary: '获取应用用户列表',
        description: '获取指定应用的用户列表',
        queryParams: {
            applicationId: 'string (必需) - 应用ID',
            page: 'number (可选) - 页码，默认1',
            limit: 'number (可选) - 每页数量，默认20',
            search: 'string (可选) - 搜索关键词',
            status: 'string (可选) - 用户状态',
            role: 'string (可选) - 用户角色',
            department: 'string (可选) - 部门',
            sortBy: 'string (可选) - 排序字段',
            sortOrder: 'string (可选) - 排序方向',
        },
        responses: {
            200: '获取成功',
            400: '参数错误',
            401: '未授权',
        },
    },
    {
        method: 'POST',
        path: '/api/modules/system/user',
        tags: ['应用用户'],
        summary: '创建应用用户',
        description: '在指定应用中创建新用户',
        queryParams: {
            applicationId: 'string (必需) - 应用ID',
        },
        requestBody: {
            name: 'string (必需) - 用户姓名',
            email: 'string (必需) - 邮箱地址',
            phone: 'string (可选) - 手机号',
            avatar: 'string (可选) - 头像URL',
            role: 'string (可选) - 用户角色',
            department: 'string (可选) - 部门',
            position: 'string (可选) - 职位',
            tags: 'array (可选) - 标签',
            metadata: 'object (可选) - 扩展数据',
        },
        responses: {
            201: '创建成功',
            400: '参数错误',
            401: '未授权',
        },
    },
    {
        method: 'GET',
        path: '/api/modules/system/user/{id}',
        tags: ['应用用户'],
        summary: '获取应用用户详情',
        description: '根据用户ID获取用户详情',
        pathParams: {
            id: 'string (必需) - 用户ID',
        },
        queryParams: {
            applicationId: 'string (必需) - 应用ID',
        },
        responses: {
            200: '获取成功',
            404: '用户不存在',
            401: '未授权',
        },
    },
    {
        method: 'PUT',
        path: '/api/modules/system/user/{id}',
        tags: ['应用用户'],
        summary: '更新应用用户',
        description: '更新指定用户的信息',
        pathParams: {
            id: 'string (必需) - 用户ID',
        },
        queryParams: {
            applicationId: 'string (必需) - 应用ID',
        },
        requestBody: {
            name: 'string (可选) - 用户姓名',
            email: 'string (可选) - 邮箱地址',
            phone: 'string (可选) - 手机号',
            avatar: 'string (可选) - 头像URL',
            status: 'string (可选) - 用户状态',
            role: 'string (可选) - 用户角色',
            department: 'string (可选) - 部门',
            position: 'string (可选) - 职位',
            tags: 'array (可选) - 标签',
            metadata: 'object (可选) - 扩展数据',
        },
        responses: {
            200: '更新成功',
            400: '参数错误',
            401: '未授权',
            404: '用户不存在',
        },
    },
    {
        method: 'DELETE',
        path: '/api/modules/system/user/{id}',
        tags: ['应用用户'],
        summary: '删除应用用户',
        description: '删除指定的应用用户',
        pathParams: {
            id: 'string (必需) - 用户ID',
        },
        queryParams: {
            applicationId: 'string (必需) - 应用ID',
        },
        responses: {
            200: '删除成功',
            400: '删除失败',
            401: '未授权',
            404: '用户不存在',
        },
    },
    {
        method: 'POST',
        path: '/users/login',
        tags: ['认证'],
        summary: '用户登录',
        description: '用户登录接口，支持邮箱、用户名或账号登录',
        requestBody: {
            email: 'string (可选)',
            username: 'string (可选)',
            account: 'string (可选)',
            password: 'string (必需)',
        },
        responses: {
            200: '登录成功',
            400: '参数错误',
        },
    },
    {
        method: 'GET',
        path: '/applications',
        tags: ['应用'],
        summary: '获取应用列表',
        description: '获取当前用户的应用列表',
        queryParams: {
            page: 'string (可选) - 页码',
            limit: 'string (可选) - 每页数量',
            search: 'string (可选) - 搜索关键词',
            status: 'string (可选) - 应用状态',
        },
        responses: {
            200: '获取成功',
            401: '未授权',
        },
    },
    {
        method: 'POST',
        path: '/applications',
        tags: ['应用'],
        summary: '创建应用',
        description: '创建新的应用',
        requestBody: {
            name: 'string (必需) - 应用名称',
            description: 'string (可选) - 应用描述',
            slug: 'string (必需) - 应用标识符',
            template: 'string (可选) - 应用模板',
            config: 'object (可选) - 应用配置',
            isPublic: 'boolean (可选) - 是否公开',
        },
        responses: {
            201: '创建成功',
            400: '参数错误',
            401: '未授权',
        },
    },
    {
        method: 'GET',
        path: '/applications/{id}',
        tags: ['应用'],
        summary: '获取应用详情',
        description: '根据应用ID获取应用详情',
        pathParams: {
            id: 'string (必需) - 应用ID',
        },
        responses: {
            200: '获取成功',
            404: '应用不存在',
            401: '未授权',
        },
    },
    {
        method: 'PUT',
        path: '/applications/{id}',
        tags: ['应用'],
        summary: '更新应用',
        description: '更新应用信息',
        pathParams: {
            id: 'string (必需) - 应用ID',
        },
        requestBody: {
            name: 'string (可选) - 应用名称',
            description: 'string (可选) - 应用描述',
            config: 'object (可选) - 应用配置',
            isPublic: 'boolean (可选) - 是否公开',
        },
        responses: {
            200: '更新成功',
            400: '参数错误',
            401: '未授权',
            404: '应用不存在',
        },
    },
    {
        method: 'DELETE',
        path: '/applications/{id}',
        tags: ['应用'],
        summary: '删除应用',
        description: '删除指定应用',
        pathParams: {
            id: 'string (必需) - 应用ID',
        },
        responses: {
            200: '删除成功',
            400: '删除失败',
            401: '未授权',
            404: '应用不存在',
        },
    },
    {
        method: 'GET',
        path: '/api/applications/{id}/modules',
        tags: ['应用模块'],
        summary: '获取应用模块列表',
        description: '获取指定应用的所有模块列表，包括系统模块和自定义模块',
        pathParams: {
            id: 'string (必需) - 应用ID',
        },
        responses: {
            200: '获取成功',
            401: '未授权',
            404: '应用不存在',
        },
        responseExample: {
            success: true,
            data: {
                application: {
                    id: 'uuid',
                    name: '应用名称',
                    description: '应用描述',
                    slug: 'app-slug',
                    ownerId: 'uuid',
                    status: 'active',
                    template: 'blank',
                    config: {},
                    databaseConfig: null,
                    isPublic: false,
                    version: '1.0.0',
                    createdAt: '2025-01-01T00:00:00.000Z',
                    updatedAt: '2025-01-01T00:00:00.000Z'
                },
                modules: [
                    {
                        id: 'uuid',
                        applicationId: 'uuid',
                        name: '用户管理',
                        type: 'system',
                        icon: 'users',
                        config: {
                            defaultRole: 'user',
                            passwordPolicy: {
                                minLength: 6,
                                requireNumbers: false,
                                requireLowercase: false,
                                requireUppercase: false,
                                requireSpecialChars: false
                            },
                            allowRegistration: true,
                            requireEmailVerification: false
                        },
                        order: 0,
                        isEnabled: true,
                        createdAt: '2025-01-01T00:00:00.000Z',
                        updatedAt: '2025-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
    },
    {
        method: 'GET',
        path: '/api/modules/{moduleKey}',
        tags: ['应用模块'],
        summary: '获取系统模块信息',
        description: '获取指定系统模块的配置信息',
        pathParams: {
            moduleKey: 'string (必需) - 模块标识符 (user/config/audit)',
        },
        responses: {
            200: '获取成功',
            400: '模块不存在',
            401: '未授权',
        },
        responseExample: {
            success: true,
            data: {
                key: 'user',
                name: '用户管理',
                description: '应用内用户管理模块',
                type: 'system',
                icon: 'users',
                config: {
                    defaultRole: 'user',
                    passwordPolicy: {
                        minLength: 6,
                        requireNumbers: false,
                        requireLowercase: false,
                        requireUppercase: false,
                        requireSpecialChars: false
                    },
                    allowRegistration: true,
                    requireEmailVerification: false
                }
            }
        }
    },
];
function generateMarkdownDocs() {
    let markdown = `# AINO API 文档

## 概述

AINO 应用管理平台 API 文档

**基础URL:** http://localhost:3001

## 认证

大部分接口需要认证，请在请求头中包含认证信息：

\`\`\`
Authorization: Bearer <token>
\`\`\`

## 接口列表

`;
    const tags = [...new Set(apiEndpoints.flatMap(ep => ep.tags))];
    tags.forEach(tag => {
        markdown += `### ${tag}\n\n`;
        const endpoints = apiEndpoints.filter(ep => ep.tags.includes(tag));
        endpoints.forEach(endpoint => {
            markdown += `#### ${endpoint.summary}\n\n`;
            markdown += `**路径:** \`${endpoint.method} ${endpoint.path}\`\n\n`;
            markdown += `**描述:** ${endpoint.description}\n\n`;
            if (endpoint.pathParams) {
                markdown += `**路径参数:**\n`;
                Object.entries(endpoint.pathParams).forEach(([key, desc]) => {
                    markdown += `- \`${key}\`: ${desc}\n`;
                });
                markdown += '\n';
            }
            if (endpoint.queryParams) {
                markdown += `**查询参数:**\n`;
                Object.entries(endpoint.queryParams).forEach(([key, desc]) => {
                    markdown += `- \`${key}\`: ${desc}\n`;
                });
                markdown += '\n';
            }
            if (endpoint.requestBody) {
                markdown += `**请求体:**\n\`\`\`json\n${JSON.stringify(endpoint.requestBody, null, 2)}\n\`\`\`\n\n`;
            }
            markdown += `**响应:**\n`;
            Object.entries(endpoint.responses).forEach(([code, desc]) => {
                markdown += `- ${code}: ${desc}\n`;
            });
            markdown += '\n';
            if (endpoint.responseExample) {
                markdown += `**响应示例:**\n\`\`\`json\n${JSON.stringify(endpoint.responseExample, null, 2)}\n\`\`\`\n\n`;
            }
            markdown += '---\n\n';
        });
    });
    return markdown;
}
function generateHtmlDocs() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AINO API 文档</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007acc;
            padding-bottom: 10px;
        }
        h2 {
            color: #555;
            margin-top: 30px;
        }
        h3 {
            color: #666;
            background: #f8f9fa;
            padding: 10px;
            border-left: 4px solid #007acc;
        }
        .endpoint {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
        }
        .GET { background: #28a745; color: white; }
        .POST { background: #007bff; color: white; }
        .PUT { background: #ffc107; color: black; }
        .DELETE { background: #dc3545; color: white; }
        .path {
            font-family: monospace;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
        }
        pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
        }
        code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .tag {
            display: inline-block;
            background: #007acc;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AINO API 文档</h1>
        <p><strong>基础URL:</strong> http://localhost:3001</p>
        
        <h2>认证</h2>
        <p>大部分接口需要认证，请在请求头中包含认证信息：</p>
        <pre><code>Authorization: Bearer &lt;token&gt;</code></pre>
        
        <h2>接口列表</h2>
        ${generateHtmlEndpoints()}
    </div>
</body>
</html>`;
}
function generateHtmlEndpoints() {
    const tags = [...new Set(apiEndpoints.flatMap(ep => ep.tags))];
    let html = '';
    tags.forEach(tag => {
        html += `<h3>${tag}</h3>`;
        const endpoints = apiEndpoints.filter(ep => ep.tags.includes(tag));
        endpoints.forEach(endpoint => {
            html += `<div class="endpoint">
        <h4>${endpoint.summary}</h4>
        <p><span class="method ${endpoint.method}">${endpoint.method}</span> <span class="path">${endpoint.path}</span></p>
        <p><strong>描述:</strong> ${endpoint.description}</p>
        <p><strong>标签:</strong> ${endpoint.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</p>
        
        ${endpoint.pathParams ? `
        <p><strong>路径参数:</strong></p>
        <ul>
          ${Object.entries(endpoint.pathParams).map(([key, desc]) => `<li><code>${key}</code>: ${desc}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${endpoint.queryParams ? `
        <p><strong>查询参数:</strong></p>
        <ul>
          ${Object.entries(endpoint.queryParams).map(([key, desc]) => `<li><code>${key}</code>: ${desc}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${endpoint.requestBody ? `
        <p><strong>请求体:</strong></p>
        <pre><code>${JSON.stringify(endpoint.requestBody, null, 2)}</code></pre>
        ` : ''}
        
        <p><strong>响应:</strong></p>
        <ul>
          ${Object.entries(endpoint.responses).map(([code, desc]) => `<li><code>${code}</code>: ${desc}</li>`).join('')}
        </ul>
        
        ${endpoint.responseExample ? `
        <p><strong>响应示例:</strong></p>
        <pre><code>${JSON.stringify(endpoint.responseExample, null, 2)}</code></pre>
        ` : ''}
      </div>`;
        });
    });
    return html;
}
function main() {
    console.log('🚀 开始生成 API 文档...');
    const outputDir = join(__dirname, '../../docs');
    mkdirSync(outputDir, { recursive: true });
    const markdownPath = join(outputDir, 'api-docs.md');
    const markdown = generateMarkdownDocs();
    writeFileSync(markdownPath, markdown, 'utf-8');
    console.log(`✅ Markdown 文档已生成: ${markdownPath}`);
    const htmlPath = join(outputDir, 'api-docs.html');
    const html = generateHtmlDocs();
    writeFileSync(htmlPath, html, 'utf-8');
    console.log(`✅ HTML 文档已生成: ${htmlPath}`);
    console.log('🎉 API 文档生成完成！');
}
if (require.main === module) {
    main();
}
export { main as generateDocs };
//# sourceMappingURL=simple-docs.js.map