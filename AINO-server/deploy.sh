#!/bin/bash

# AINO 新服务器一键部署脚本
# 自动检查并初始化数据库，然后启动服务

set -e

echo "🚀 AINO 新服务器一键部署脚本"
echo "=================================="

# 检查 Node.js 和 npm
echo "🔍 检查 Node.js 安装状态..."

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
    echo "✅ Node.js 已安装: $NODE_VERSION"
elif [ -f "/usr/bin/node" ]; then
    NODE_VERSION=$(/usr/bin/node --version 2>/dev/null || echo "unknown")
    echo "✅ Node.js 已安装: $NODE_VERSION (在 /usr/bin/node)"
    # 创建软链接或添加到 PATH
    if ! command -v node &> /dev/null; then
        echo "📋 添加 Node.js 到 PATH..."
        export PATH="/usr/bin:$PATH"
    fi
elif [ -f "/usr/local/bin/node" ]; then
    NODE_VERSION=$(/usr/local/bin/node --version 2>/dev/null || echo "unknown")
    echo "✅ Node.js 已安装: $NODE_VERSION (在 /usr/local/bin/node)"
    export PATH="/usr/local/bin:$PATH"
else
    echo "❌ Node.js 未安装，请先安装 Node.js"
    echo "💡 Ubuntu 安装命令:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi

# 检查 npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version 2>/dev/null || echo "unknown")
    echo "✅ npm 已安装: $NPM_VERSION"
elif [ -f "/usr/bin/npm" ]; then
    NPM_VERSION=$(/usr/bin/npm --version 2>/dev/null || echo "unknown")
    echo "✅ npm 已安装: $NPM_VERSION (在 /usr/bin/npm)"
    export PATH="/usr/bin:$PATH"
elif [ -f "/usr/local/bin/npm" ]; then
    NPM_VERSION=$(/usr/local/bin/npm --version 2>/dev/null || echo "unknown")
    echo "✅ npm 已安装: $NPM_VERSION (在 /usr/local/bin/npm)"
    export PATH="/usr/local/bin:$PATH"
else
    echo "❌ npm 未安装，请先安装 npm"
    echo "💡 npm 通常随 Node.js 一起安装"
    exit 1
fi

# 检查项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在 AINO-server 目录下运行此脚本"
    exit 1
fi

echo "✅ 项目目录检查通过"

# 安装依赖
echo "📦 安装项目依赖..."

# 检查包管理器
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

# 检查数据库连接
echo "🔍 检查数据库连接..."
if ! node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'aino',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'aino',
  ssl: false
});
pool.query('SELECT 1').then(() => {
  console.log('✅ 数据库连接正常');
  process.exit(0);
}).catch((err) => {
  console.error('❌ 数据库连接失败:', err.message);
  console.error('请检查:');
  console.error('   1. PostgreSQL 服务是否运行');
  console.error('   2. Docker 容器是否正常运行');
  console.error('   3. 端口映射是否正确');
  console.error('   4. 数据库配置是否正确');
  process.exit(1);
});
"; then
    echo "❌ 数据库连接失败，请检查数据库配置"
    echo "💡 提示: 如果使用 Docker，请确保容器正在运行"
    echo "   docker ps | grep postgres"
    exit 1
fi

# 检查数据库是否已初始化
echo "🔍 检查数据库初始化状态..."
if node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'aino',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'aino',
  ssl: false
});
async function checkTables() {
  const coreTables = ['users', 'applications', 'modules', 'directories'];
  const checks = await Promise.all(
    coreTables.map(async (table) => {
      const result = await pool.query(\`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = \$1
        )
      \`, [table]);
      return result.rows[0].exists;
    })
  );
  const allExist = checks.every(exists => exists);
  if (allExist) {
    console.log('✅ 数据库已初始化');
    process.exit(0);
  } else {
    console.log('⚠️  数据库未初始化');
    process.exit(1);
  }
}
checkTables().catch(err => {
  console.error('❌ 检查失败:', err.message);
  process.exit(1);
});
"; then
    echo "✅ 数据库已初始化"
else
    echo "⚠️  数据库未初始化，开始初始化..."
    
    # 运行数据库初始化脚本
    echo "📋 执行数据库初始化..."
    if node scripts/init-database.js; then
        echo "✅ 数据库初始化完成"
    else
        echo "❌ 数据库初始化失败"
        exit 1
    fi
fi

# 启动服务器
echo "🚀 启动 AINO 服务器..."
echo "=================================="
echo "服务器将在 http://localhost:3007 启动"
echo "健康检查: http://localhost:3007/health"
echo "按 Ctrl+C 停止服务器"
echo "=================================="

# 检查是否需要编译
if [ ! -d "dist" ] || [ ! -f "dist/server.js" ]; then
    echo "📋 检测到需要编译 TypeScript 代码..."
    if [ -f "pnpm-lock.yaml" ]; then
        echo "📋 使用 pnpm 编译..."
        pnpm run build
    elif [ -f "yarn.lock" ]; then
        echo "📋 使用 yarn 编译..."
        yarn build
    else
        echo "📋 使用 npm 编译..."
        npm run build
    fi
fi

# 启动服务器
if [ -f "pnpm-lock.yaml" ]; then
    pnpm start
elif [ -f "yarn.lock" ]; then
    yarn start
else
    npm start
fi
