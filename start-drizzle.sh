#!/bin/bash

# AINO 项目一键启动脚本
# 启动后端、前端和 Drizzle Studio 服务

echo "🚀 启动 AINO 项目所有服务..."

# 检查是否在正确的目录
if [ ! -d "AINO-server" ] || [ ! -d "AINO-studio" ]; then
    echo "❌ 错误：请在 AINO 项目根目录运行此脚本"
    exit 1
fi

# 创建日志目录
mkdir -p logs


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

# 检查 Drizzle Studio
if curl -s https://local.drizzle.studio > /dev/null 2>&1; then
    echo "✅ Drizzle Studio: https://local.drizzle.studio"
else
    echo "❌ Drizzle Studio 启动失败"
fi