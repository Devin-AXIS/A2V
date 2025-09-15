# 🚀 AINO 新服务器数据库初始化指南

## 快速开始

在新服务器上部署 AINO 项目时，使用以下命令一键初始化数据库：

```bash
# 下载并执行初始化脚本
./scripts/init-new-server.sh
```

## 📋 初始化内容

### ✅ 数据库结构
- **17个核心业务表** - 完整的应用管理系统表结构
- **主键约束** - 所有表的UUID主键
- **外键约束** - 表间关系完整性
- **唯一约束** - 防止重复数据
- **性能索引** - 72个优化索引

### ✅ 基础数据
- **默认管理员** - `admin@aino.com` / `admin123`
- **默认应用** - `default-app`
- **默认模块** - 用户管理、数据管理、系统设置

## 🔧 使用方法

### 方法一：交互式初始化（推荐）
```bash
./scripts/init-new-server.sh
```
脚本会引导你输入数据库配置信息。

### 方法二：环境变量配置
```bash
export DB_HOST=your_host
export DB_PORT=5432
export DB_USER=your_user
export DB_PASSWORD=your_password
export DB_NAME=your_database

./scripts/init-new-server.sh
```

### 方法三：直接执行
```bash
node scripts/init-database.js
```

## 📊 数据库表说明

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 系统用户 | id, name, email, password, roles |
| `applications` | 应用主表 | id, name, slug, owner_id, config |
| `application_users` | 应用内用户 | id, application_id, phone, password |
| `modules` | 模块定义 | id, application_id, name, type, config |
| `directories` | 数据目录 | id, application_id, module_id, name, type |
| `field_defs` | 字段定义 | id, directory_id, key, type, schema |
| `relation_records` | 关系记录 | id, from_directory_id, to_directory_id |

## ⚠️ 重要提醒

1. **安全设置**
   - 立即修改默认密码 `admin123`
   - 配置数据库访问权限
   - 启用SSL连接（生产环境）

2. **备份策略**
   - 定期备份数据库
   - 测试恢复流程

3. **性能优化**
   - 根据使用情况调整索引
   - 监控数据库性能

## 🔍 验证安装

```bash
# 检查表数量
psql -d aino -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# 检查默认用户
psql -d aino -c "SELECT name, email FROM users WHERE email = 'admin@aino.com';"

# 检查默认应用
psql -d aino -c "SELECT name, slug FROM applications WHERE slug = 'default-app';"
```

## 🆘 故障排除

### 常见问题

1. **连接失败**
   ```bash
   # 检查PostgreSQL服务
   sudo systemctl status postgresql
   
   # 检查端口
   netstat -tlnp | grep 5432
   ```

2. **权限错误**
   ```sql
   -- 创建用户和数据库
   CREATE USER aino WITH PASSWORD 'pass';
   CREATE DATABASE aino OWNER aino;
   GRANT ALL PRIVILEGES ON DATABASE aino TO aino;
   ```

3. **表已存在**
   - 脚本会自动跳过已存在的对象
   - 如需重新创建，请先删除现有表

## 📞 技术支持

如遇问题，请提供：
- 错误信息截图
- 数据库版本：`psql --version`
- 操作系统信息：`uname -a`
- 执行步骤和配置

---

**🎉 初始化完成后，你的 AINO 项目就可以在新服务器上正常运行了！**
