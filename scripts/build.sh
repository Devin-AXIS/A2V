#!/bin/bash

# 一键打包脚本
# 用于构建Next.js生产版本

set -e  # 遇到错误立即退出

echo "🚀 开始打包项目..."

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# 检查是否安装了 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: 未找到 pnpm，请先安装 pnpm"
    echo "安装命令: npm install -g pnpm"
    exit 1
fi

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf .next
rm -rf out
rm -rf dist

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    pnpm install
else
    echo "✅ 依赖已存在，跳过安装"
fi

# 构建项目
echo "🔨 开始构建项目..."
pnpm next build

# 检查构建是否成功
if [ $? -eq 0 ] && [ -d ".next" ]; then
    echo "✅ 构建完成！构建文件位于 .next 目录"
    echo "📊 构建信息："
    du -sh .next
    echo ""
    echo "🎉 打包完成！"
    echo "💡 提示: 使用 ./scripts/start-pm2.sh 启动应用"
else
    echo "❌ 构建失败！请检查错误信息"
    exit 1
fi
