#!/bin/bash

# AINO 项目停止所有服务脚本

echo "🛑 停止 AINO 项目所有服务..."

# 停止后端服务
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "📡 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm logs/backend.pid
    else
        echo "📡 后端服务已停止"
        rm logs/backend.pid
    fi
else
    echo "📡 后端服务未运行"
fi

# 停止前端服务
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm logs/frontend.pid
    else
        echo "🎨 前端服务已停止"
        rm logs/frontend.pid
    fi
else
    echo "🎨 前端服务未运行"
fi

# 停止 Drizzle Studio
if [ -f "logs/drizzle.pid" ]; then
    DRIZZLE_PID=$(cat logs/drizzle.pid)
    if kill -0 $DRIZZLE_PID 2>/dev/null; then
        echo "🗄️  停止 Drizzle Studio (PID: $DRIZZLE_PID)..."
        kill $DRIZZLE_PID
        rm logs/drizzle.pid
    else
        echo "🗄️  Drizzle Studio 已停止"
        rm logs/drizzle.pid
    fi
else
    echo "🗄️  Drizzle Studio 未运行"
fi

# 清理可能残留的进程
echo "🧹 清理残留进程..."
pkill -f "tsx.*server.ts" 2>/dev/null
pkill -f "next.*dev" 2>/dev/null
pkill -f "drizzle-kit.*studio" 2>/dev/null

echo "✅ 所有服务已停止"
