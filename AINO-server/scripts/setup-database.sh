#!/bin/bash

# AINO 数据库初始化脚本
# 用于在新服务器上快速初始化数据库

echo "🚀 AINO 数据库初始化脚本"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查PostgreSQL是否运行
if ! command -v psql &> /dev/null; then
    echo "❌ 错误: 未找到 PostgreSQL 客户端，请先安装 PostgreSQL"
    exit 1
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

# 检查数据库连接
echo "🔍 检查数据库连接..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null

if [ $? -ne 0 ]; then
    echo "❌ 错误: 无法连接到数据库"
    echo "请检查:"
    echo "   1. PostgreSQL 服务是否运行"
    echo "   2. 数据库配置是否正确"
    echo "   3. 用户权限是否足够"
    exit 1
fi

echo "✅ 数据库连接正常"

# 执行初始化脚本
echo ""
echo "🚀 开始执行数据库初始化..."
node scripts/init-database.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 数据库初始化成功完成！"
    echo ""
    echo "📝 下一步操作:"
    echo "   1. 启动 AINO 服务器: npm run dev"
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
