#!/bin/bash

# AINO 项目一键生产环境部署脚本
# 包含构建和启动

echo "🚀 AINO 项目一键生产环境部署..."

# 检查是否在正确的目录
if [ ! -d "AINO-server" ] || [ ! -d "AINO-studio" ] || [ ! -d "AINO-APP" ]; then
    echo "❌ 错误：请在 AINO 项目根目录运行此脚本"
    exit 1
fi

# 停止现有服务
echo "🛑 停止现有服务..."
pm2 delete all 2>/dev/null || true

# 构建项目
echo "🏗️  构建项目..."
./build-production.sh
if [ $? -ne 0 ]; then
    echo "❌ 构建失败，部署终止"
    exit 1
fi

# 启动生产环境
echo "🚀 启动生产环境..."
./start-production.sh
if [ $? -ne 0 ]; then
    echo "❌ 启动失败"
    exit 1
fi

echo ""
echo "🎉 生产环境部署完成！"
echo ""
echo "📋 快速管理命令："
echo "   • 查看状态: pm2 status"
echo "   • 查看日志: pm2 logs"
echo "   • 重启服务: pm2 restart all"
echo "   • 停止服务: ./stop-production.sh"
