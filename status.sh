#!/bin/bash

# AINO 项目服务状态检查脚本

echo "📊 AINO 项目服务状态检查"
echo "=========================="

# 检查后端服务
echo ""
echo "📡 后端服务 (AINO-server):"
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "   ✅ 进程运行中 (PID: $BACKEND_PID)"
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo "   ✅ 服务响应正常: http://localhost:3001"
        else
            echo "   ⚠️  进程运行但服务无响应"
        fi
    else
        echo "   ❌ 进程已停止"
        rm logs/backend.pid
    fi
else
    echo "   ❌ 未运行"
fi

# 检查前端服务 (AINO-studio)
echo ""
echo "🎨 前端服务 (AINO-studio):"
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "   ✅ 进程运行中 (PID: $FRONTEND_PID)"
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "   ✅ 服务响应正常: http://localhost:3000"
        else
            echo "   ⚠️  进程运行但服务无响应"
        fi
    else
        echo "   ❌ 进程已停止"
        rm logs/frontend.pid
    fi
else
    echo "   ❌ 未运行"
fi

# 检查 aino-app 服务
echo ""
echo "📱 aino-app 服务:"
if [ -f "logs/aino-app.pid" ]; then
    AINO_APP_PID=$(cat logs/aino-app.pid)
    if kill -0 $AINO_APP_PID 2>/dev/null; then
        echo "   ✅ 进程运行中 (PID: $AINO_APP_PID)"
        if curl -s http://localhost:3002 > /dev/null 2>&1; then
            echo "   ✅ 服务响应正常: http://localhost:3002"
        else
            echo "   ⚠️  进程运行但服务无响应"
        fi
    else
        echo "   ❌ 进程已停止"
        rm logs/aino-app.pid
    fi
else
    echo "   ❌ 未运行"
fi

# 检查 Drizzle Studio
echo ""
echo "🗄️  Drizzle Studio:"
if [ -f "logs/drizzle.pid" ]; then
    DRIZZLE_PID=$(cat logs/drizzle.pid)
    if kill -0 $DRIZZLE_PID 2>/dev/null; then
        echo "   ✅ 进程运行中 (PID: $DRIZZLE_PID)"
        if curl -s https://local.drizzle.studio > /dev/null 2>&1; then
            echo "   ✅ 服务响应正常: https://local.drizzle.studio"
        else
            echo "   ⚠️  进程运行但服务无响应"
        fi
    else
        echo "   ❌ 进程已停止"
        rm logs/drizzle.pid
    fi
else
    echo "   ❌ 未运行"
fi

echo ""
echo "📋 可用命令："
echo "   • 启动所有服务: ./start-all.sh"
echo "   • 停止所有服务: ./stop-all.sh"
echo "   • 查看状态: ./status.sh"
echo "Frontends: http://localhost:3006 (studio), http://47.94.52.142:3008 (app)"
echo "Backend:   http://localhost:3007"