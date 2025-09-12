#!/bin/bash

# AINO 新服务器一键部署脚本
# 自动检查并初始化数据库，然后启动服务

set -e

echo "🚀 AINO 新服务器一键部署脚本"
echo "=================================="

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 检查项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在 AINO-server 目录下运行此脚本"
    exit 1
fi

echo "✅ 项目目录检查通过"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

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
  process.exit(1);
});
"; then
    echo "❌ 数据库连接失败，请检查数据库配置"
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

# 启动服务器
npm start
