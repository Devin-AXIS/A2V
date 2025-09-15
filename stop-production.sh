#!/bin/bash

# AINO 项目生产环境停止脚本
# 停止所有 PM2 服务

echo "🛑 停止 AINO 项目生产环境..."

# 停止所有 PM2 服务
pm2 stop all

echo "⏳ 等待服务停止..."
sleep 3

# 删除所有 PM2 服务
pm2 delete all

echo "✅ 所有生产环境服务已停止"
echo ""
echo "📋 PM2 状态："
pm2 status
