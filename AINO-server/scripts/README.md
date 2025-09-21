# AINO 数据库初始化脚本

这个目录包含了在新服务器上初始化 AINO 数据库的完整脚本。

## 📁 文件说明

- `init-database.sql` - 完整的数据库结构SQL脚本
- `init-database.js` - Node.js初始化脚本（包含基础数据）
- `setup-database.sh` - 一键执行脚本

## 🚀 快速开始

### 方法一：使用一键脚本（推荐）

```bash
# 设置数据库配置（可选）
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=aino
export DB_PASSWORD=your_password
export DB_NAME=aino

# 执行初始化
./scripts/setup-database.sh
```

### 方法二：手动执行

```bash
# 1. 执行SQL脚本创建表结构
psql -h localhost -p 5432 -U aino -d aino -f scripts/init-database.sql

# 2. 执行Node.js脚本创建基础数据
node scripts/init-database.js
```

## 📋 初始化内容

### 数据库结构
- ✅ 17个核心业务表
- ✅ 主键约束
- ✅ 外键约束
- ✅ 唯一约束
- ✅ 性能优化索引

### 基础数据
- ✅ 默认管理员用户 (`admin@aino.com` / `admin123`)
- ✅ 默认应用 (`default-app`)
- ✅ 默认模块（用户管理、数据管理、系统设置）

## 🔧 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DB_HOST` | localhost | 数据库主机 |
| `DB_PORT` | 5432 | 数据库端口 |
| `DB_USER` | aino | 数据库用户名 |
| `DB_PASSWORD` | pass | 数据库密码 |
| `DB_NAME` | aino | 数据库名称 |

## 📊 数据库表结构

### 核心业务表
- `users` - 系统用户表
- `applications` - 应用主表
- `application_users` - 应用内用户表
- `application_members` - 应用成员关系表

### 模块系统
- `modules` - 模块定义表
- `module_installs` - 模块安装记录表

### 数据目录系统
- `directories` - 数据目录表
- `directory_defs` - 目录定义表
- `field_defs` - 字段定义表
- `field_categories` - 字段分类表
- `field_indexes` - 字段索引表

### 记录管理
- `record_categories` - 记录分类表
- `relation_records` - 关系记录表

### 系统功能
- `audit_logs` - 审计日志表
- `dir_jobs` - 目录作业表
- `dir_users` - 目录用户表

## ⚠️ 重要提醒

1. **生产环境安全**
   - 立即修改默认管理员密码
   - 配置适当的数据库权限
   - 启用SSL连接

2. **备份策略**
   - 定期备份数据库
   - 测试恢复流程

3. **性能优化**
   - 根据实际使用情况调整索引
   - 监控数据库性能

## 🔍 验证安装

初始化完成后，可以通过以下方式验证：

```bash
# 检查表是否创建成功
psql -h localhost -p 5432 -U aino -d aino -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# 检查默认用户
psql -h localhost -p 5432 -U aino -d aino -c "SELECT name, email FROM users WHERE email = 'admin@aino.com';"

# 检查默认应用
psql -h localhost -p 5432 -U aino -d aino -c "SELECT name, slug FROM applications WHERE slug = 'default-app';"
```

## 🆘 故障排除

### 常见问题

1. **连接失败**
   - 检查PostgreSQL服务是否运行
   - 验证数据库配置信息
   - 确认用户权限

2. **权限错误**
   - 确保数据库用户有CREATE权限
   - 检查数据库是否存在

3. **表已存在**
   - 脚本会自动跳过已存在的对象
   - 如需重新创建，请先删除现有表

### 获取帮助

如果遇到问题，请检查：
1. PostgreSQL 日志
2. Node.js 控制台输出
3. 数据库连接状态

## 📞 技术支持

如需技术支持，请提供：
- 错误信息截图
- 数据库版本信息
- 操作系统信息
- 执行步骤
