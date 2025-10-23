#!/bin/bash

# AINO 新服务器数据库初始化脚本
# 适用于全新的PostgreSQL数据库

set -e  # 遇到错误立即退出

echo "🚀 AINO 新服务器数据库初始化"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_info "检查系统依赖..."
    
    if ! command -v psql &> /dev/null; then
        print_error "未找到 PostgreSQL 客户端，请先安装 PostgreSQL"
        exit 1
    fi
    
    print_success "系统依赖检查通过"
}

# 获取数据库配置
get_db_config() {
    print_info "配置数据库连接参数..."
    
    # 从环境变量或用户输入获取配置
    DB_HOST=${DB_HOST:-$(read -p "数据库主机 [47.94.52.142:]: " input && echo ${input:-47.94.52.142:})}
    DB_PORT=${DB_PORT:-$(read -p "数据库端口 [5432]: " input && echo ${input:-5432})}
    DB_USER=${DB_USER:-$(read -p "数据库用户 [aino]: " input && echo ${input:-aino})}
    DB_PASSWORD=${DB_PASSWORD:-$(read -s -p "数据库密码: " input && echo $input)}
    DB_NAME=${DB_NAME:-$(read -p "数据库名称 [aino]: " input && echo ${input:-aino})}
    
    echo ""
    print_info "数据库配置:"
    echo "  主机: $DB_HOST"
    echo "  端口: $DB_PORT"
    echo "  用户: $DB_USER"
    echo "  数据库: $DB_NAME"
    echo ""
}

# 测试数据库连接
test_connection() {
    print_info "测试数据库连接..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        print_success "数据库连接成功"
    else
        print_error "无法连接到数据库"
        echo ""
        echo "请检查:"
        echo "  1. PostgreSQL 服务是否运行"
        echo "  2. 数据库配置是否正确"
        echo "  3. 用户权限是否足够"
        echo "  4. 数据库是否存在"
        exit 1
    fi
}

# 执行数据库初始化
init_database() {
    print_info "开始初始化数据库..."
    
    # 设置环境变量
    export DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME
    
    # 执行Node.js初始化脚本
    if node scripts/init-database.js; then
        print_success "数据库初始化完成"
    else
        print_error "数据库初始化失败"
        exit 1
    fi
}

# 验证安装
verify_installation() {
    print_info "验证数据库安装..."
    
    # 检查表数量
    TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    # 检查用户数量
    USER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
    
    # 检查应用数量
    APP_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM applications;" | tr -d ' ')
    
    echo ""
    print_success "安装验证结果:"
    echo "  表数量: $TABLE_COUNT"
    echo "  用户数量: $USER_COUNT"
    echo "  应用数量: $APP_COUNT"
    echo ""
}

# 显示后续步骤
show_next_steps() {
    print_success "🎉 AINO 数据库初始化成功完成！"
    echo ""
    print_info "📝 下一步操作:"
    echo "  1. 启动 AINO 服务器:"
    echo "     cd /path/to/AINO-server"
    echo "     npm run dev"
    echo ""
    echo "  2. 访问管理界面:"
    echo "     http://47.94.52.142::3007"
    echo ""
    echo "  3. 使用默认账号登录:"
    echo "     邮箱: admin@aino.com"
    echo "     密码: admin123"
    echo ""
    print_warning "重要提醒:"
    echo "  - 请立即修改默认管理员密码"
    echo "  - 配置生产环境的安全设置"
    echo "  - 定期备份数据库"
    echo ""
}

# 主函数
main() {
    # check_dependencies
    get_db_config
    test_connection
    init_database
    verify_installation
    show_next_steps
}

# 执行主函数
main "$@"
