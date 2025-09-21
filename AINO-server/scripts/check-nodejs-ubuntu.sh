#!/bin/bash

# Ubuntu 系统 Node.js 检查脚本
# 专门处理 Ubuntu 系统中的 Node.js 检测问题

echo "🔍 Ubuntu 系统 Node.js 检查脚本"
echo "=================================="

# 检查系统信息
echo "📊 系统信息:"
echo "   操作系统: $(lsb_release -d 2>/dev/null | cut -f2 || echo "Unknown")"
echo "   架构: $(uname -m)"
echo ""

# 检查 Node.js 的多个可能位置
echo "🔍 检查 Node.js 安装位置..."

NODE_PATHS=(
    "/usr/bin/node"
    "/usr/local/bin/node"
    "/opt/nodejs/bin/node"
    "/snap/bin/node"
    "$HOME/.nvm/versions/node/*/bin/node"
    "$HOME/.local/bin/node"
)

NODE_FOUND=false
NODE_PATH=""
NODE_VERSION=""

for path in "${NODE_PATHS[@]}"; do
    if [[ "$path" == *"*"* ]]; then
        # 处理通配符路径
        for expanded_path in $path; do
            if [ -f "$expanded_path" ]; then
                NODE_FOUND=true
                NODE_PATH="$expanded_path"
                NODE_VERSION=$($expanded_path --version 2>/dev/null || echo "unknown")
                break 2
            fi
        done
    else
        if [ -f "$path" ]; then
            NODE_FOUND=true
            NODE_PATH="$path"
            NODE_VERSION=$($path --version 2>/dev/null || echo "unknown")
            break
        fi
    fi
done

if [ "$NODE_FOUND" = true ]; then
    echo "✅ Node.js 已找到:"
    echo "   路径: $NODE_PATH"
    echo "   版本: $NODE_VERSION"
    
    # 检查是否在 PATH 中
    if command -v node &> /dev/null; then
        echo "✅ Node.js 已在 PATH 中"
    else
        echo "⚠️  Node.js 不在 PATH 中，添加到 PATH..."
        export PATH="$(dirname $NODE_PATH):$PATH"
        echo "✅ 已添加到 PATH: $(dirname $NODE_PATH)"
    fi
else
    echo "❌ 未找到 Node.js"
    echo ""
    echo "💡 Ubuntu 安装 Node.js 的方法:"
    echo ""
    echo "方法 1: 使用 NodeSource 仓库（推荐）"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    echo ""
    echo "方法 2: 使用 snap"
    echo "   sudo snap install node --classic"
    echo ""
    echo "方法 3: 使用 nvm"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   source ~/.bashrc"
    echo "   nvm install node"
    echo ""
    echo "方法 4: 使用 apt（版本可能较旧）"
    echo "   sudo apt update"
    echo "   sudo apt install nodejs npm"
    exit 1
fi

# 检查 npm
echo ""
echo "🔍 检查 npm..."

NPM_PATHS=(
    "/usr/bin/npm"
    "/usr/local/bin/npm"
    "/opt/nodejs/bin/npm"
    "/snap/bin/npm"
    "$HOME/.nvm/versions/node/*/bin/npm"
    "$HOME/.local/bin/npm"
)

NPM_FOUND=false
NPM_PATH=""
NPM_VERSION=""

for path in "${NPM_PATHS[@]}"; do
    if [[ "$path" == *"*"* ]]; then
        # 处理通配符路径
        for expanded_path in $path; do
            if [ -f "$expanded_path" ]; then
                NPM_FOUND=true
                NPM_PATH="$expanded_path"
                NPM_VERSION=$($expanded_path --version 2>/dev/null || echo "unknown")
                break 2
            fi
        done
    else
        if [ -f "$path" ]; then
            NPM_FOUND=true
            NPM_PATH="$path"
            NPM_VERSION=$($path --version 2>/dev/null || echo "unknown")
            break
        fi
    fi
done

if [ "$NPM_FOUND" = true ]; then
    echo "✅ npm 已找到:"
    echo "   路径: $NPM_PATH"
    echo "   版本: $NPM_VERSION"
    
    # 检查是否在 PATH 中
    if command -v npm &> /dev/null; then
        echo "✅ npm 已在 PATH 中"
    else
        echo "⚠️  npm 不在 PATH 中，添加到 PATH..."
        export PATH="$(dirname $NPM_PATH):$PATH"
        echo "✅ 已添加到 PATH: $(dirname $NPM_PATH)"
    fi
else
    echo "❌ 未找到 npm"
    echo "💡 npm 通常随 Node.js 一起安装"
    exit 1
fi

echo ""
echo "🎉 Node.js 和 npm 检查完成！"
echo "   当前 PATH: $PATH"
echo ""
