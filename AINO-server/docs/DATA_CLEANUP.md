# 数据清理策略文档

## 概述

AINO 平台使用软删除机制来保护数据，但长期积累的软删除记录会导致数据库膨胀。本文档描述了数据清理策略和工具。

## 软删除机制

### 实现方式
- 删除操作不真正删除记录，而是设置 `deleted_at` 字段
- 查询时自动过滤已删除记录：`WHERE deleted_at IS NULL`
- 保留完整的操作历史和审计追踪

### 优势
- ✅ 数据恢复：可轻松恢复误删数据
- ✅ 审计追踪：保留完整操作历史
- ✅ 数据完整性：避免级联删除
- ✅ 业务连续性：支持回收站功能

### 问题
- ❌ 数据积累：软删除记录持续增长
- ❌ 存储成本：占用额外存储空间
- ❌ 查询性能：影响查询效率
- ❌ 维护成本：需要定期清理

## 数据清理策略

### 1. 分层清理策略

```
活跃数据 (deleted_at IS NULL)
    ↓
软删除数据 (deleted_at IS NOT NULL)
    ↓ 7天后
压缩数据 (保留关键字段)
    ↓ 30天后
归档数据 (移动到历史表)
    ↓ 90天后
永久删除
```

### 2. 清理策略配置

```json
{
  "auto_cleanup": {
    "enabled": true,
    "retention_days": 30,
    "schedule": "0 2 * * *"
  },
  "test_data_cleanup": {
    "enabled": true,
    "keywords": ["test", "测试", "demo", "示例"]
  }
}
```

## 清理工具使用

### 安装和配置

```bash
# 进入脚本目录
cd AINO-server/scripts

# 设置执行权限
chmod +x data-cleanup.js
chmod +x setup-cron.sh
```

### 基本命令

```bash
# 分析数据情况
node data-cleanup.js analyze

# 清理测试数据
node data-cleanup.js cleanup-test

# 删除7天前的软删除记录
node data-cleanup.js delete-old 7

# 压缩软删除记录
node data-cleanup.js compress

# 归档软删除记录
node data-cleanup.js archive

# 执行完整清理流程
node data-cleanup.js full-cleanup
```

### 设置定时任务

```bash
# 设置自动清理任务
./setup-cron.sh

# 手动查看定时任务
crontab -l
```

## 清理策略详解

### 1. 测试数据清理
- **目标**：清理包含测试关键词的记录
- **关键词**：test, 测试, demo, 示例, example, 临时
- **频率**：每天执行
- **影响**：低风险，主要清理测试数据

### 2. 短期清理 (7天)
- **目标**：删除7天前的软删除记录
- **适用**：测试环境、开发环境
- **风险**：中等，可能影响数据恢复

### 3. 中期清理 (30天)
- **目标**：删除30天前的软删除记录
- **适用**：生产环境
- **风险**：低，符合一般业务需求

### 4. 长期归档 (90天)
- **目标**：归档90天前的软删除记录
- **适用**：需要长期保留审计数据的场景
- **风险**：极低，数据仍可恢复

## 监控和告警

### 关键指标
- **删除率**：软删除记录占总记录的比例
- **存储使用**：数据库大小和增长趋势
- **查询性能**：查询响应时间

### 告警阈值
```json
{
  "delete_rate": 0.8,      // 删除率超过80%告警
  "total_records": 10000,  // 总记录数超过1万告警
  "deleted_records": 5000  // 软删除记录超过5千告警
}
```

## 最佳实践

### 1. 环境配置
- **开发环境**：7天清理周期
- **测试环境**：3天清理周期
- **生产环境**：30天清理周期

### 2. 清理时机
- **低峰期**：凌晨2-4点执行
- **备份后**：确保数据已备份
- **监控中**：执行时监控系统状态

### 3. 数据保护
- **备份策略**：清理前创建数据备份
- **恢复测试**：定期测试数据恢复流程
- **权限控制**：限制清理脚本执行权限

## 故障处理

### 常见问题

1. **清理脚本执行失败**
   ```bash
   # 检查数据库连接
   node data-cleanup.js analyze
   
   # 检查权限
   psql -h localhost -U aino -d aino -c "SELECT 1"
   ```

2. **数据意外删除**
   ```bash
   # 从备份恢复
   pg_restore -h localhost -U aino -d aino backup_file.dump
   
   # 检查归档表
   SELECT * FROM dir_users_archive WHERE deleted_at > '2025-01-01';
   ```

3. **性能问题**
   ```bash
   # 分析查询性能
   EXPLAIN ANALYZE SELECT * FROM dir_users WHERE deleted_at IS NULL;
   
   # 重建索引
   REINDEX TABLE dir_users;
   ```

## 配置示例

### 生产环境配置
```json
{
  "cleanup_strategies": {
    "auto_cleanup": {
      "enabled": true,
      "retention_days": 30,
      "schedule": "0 2 * * *"
    },
    "test_data_cleanup": {
      "enabled": true,
      "keywords": ["test", "测试", "demo"]
    },
    "archiving": {
      "enabled": true,
      "archive_after_days": 90
    }
  }
}
```

### 开发环境配置
```json
{
  "cleanup_strategies": {
    "auto_cleanup": {
      "enabled": true,
      "retention_days": 7,
      "schedule": "0 1 * * *"
    },
    "test_data_cleanup": {
      "enabled": true,
      "keywords": ["test", "测试", "demo", "示例", "临时", "temp"]
    }
  }
}
```

## 总结

通过合理的数据清理策略，可以在保持软删除优势的同时，有效控制数据积累问题：

1. **分层清理**：根据时间分层处理软删除数据
2. **自动化**：设置定时任务自动执行清理
3. **监控告警**：实时监控数据状态和清理效果
4. **灵活配置**：根据不同环境调整清理策略
5. **安全保护**：确保数据安全和可恢复性

这样既解决了您担心的"垃圾数据太多"问题，又保持了软删除机制的优势。
