#!/bin/bash
# 构建 better-sqlite3 原生模块

echo "🔨 构建 better-sqlite3 原生模块..."

BETTER_SQLITE3_PATH="node_modules/.pnpm/better-sqlite3@12.4.1/node_modules/better-sqlite3"

if [ -d "$BETTER_SQLITE3_PATH" ]; then
    cd "$BETTER_SQLITE3_PATH"
    if [ -f "binding.gyp" ]; then
        echo "📦 正在使用 node-gyp 构建..."
        node-gyp rebuild
        if [ $? -eq 0 ]; then
            echo "✅ better-sqlite3 构建成功！"
        else
            echo "❌ better-sqlite3 构建失败！"
            exit 1
        fi
    else
        echo "⚠️  未找到 binding.gyp 文件"
        exit 1
    fi
else
    echo "⚠️  未找到 better-sqlite3 目录，请先运行: pnpm install"
    exit 1
fi

