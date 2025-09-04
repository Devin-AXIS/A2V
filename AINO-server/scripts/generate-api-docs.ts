#!/usr/bin/env tsx

/**
 * 手动生成API文档脚本
 * 使用方法: pnpm run generate-docs
 */

import fs from 'fs'
import path from 'path'

// 生成简单的API文档
function generateApiDocs() {
  const docs = {
    title: "AINO API 文档",
    version: "1.0.0",
    description: "AINO 平台 API 接口文档",
    baseUrl: "http://localhost:3001",
    endpoints: {
      health: {
        method: "GET",
        path: "/health",
        description: "健康检查",
        response: "ok"
      },
      users: {
        method: "GET",
        path: "/api/users",
        description: "获取用户列表",
        auth: true
      },
      applications: {
        method: "GET",
        path: "/api/applications",
        description: "获取应用列表",
        auth: true
      },
      "create-application": {
        method: "POST",
        path: "/api/applications",
        description: "创建应用",
        auth: true
      },
      directories: {
        method: "GET",
        path: "/api/directories",
        description: "获取目录列表",
        auth: true,
        query: {
          applicationId: "string (可选)",
          moduleId: "string (可选)",
          type: "table|category|form (可选)",
          limit: "number (默认20)",
          offset: "number (默认0)"
        }
      },
      "create-directory": {
        method: "POST",
        path: "/api/directories",
        description: "创建目录",
        auth: true,
        query: {
          applicationId: "string (必需)",
          moduleId: "string (必需)"
        },
        body: {
          name: "string (必需)",
          type: "table|category|form (必需)",
          supportsCategory: "boolean (可选)",
          config: "object (可选)",
          order: "number (可选)"
        }
      }
    }
  }

  const docsDir = path.join(__dirname, '../docs')
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  const docsPath = path.join(docsDir, 'api-docs.json')
  fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2))
  
  console.log('✅ API文档已生成:', docsPath)
  console.log('📚 Swagger UI 地址: http://localhost:3001/docs/swagger')
}

// 主函数
function main() {
  console.log('📚 开始生成API文档...')
  
  try {
    generateApiDocs()
    console.log('🎉 API文档生成完成！')
  } catch (error) {
    console.error('❌ 生成API文档失败:', error)
    process.exit(1)
  }
}

main()
