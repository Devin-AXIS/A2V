#!/bin/bash

# AINO 项目修复版启动脚本
# 使用正确的 Node.js 参数启动后端服务

echo "🚀 启动 AINO 项目所有服务..."

# 检查是否在正确的目录
if [ ! -d "AINO-server" ] || [ ! -d "AINO-studio" ]; then
    echo "❌ 错误：请在 AINO 项目根目录运行此脚本"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 启动后端服务（使用修复后的方法）
echo "📡 启动后端服务 (AINO-server)..."
cd AINO-server
node --import tsx src/server.ts > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# 启动前端服务
echo "🎨 启动前端服务 (AINO-studio)..."
cd AINO-studio
PORT=3000 pnpm dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

# 启动 Drizzle Studio
echo "🗄️  启动 Drizzle Studio..."
cd AINO-server
pnpm studio > ../logs/drizzle.log 2>&1 &
DRIZZLE_PID=$!
echo $DRIZZLE_PID > ../logs/drizzle.pid
cd ..

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 8

# 检查服务状态
echo ""
echo "📊 服务状态检查："

# 检查后端
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ 后端服务: http://localhost:3001"
else
    echo "❌ 后端服务启动失败"
fi

# 检查前端
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务: http://localhost:3000"
else
    echo "❌ 前端服务启动失败"
fi

# 检查 Drizzle Studio
if curl -s https://local.drizzle.studio > /dev/null 2>&1; then
    echo "✅ Drizzle Studio: https://local.drizzle.studio"
else
    echo "❌ Drizzle Studio 启动失败"
fi

echo ""
echo "🎉 所有服务启动完成！"
echo ""
echo "📝 服务地址："
echo "   • 前端应用: http://localhost:3000"
echo "   • 后端 API: http://localhost:3001"
echo "   • 数据库管理: https://local.drizzle.studio"
echo ""
echo "📋 日志文件："
echo "   • 后端日志: logs/backend.log"
echo "   • 前端日志: logs/frontend.log"
echo "   • Drizzle日志: logs/drizzle.log"
echo ""
echo "🛑 停止所有服务: ./stop-all.sh"
