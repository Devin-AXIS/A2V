#!/bin/bash

# AINO 项目生产环境启动脚本
# 使用 PM2 守护进程启动所有服务

echo "🚀 启动 AINO 项目生产环境..."

# 检查是否在正确的目录
if [ ! -d "AINO-server" ] || [ ! -d "AINO-studio" ] || [ ! -d "AINO-APP" ]; then
    echo "❌ 错误：请在 AINO 项目根目录运行此脚本"
    exit 1
fi

# 检查是否已经构建
if [ ! -d "AINO-studio/.next" ] || [ ! -d "AINO-APP/.next" ]; then
    echo "❌ 错误：请先运行 ./build-production.sh 构建项目"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 设置环境变量
export NODE_ENV=production

echo "🛑 停止现有服务..."
pm2 delete all 2>/dev/null || true

echo "📦 启动生产环境服务..."

# 使用 PM2 启动所有服务
pm2 start ecosystem.config.js

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 服务状态检查："

# 检查后端
if curl -s http://47.94.52.142::3007/health > /dev/null 2>&1; then
    echo "✅ 后端服务: http://47.94.52.142::3007"
else
    echo "❌ 后端服务启动失败"
fi

# 检查前端 (AINO-studio)
if curl -s http://47.94.52.142::3006 > /dev/null 2>&1; then
    echo "✅ 前端服务 (AINO-studio): http://47.94.52.142::3006"
else
    echo "❌ 前端服务 (AINO-studio) 启动失败"
fi

# 检查 aino-app
if curl -s http://47.94.52.142::3005 > /dev/null 2>&1; then
    echo "✅ aino-app 服务: http://47.94.52.142::3005"
else
    echo "❌ aino-app 服务启动失败"
fi

# 检查 Drizzle Studio
if curl -s https://local.drizzle.studio > /dev/null 2>&1; then
    echo "✅ Drizzle Studio: https://local.drizzle.studio"
else
    echo "❌ Drizzle Studio 启动失败"
fi

echo ""
echo "🎉 生产环境启动完成！"
echo ""
echo "📝 服务地址："
echo "   • 前端应用 (AINO-studio): http://47.94.52.142::3006"
echo "   • aino-app 应用: http://47.94.52.142::3005"
echo "   • 后端 API: http://47.94.52.142::3007"
echo "   • 数据库管理: https://local.drizzle.studio"
echo ""
echo "📋 PM2 管理命令："
echo "   • 查看状态: pm2 status"
echo "   • 查看日志: pm2 logs"
echo "   • 重启服务: pm2 restart all"
echo "   • 停止服务: pm2 stop all"
echo "   • 删除服务: pm2 delete all"
echo ""
echo "📋 日志文件："
echo "   • 后端日志: logs/backend.log"
echo "   • 前端日志: logs/frontend.log"
echo "   • aino-app日志: logs/aino-app.log"
echo "   • Drizzle日志: logs/drizzle.log"
echo ""
echo "🛑 停止所有服务: ./stop-production.sh"
