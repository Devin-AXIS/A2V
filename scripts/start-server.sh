#!/bin/bash

# Next.js 服务器启动脚本
# 用于在 PM2 中启动 Next.js 应用

cd "$(dirname "$0")/.."

# 设置环境变量
export NODE_ENV=production
export PORT=80

# 启动 Next.js 服务器
exec pnpm start

