#!/bin/bash

# AINO-app 项目快速设置脚本
# 用于解决开发者从Git下载后内容不显示的问题

echo "🚀 AINO-app 项目设置开始..."

# 检查 Node.js 版本
echo "📋 检查环境..."
node_version=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 18.0 或更高版本"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $node_version"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  未找到 pnpm，正在安装..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "❌ pnpm 安装失败，将使用 npm"
        USE_NPM=true
    else
        echo "✅ pnpm 安装成功"
        USE_NPM=false
    fi
else
    echo "✅ pnpm 已安装"
    USE_NPM=false
fi

# 清理可能的缓存问题
echo "🧹 清理缓存..."
rm -rf node_modules
rm -rf .next
rm -rf pnpm-lock.yaml
rm -rf package-lock.json

# 安装依赖
echo "📦 安装依赖..."
if [ "$USE_NPM" = true ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm 安装失败"
        exit 1
    fi
else
    pnpm install
    if [ $? -ne 0 ]; then
        echo "❌ pnpm 安装失败，尝试使用 npm..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ 依赖安装失败"
            exit 1
        fi
    fi
fi

echo "✅ 依赖安装完成"

# 检查端口占用
echo "🔍 检查端口 3002..."
if lsof -ti:3002 > /dev/null 2>&1; then
    echo "⚠️  端口 3002 被占用，正在释放..."
    lsof -ti:3002 | xargs kill -9
    sleep 2
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo "   访问地址: http://localhost:3002"
echo "   按 Ctrl+C 停止服务器"
echo ""

if [ "$USE_NPM" = true ]; then
    npm run dev
else
    pnpm dev
fi
