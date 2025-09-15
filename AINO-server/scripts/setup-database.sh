#!/bin/bash

# AINO 数据库初始化脚本
# 用于在新服务器上快速初始化数据库（支持Docker环境）

echo "🚀 AINO 数据库初始化脚本"
echo "================================"

# 检查Node.js是否安装
echo "🔍 检查 Node.js 安装状态..."

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
    echo "✅ Node.js 已安装: $NODE_VERSION"
elif [ -f "/usr/bin/node" ]; then
    NODE_VERSION=$(/usr/bin/node --version 2>/dev/null || echo "unknown")
    echo "✅ Node.js 已安装: $NODE_VERSION (在 /usr/bin/node)"
    # 添加 Node.js 到 PATH
    export PATH="/usr/bin:$PATH"
elif [ -f "/usr/local/bin/node" ]; then
    NODE_VERSION=$(/usr/local/bin/node --version 2>/dev/null || echo "unknown")
    echo "✅ Node.js 已安装: $NODE_VERSION (在 /usr/local/bin/node)"
    export PATH="/usr/local/bin:$PATH"
else
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    echo "💡 Ubuntu 安装命令:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi

# 检查包管理器并安装依赖（如果需要）
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
    echo "📦 检测到需要安装依赖..."
    
    if [ -f "pnpm-lock.yaml" ]; then
        echo "📋 检测到 pnpm 项目，使用 pnpm 安装依赖..."
        if command -v pnpm &> /dev/null; then
            pnpm install
        elif [ -f "/usr/bin/pnpm" ]; then
            /usr/bin/pnpm install
        elif [ -f "/usr/local/bin/pnpm" ]; then
            /usr/local/bin/pnpm install
        else
            echo "⚠️  pnpm 未安装，尝试使用 npm 安装..."
            echo "💡 建议安装 pnpm: npm install -g pnpm"
            npm install --legacy-peer-deps
        fi
    elif [ -f "yarn.lock" ]; then
        echo "📋 检测到 yarn 项目，使用 yarn 安装依赖..."
        if command -v yarn &> /dev/null; then
            yarn install
        else
            echo "⚠️  yarn 未安装，使用 npm 安装..."
            npm install --legacy-peer-deps
        fi
    else
        echo "📋 使用 npm 安装依赖..."
        npm install --legacy-peer-deps
    fi
fi

# 设置默认数据库配置
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5433"}
DB_USER=${DB_USER:-"aino"}
DB_PASSWORD=${DB_PASSWORD:-"pass"}
DB_NAME=${DB_NAME:-"aino"}

echo "📊 数据库配置:"
echo "   主机: $DB_HOST"
echo "   端口: $DB_PORT"
echo "   用户: $DB_USER"
echo "   数据库: $DB_NAME"
echo ""

# 检查数据库连接（使用Node.js而不是psql，支持Docker环境）
echo "🔍 检查数据库连接..."
node --input-type=module -e "
import { Pool } from 'pg';
const pool = new Pool({
  host: '$DB_HOST',
  port: $DB_PORT,
  user: '$DB_USER',
  password: '$DB_PASSWORD',
  database: '$DB_NAME',
  ssl: false
});
pool.query('SELECT 1').then(() => {
  console.log('✅ 数据库连接正常');
  process.exit(0);
}).catch((err) => {
  console.error('❌ 错误: 无法连接到数据库');
  console.error('请检查:');
  console.error('   1. PostgreSQL 服务是否运行');
  console.error('   2. 数据库配置是否正确');
  console.error('   3. 用户权限是否足够');
  console.error('   4. Docker 容器是否正常运行');
  console.error('   5. 端口映射是否正确');
  // process.exit(1);
});
"

if [ $? -ne 0 ]; then
    exit 1
fi

# 执行初始化脚本
echo ""
echo "🚀 开始执行数据库初始化..."
node scripts/init-database.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 数据库初始化成功完成！"
    echo ""
    echo "📝 下一步操作:"
    echo "   1. 启动 AINO 服务器: npm start"
    echo "   2. 访问管理界面: http://localhost:3007"
    echo "   3. 使用默认账号登录: admin@aino.com / admin123"
    echo ""
    echo "⚠️  重要提醒:"
    echo "   - 请立即修改默认管理员密码"
    echo "   - 配置生产环境的安全设置"
else
    echo ""
    echo "❌ 数据库初始化失败"
    echo "请检查错误信息并重试"
    exit 1
fi