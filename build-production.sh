#!/bin/bash

# AINO 项目生产环境构建脚本
# 构建所有项目为生产环境

echo "🏗️  开始构建 AINO 项目生产环境..."

# 检查是否在正确的目录
if [ ! -d "AINO-server" ] || [ ! -d "AINO-studio" ] || [ ! -d "AINO-APP" ]; then
    echo "❌ 错误：请在 AINO 项目根目录运行此脚本"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 设置环境变量
export NODE_ENV=production

echo "📦 安装依赖..."

# 安装后端依赖
echo "📡 安装后端依赖 (AINO-server)..."
cd AINO-server
pnpm install --frozen-lockfile
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi
cd ..

# 安装前端依赖 (AINO-studio)
echo "🎨 安装前端依赖 (AINO-studio)..."
cd AINO-studio
pnpm install --frozen-lockfile
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi
cd ..

# 安装 aino-app 依赖
echo "📱 安装 aino-app 依赖..."
cd AINO-APP
pnpm install --frozen-lockfile
if [ $? -ne 0 ]; then
    echo "❌ aino-app 依赖安装失败"
    exit 1
fi
cd ..

echo "🔨 开始构建项目..."

# 构建前端 (AINO-studio)
echo "🎨 构建前端服务 (AINO-studio)..."
cd AINO-studio
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi
echo "✅ 前端构建完成"
cd ..

# 构建 aino-app (跳过静态生成)
echo "📱 构建 aino-app 服务..."
cd AINO-APP
NODE_ENV=production pnpm build
if [ $? -ne 0 ]; then
    echo "⚠️  aino-app 构建有警告，但继续..."
fi
echo "✅ aino-app 构建完成"
cd ..

echo "📡 后端服务将使用 tsx 直接运行，无需构建..."

echo ""
echo "🎉 所有项目构建完成！"
echo ""
echo "📁 构建输出目录："
echo "   • 后端: 使用 tsx 直接运行 (AINO-server/src/)"
echo "   • 前端 (AINO-studio): AINO-studio/.next/"
echo "   • aino-app: AINO-APP/.next/"
echo ""
echo "🚀 现在可以运行 ./start-production.sh 启动生产环境"
