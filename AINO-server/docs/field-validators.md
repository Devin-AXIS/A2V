# 字段验证器功能说明

## 📋 概述

字段验证器为AINO平台的字段系统提供了强大的数据验证能力，支持多种验证规则，确保数据的完整性和正确性。

## ✅ 支持的验证规则

### 1. 文本字段 (text, textarea)

```typescript
{
  validators: {
    minLength: 2,        // 最小长度
    maxLength: 50,       // 最大长度
    pattern: '^[a-zA-Z\\u4e00-\\u9fa5\\s]+$'  // 正则表达式
  }
}
```

**验证规则**：
- `minLength`: 文本最小长度
- `maxLength`: 文本最大长度
- `pattern`: 正则表达式模式匹配

### 2. 数字字段 (number)

```typescript
{
  validators: {
    min: 0,              // 最小值
    max: 150,            // 最大值
    step: 1              // 步长（必须是该值的倍数）
  }
}
```

**验证规则**：
- `min`: 数值最小值
- `max`: 数值最大值
- `step`: 数值步长，确保数值是该步长的倍数

### 3. 多选字段 (multiselect)

```typescript
{
  validators: {
    minItems: 1,         // 最少选择项数
    maxItems: 5          // 最多选择项数
  }
}
```

**验证规则**：
- `minItems`: 最少选择项数
- `maxItems`: 最多选择项数

### 4. 图片字段 (image)

```typescript
{
  validators: {
    maxSizeMB: 5         // 最大文件大小（MB）
  }
}
```

**验证规则**：
- `maxSizeMB`: 最大文件大小，单位为MB

### 5. 文件字段 (file)

```typescript
{
  validators: {
    maxSizeMB: 10,       // 最大文件大小（MB）
    accept: 'application/pdf,text/plain'  // 接受的文件类型
  }
}
```

**验证规则**：
- `maxSizeMB`: 最大文件大小，单位为MB
- `accept`: 接受的文件类型，支持MIME类型和通配符

## 🔧 使用方法

### 1. 在字段定义中配置验证器

```typescript
const fieldDef = {
  id: '1',
  key: 'name',
  kind: 'primitive',
  type: 'text',
  required: true,
  validators: {
    minLength: 2,
    maxLength: 50,
    pattern: '^[a-zA-Z\\u4e00-\\u9fa5\\s]+$'
  }
}
```

### 2. 验证单个字段

```typescript
import { fieldProcessorManager } from './lib/field-processors'

const result = fieldProcessorManager.validateField('张三', fieldDef)
if (!result.valid) {
  console.log('验证失败:', result.error)
}
```

### 3. 验证整个记录

```typescript
const record = {
  name: '张三',
  age: 25,
  skills: ['JavaScript', 'React']
}

const fieldDefs = [nameFieldDef, ageFieldDef, skillsFieldDef]
const result = fieldProcessorManager.validateRecord(record, fieldDefs)

if (!result.valid) {
  console.log('验证错误:', result.errors)
}
```

## 🧪 测试

运行测试脚本验证功能：

```bash
node scripts/test-field-validators.js
```

## 📝 错误消息

验证器提供中文错误消息：

- 文本长度验证：`文本长度不能少于X个字符` / `文本长度不能超过X个字符`
- 数值范围验证：`数值不能小于X` / `数值不能大于X`
- 数值步长验证：`数值必须是X的倍数`
- 多选数量验证：`至少需要选择X项` / `最多只能选择X项`
- 文件大小验证：`图片大小不能超过XMB` / `文件大小不能超过XMB`
- 文件类型验证：`不支持的文件类型`
- 格式验证：`文本格式不符合要求` / `图片URL格式不正确`

## 🔄 扩展性

验证器系统支持扩展，可以：

1. 添加新的验证规则类型
2. 自定义错误消息
3. 支持国际化
4. 添加异步验证（如远程API验证）

## 📚 相关文件

- `src/lib/field-processors.ts` - 字段处理器实现
- `scripts/test-field-validators.js` - 测试脚本
- `docs/字段系统方案.md` - 字段系统设计文档
