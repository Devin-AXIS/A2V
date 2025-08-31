# 模板系统使用示例

## 完整使用流程

### 1. 创建新应用

首先在前端创建一个新应用，获取应用ID（UUID格式）。

### 2. 应用用户模块模板

```bash
# 使用便捷脚本（推荐）
npx tsx scripts/apply-user-template.ts 123e4567-e89b-12d3-a456-426614174000

# 或使用主脚本
npx tsx scripts/templates/index.ts 123e4567-e89b-12d3-a456-426614174000 user-module
```

### 3. 预期输出

```
🎯 应用用户模块模板
📱 应用ID: 123e4567-e89b-12d3-a456-426614174000

🚀 开始应用模板: user-module
📁 创建目录: 用户列表
📂 创建字段分类...
📋 创建字段定义...
✅ 目录 用户列表 创建完成
   - 字段分类: 3 个
   - 字段定义: 19 个
🎉 模板 user-module 应用成功！

🎉 用户模块模板应用成功！

📋 创建的内容:
  ✅ 用户列表目录
  ✅ 3个字段分类: 基础信息、用户履历、实名与认证
  ✅ 19个默认字段

🔗 现在你可以在前端看到完整的用户管理功能了！
```

### 4. 验证结果

在前端应用中，你应该能看到：

1. **用户列表目录** - 在目录列表中
2. **字段分类** - 基础信息、用户履历、实名与认证
3. **默认字段** - 19个预定义的字段

## 实际应用场景

### 场景1: 新应用初始化

```bash
# 1. 创建应用后，立即应用用户模块模板
npx tsx scripts/apply-user-template.ts <新应用ID>

# 2. 如果需要其他模块，可以继续应用
npx tsx scripts/templates/index.ts <应用ID> product-module  # 未来扩展
```

### 场景2: 批量应用模板

```bash
# 为多个应用批量应用模板
for app_id in "app1-uuid" "app2-uuid" "app3-uuid"; do
  echo "应用模板到 $app_id"
  npx tsx scripts/apply-user-template.ts "$app_id"
done
```

### 场景3: 开发测试

```bash
# 在开发环境中快速设置测试数据
npx tsx scripts/apply-user-template.ts test-app-uuid
```

## 故障排除

### 常见问题

1. **应用ID格式错误**
   ```
   ❌ invalid input syntax for type uuid
   ```
   解决：确保应用ID是有效的UUID格式

2. **应用不存在**
   ```
   ❌ 应用不存在
   ```
   解决：检查应用ID是否正确，确保应用已创建

3. **权限问题**
   ```
   ❌ 权限不足
   ```
   解决：确保数据库连接正常，有足够的权限

### 调试技巧

1. **查看详细日志**
   ```bash
   # 脚本会输出详细的执行过程
   npx tsx scripts/apply-user-template.ts <应用ID>
   ```

2. **验证数据库**
   ```bash
   # 检查创建的数据
   psql $PG_URL -c "SELECT * FROM directories WHERE application_id = '<应用ID>'"
   ```

3. **测试模板系统**
   ```bash
   # 运行测试脚本
   npx tsx scripts/test-template.ts
   ```

## 扩展指南

### 添加新模板

1. 创建模板定义文件
2. 在 `index.ts` 中注册模板
3. 测试新模板
4. 更新文档

### 自定义字段

修改 `user-module-template.ts` 中的字段定义：

```typescript
{
  key: 'custom_field',
  label: '自定义字段',
  type: 'text',
  required: false,
  showInList: true,
  showInForm: true,
  category: '基础信息'
}
```

### 添加新分类

在模板的 `categories` 数组中添加：

```typescript
{
  name: '新分类',
  description: '新分类描述',
  order: 4,
  system: true
}
```
