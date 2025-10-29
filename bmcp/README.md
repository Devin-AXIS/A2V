BMCP Monorepo

apps/web: Next.js 15 市场前端（占位）
apps/api: Hono BFF（占位）
services/registrar: Registrar/Proxy 网关（注册/代理/计量/402 占位）
services/compiler: API-Compiler（OpenAPI→MCP 占位）
packages/schema: Drizzle + Zod 类型和表结构

本地开发

1. 配置环境变量
- packages/schema: DATABASE_URL
- services/registrar: PORT, DATABASE_URL, GATEWAY_BASE, SIGNATURE_SECRET

2. 运行
# 根目录
npm install
npm run build
# 各服务开发
npm --workspace @bmcp/registrar run dev
npm --workspace @bmcp/compiler run dev
npm --workspace @bmcp/web run dev

3. 环境变量
- apps/web: NEXT_PUBLIC_BMCP_REGISTRAR, NEXT_PUBLIC_BMCP_COMPILER
- services/registrar: PORT, DATABASE_URL, GATEWAY_BASE, SIGNATURE_SECRET

API 概要
- POST /api/register
- GET  /api/resolve/:id
- ALL  /proxy/:id/*
- GET  /api/invoices
- POST /api/invoices/:id/pay
- PUT  /api/publisher/:id/pricing|splits|wallet


