#!/bin/bash

# AINO 项目一键启动脚本
# 启动后端、前端、aino-app 和 Drizzle Studio 服务

echo "🚀 启动 AINO 项目所有服务..."

# 检查是否在正确的目录
if [ ! -d "AINO-server" ] || [ ! -d "AINO-studio" ] || [ ! -d "AINO-APP" ]; then
    echo "❌ 错误：请在 AINO 项目根目录运行此脚本"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 检查并安装依赖
echo "📦 检查项目依赖..."

# 检查后端依赖
if [ ! -d "AINO-server/node_modules" ]; then
    echo "📡 安装后端依赖..."
    cd AINO-server
    pnpm install
    cd ..
fi

# 检查前端依赖 (AINO-studio)
if [ ! -d "AINO-studio/node_modules" ]; then
    echo "🎨 安装前端依赖 (AINO-studio)..."
    cd AINO-studio
    pnpm install
    cd ..
fi

# 检查 aino-app 依赖
if [ ! -d "AINO-APP/node_modules" ]; then
    echo "📱 安装 aino-app 依赖..."
    cd AINO-APP
    pnpm install
    cd ..
fi

# 启动后端服务
echo "📡 启动后端服务 (AINO-server)..."
cd AINO-server
pnpm dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# 启动前端服务 (AINO-studio)
echo "🎨 启动前端服务 (AINO-studio)..."
cd AINO-studio
PORT=3006 pnpm dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

# 启动 aino-app 服务
echo "📱 启动 aino-app 服务..."
cd AINO-APP
pnpm dev > ../logs/aino-app.log 2>&1 &
AINO_APP_PID=$!
echo $AINO_APP_PID > ../logs/aino-app.pid
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
sleep 5

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
echo "🎉 所有服务启动完成！"
echo ""
echo "📝 服务地址："
echo "   • 前端应用 (AINO-studio): http://47.94.52.142::3006"
echo "   • aino-app 应用: http://47.94.52.142::3005"
echo "   • 后端 API: http://47.94.52.142::3007"
echo "   • 数据库管理: https://local.drizzle.studio"
echo ""
echo "📋 日志文件："
echo "   • 后端日志: logs/backend.log"
echo "   • 前端日志: logs/frontend.log"
echo "   • aino-app日志: logs/aino-app.log"
echo "   • Drizzle日志: logs/drizzle.log"
echo ""
echo "🛑 停止所有服务: ./stop-all.sh"
