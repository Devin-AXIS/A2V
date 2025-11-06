# 数据存储迁移：JSON → SQLite

本文档说明如何将数据存储从 JSON 文件迁移到 SQLite 数据库。

## 变更概述

系统已从使用 JSON 文件存储改为使用 SQLite 数据库，以提高性能和可扩展性。

### 文件变更

- **数据库文件位置**: `data/database.db`
- **原 JSON 文件位置**:
  - `data/mcp-configs/configs.json` (MCP 配置)
  - `data/user-profiles/profiles.json` (用户配置)

### 数据库 Schema

#### mcp_configs 表
- `id` (TEXT PRIMARY KEY) - 配置 ID
- `title` (TEXT NOT NULL) - 标题
- `description` (TEXT NOT NULL) - 描述
- `icon` (TEXT) - 图标 URL
- `creator_wallet` (TEXT) - 创建者钱包地址
- `connection_type` (TEXT NOT NULL) - 连接类型 (url/command/script)
- `connection_config` (TEXT NOT NULL) - 连接配置 (JSON 字符串)
- `created_at` (TEXT NOT NULL) - 创建时间

#### user_profiles 表
- `address` (TEXT PRIMARY KEY) - 钱包地址
- `avatar` (TEXT) - 头像 URL
- `name` (TEXT NOT NULL) - 姓名
- `website` (TEXT) - 网站
- `profession` (TEXT) - 职业
- `bio` (TEXT) - 简介
- `updated_at` (TEXT NOT NULL) - 更新时间

## 迁移步骤

### 1. 运行迁移脚本

迁移脚本会自动将现有的 JSON 数据导入到 SQLite 数据库：

```bash
pnpm migrate
```

或者在项目根目录运行：

```bash
npx tsx scripts/migrate-to-sqlite.ts
```

### 2. 验证迁移结果

迁移脚本会：
- 检查数据库中是否已有数据（如果有，会跳过迁移）
- 读取 JSON 文件中的数据
- 将数据导入到 SQLite 数据库
- 显示迁移进度和结果

### 3. 备份旧数据（可选）

迁移完成后，您可以备份旧的 JSON 文件：

```bash
# 备份 JSON 文件
cp data/mcp-configs/configs.json data/mcp-configs/configs.json.backup
cp data/user-profiles/profiles.json data/user-profiles/profiles.json.backup
```

### 4. 删除旧文件（可选）

确认系统正常运行后，可以删除旧的 JSON 文件：

```bash
rm data/mcp-configs/configs.json
rm data/user-profiles/profiles.json
```

## 性能优化

SQLite 数据库已启用以下优化：

1. **WAL 模式**: 启用 Write-Ahead Logging 以提高并发性能
2. **索引**: 在 `creator_wallet` 和 `created_at` 字段上创建了索引
3. **单例模式**: 数据库连接使用单例模式，避免重复连接

## API 变更

所有 API 路由已更新为使用数据库，接口保持不变：

- `GET /api/configs` - 获取所有配置
- `GET /api/config/[configId]` - 获取单个配置
- `POST /api/save-config` - 保存配置
- `DELETE /api/delete-config` - 删除配置
- `GET /api/user-profile` - 获取用户配置
- `POST /api/user-profile` - 保存用户配置

## 安装问题

### better-sqlite3 构建问题

如果遇到 "Could not locate the bindings file" 错误，说明 better-sqlite3 的原生模块没有正确构建。

解决方法：

1. **手动构建**（推荐）：
   ```bash
   pnpm build-sqlite
   ```

2. **或者直接使用 node-gyp**：
   ```bash
   cd node_modules/.pnpm/better-sqlite3@12.4.1/node_modules/better-sqlite3
   node-gyp rebuild
   ```

3. **重新安装**（如果上述方法不行）：
   ```bash
   pnpm remove better-sqlite3
   pnpm add better-sqlite3
   pnpm build-sqlite
   ```

## 故障排除

### 迁移失败

如果迁移失败，检查：
1. JSON 文件是否存在且格式正确
2. 数据库目录权限是否正确
3. 查看控制台错误信息

### 数据库锁定

如果遇到数据库锁定错误：
1. 确保没有多个进程同时访问数据库
2. 检查是否有其他应用正在使用数据库文件
3. 重启应用

### 数据不一致

如果发现数据不一致：
1. 停止应用
2. 删除 `data/database.db` 文件
3. 重新运行迁移脚本

## 注意事项

- 迁移脚本是幂等的，可以安全地多次运行
- 如果数据库中已有数据，迁移脚本会跳过迁移
- 建议在迁移前备份 JSON 文件
- 迁移后，系统将只使用 SQLite 数据库，不再读取 JSON 文件

