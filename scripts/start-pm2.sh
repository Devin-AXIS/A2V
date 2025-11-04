#!/bin/bash

# PM2启动脚本
# 用于使用PM2启动打包后的Next.js应用

set -e  # 遇到错误立即退出

echo "🚀 使用PM2启动应用..."

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# 检查是否已构建
if [ ! -d ".next" ]; then
    echo "❌ 未找到构建文件，请先运行打包脚本: ./scripts/build.sh"
    echo "💡 正在自动执行打包..."
    ./scripts/build.sh
    if [ $? -ne 0 ]; then
        echo "❌ 打包失败，无法启动应用"
        exit 1
    fi
fi

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2未安装，正在安装..."
    if command -v pnpm &> /dev/null; then
        pnpm add -g pm2
    elif command -v npm &> /dev/null; then
        npm install -g pm2
    else
        echo "❌ 错误: 未找到 pnpm 或 npm，无法安装 PM2"
        exit 1
    fi
fi

# 应用名称
APP_NAME="aino-nextjs"

# 创建日志目录
mkdir -p logs

# 清理旧进程（如果存在）
if pm2 list | grep -q "$APP_NAME"; then
    echo "🧹 清理旧进程..."
    pm2 delete "$APP_NAME" 2>/dev/null || true
fi

# 启动新应用实例
echo "🔄 启动应用..."
# 检查是否存在 ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
    echo "📄 使用 ecosystem.config.js 配置文件..."
    pm2 start ecosystem.config.js
    else
        echo "⚠️  未找到 ecosystem.config.js，使用默认配置启动..."
        pm2 start "./scripts/start-server.sh" --name "$APP_NAME" \
            --interpreter bash \
            --cwd "$PROJECT_DIR" \
            --env NODE_ENV=production \
            --env PORT=4001 \
            --error ./logs/pm2-error.log \
            --output ./logs/pm2-out.log \
            --log ./logs/pm2-combined.log \
            --max-memory-restart 1G \
            --kill-timeout 5000
    fi

# 保存PM2配置
pm2 save

echo ""
echo "✅ 应用已启动！"
echo ""
echo "📋 常用命令："
echo "   📊 查看状态: pm2 status"
echo "   📝 查看日志: pm2 logs $APP_NAME"
echo "   📈 实时日志: pm2 logs $APP_NAME --lines 50"
echo "   🛑 停止应用: pm2 stop $APP_NAME"
echo "   🔄 重启应用: pm2 restart $APP_NAME"
echo "   🗑️  删除应用: pm2 delete $APP_NAME"
echo "   📊 监控面板: pm2 monit"
echo ""
