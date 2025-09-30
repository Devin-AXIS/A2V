# AINO配置采集器使用说明

## 📋 概述

AINO配置采集器是一个强大的工具，用于采集AINO系统中所有的配置信息，包括Studio端和APP端的各种配置。它可以将所有配置整合到一个JSON对象中，方便分析、备份和迁移。

## 🚀 快速开始

### 基础使用

```typescript
import { collectAllConfigs } from '@/lib/config-collector'

// 采集所有系统配置
const configs = await collectAllConfigs()
console.log('采集到的配置:', configs)
```

### 完整配置采集

```typescript
import { collectCompleteConfigs } from '@/lib/config-collector'

// 采集所有配置源（系统配置 + 本地存储 + API配置）
const completeConfigs = await collectCompleteConfigs()
console.log('完整配置:', completeConfigs)
```

## 📊 配置结构

### 返回的JSON对象结构

```json
{
  "studio": {
    "manifest": {
      "schemaVersion": "1.0",
      "app": {
        "appKey": "default-app",
        "locale": "zh-CN",
        "defaultLanguage": "zh",
        "theme": "default",
        "bottomNav": [...],
        "pcTopNav": [...]
      }
    },
    "auth": {
      "layoutVariant": "centered",
      "showBackground": true,
      "providers": [...]
    },
    "pages": {
      "home": {
        "title": {...},
        "route": "/home",
        "layout": "mobile",
        "category": "workspace"
      }
    },
    "dataSources": {...}
  },
  "app": {
    "layout": {
      "default": {...},
      "presets": {...}
    },
    "components": {
      "default": {...},
      "presets": {...}
    },
    "design": {
      "tokens": {...},
      "presets": {...},
      "semantic": {...}
    },
    "animation": {
      "durations": {...},
      "easings": {...},
      "presets": {...},
      "components": {...},
      "pageTransitions": {...}
    },
    "accessibility": {
      "contrast": {...},
      "focus": {...},
      "keyboard": {...},
      "screenReader": {...},
      "motion": {...}
    },
    "themes": {
      "unified": [...],
      "card": [...]
    },
    "cards": {
      "registry": [...],
      "layouts": {...}
    }
  },
  "metadata": {
    "version": "1.0.0",
    "collectedAt": "2024-01-01T00:00:00.000Z",
    "source": "AINO Config Collector",
    "totalConfigs": 150
  }
}
```

## 🔧 主要功能

### 1. 系统配置采集
- 采集Studio端的所有配置（Manifest、认证、页面、数据源）
- 采集APP端的所有配置（布局、组件、设计、动画、可访问性、主题、卡片）

### 2. 本地存储配置采集
- 自动扫描localStorage中的所有配置项
- 支持JSON解析和原始值保存

### 3. API配置采集
- 从后端API获取应用配置
- 获取页面配置和预览配置

### 4. 配置验证
- 验证配置的完整性
- 检查必需配置项是否存在
- 提供错误和警告信息

### 5. 配置导出
- 将配置导出为JSON文件
- 支持自定义文件名

## 📝 使用示例

### 基础配置采集

```typescript
import { collectAllConfigs } from '@/lib/config-collector'

async function getConfigs() {
  try {
    const configs = await collectAllConfigs()
    
    // 验证配置
    const validation = validateConfigs(configs)
    if (!validation.isValid) {
      console.error('配置验证失败:', validation.errors)
      return
    }
    
    console.log('配置采集成功:', configs)
    return configs
  } catch (error) {
    console.error('配置采集失败:', error)
  }
}
```

### 完整配置采集

```typescript
import { collectCompleteConfigs } from '@/lib/config-collector'

async function getCompleteConfigs() {
  try {
    const completeConfigs = await collectCompleteConfigs()
    
    console.log('系统配置项数:', completeConfigs.system.metadata.totalConfigs)
    console.log('本地配置项数:', Object.keys(completeConfigs.local).length)
    console.log('API配置项数:', Object.keys(completeConfigs.api).length)
    
    return completeConfigs
  } catch (error) {
    console.error('完整配置采集失败:', error)
  }
}
```

### 配置导出

```typescript
import { collectAllConfigs, exportConfigsToJson } from '@/lib/config-collector'

async function exportConfigs() {
  try {
    const configs = await collectAllConfigs()
    
    // 导出到JSON文件
    exportConfigsToJson(configs, 'my-aino-configs.json')
    
    console.log('配置已导出到文件')
  } catch (error) {
    console.error('配置导出失败:', error)
  }
}
```

### 配置分析

```typescript
import { collectAllConfigs } from '@/lib/config-collector'

async function analyzeConfigs() {
  try {
    const configs = await collectAllConfigs()
    
    // 分析Studio配置
    const studioAnalysis = {
      hasAppKey: !!configs.studio.manifest.app.appKey,
      navItems: configs.studio.manifest.app.bottomNav.length,
      authProviders: configs.studio.auth.providers.length,
      totalPages: Object.keys(configs.studio.pages).length
    }
    
    // 分析APP配置
    const appAnalysis = {
      layoutPresets: Object.keys(configs.app.layout.presets).length,
      componentPresets: Object.keys(configs.app.components.presets).length,
      animationPresets: Object.keys(configs.app.animation.presets).length,
      unifiedThemes: configs.app.themes.unified.length
    }
    
    console.log('Studio配置分析:', studioAnalysis)
    console.log('APP配置分析:', appAnalysis)
    
    return { studio: studioAnalysis, app: appAnalysis }
  } catch (error) {
    console.error('配置分析失败:', error)
  }
}
```

## 🛠️ 高级功能

### 配置备份

```typescript
import { collectCompleteConfigs, exportConfigsToJson } from '@/lib/config-collector'

async function backupConfigs() {
  try {
    const configs = await collectCompleteConfigs()
    
    // 创建备份配置
    const backup = {
      ...configs,
      backup: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        description: 'AINO系统配置完整备份'
      }
    }
    
    // 导出备份文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `aino-config-backup-${timestamp}.json`
    exportConfigsToJson(backup, filename)
    
    console.log('配置备份完成:', filename)
  } catch (error) {
    console.error('配置备份失败:', error)
  }
}
```

### 配置对比

```typescript
import { collectAllConfigs } from '@/lib/config-collector'

async function compareConfigs() {
  try {
    const currentConfigs = await collectAllConfigs()
    
    // 模拟历史配置
    const historicalConfigs = {
      ...currentConfigs,
      metadata: {
        ...currentConfigs.metadata,
        version: '0.9.0'
      }
    }
    
    // 对比配置变化
    const comparison = {
      versionChanged: currentConfigs.metadata.version !== historicalConfigs.metadata.version,
      configCountChanged: currentConfigs.metadata.totalConfigs !== historicalConfigs.metadata.totalConfigs
    }
    
    console.log('配置对比结果:', comparison)
    return comparison
  } catch (error) {
    console.error('配置对比失败:', error)
  }
}
```

## 📋 API参考

### 主要函数

- `collectAllConfigs()`: 采集所有系统配置
- `collectCompleteConfigs()`: 采集所有配置源
- `collectLocalStorageConfigs()`: 采集本地存储配置
- `collectApiConfigs()`: 采集API配置
- `validateConfigs(configs)`: 验证配置完整性
- `exportConfigsToJson(configs, filename)`: 导出配置到JSON文件

### 配置接口

- `ConfigCollectorResult`: 配置采集结果接口
- `StudioConfigs`: Studio端配置接口
- `AppConfigs`: APP端配置接口
- `ConfigMetadata`: 配置元数据接口

## ⚠️ 注意事项

1. **异步操作**: 所有采集函数都是异步的，需要使用`await`或`.then()`
2. **错误处理**: 建议使用try-catch包装所有采集操作
3. **配置验证**: 采集后建议验证配置的完整性
4. **文件导出**: 导出功能依赖浏览器环境
5. **API调用**: API配置采集需要后端服务可用

## 🔍 故障排除

### 常见问题

1. **配置采集失败**
   - 检查网络连接
   - 确认后端服务状态
   - 查看控制台错误信息

2. **配置验证失败**
   - 检查必需配置项是否存在
   - 确认配置格式是否正确

3. **文件导出失败**
   - 确认浏览器环境
   - 检查文件权限

### 调试技巧

```typescript
// 启用详细日志
console.log('🔍 开始配置采集...')

// 分步采集和验证
const systemConfigs = await collectAllConfigs()
console.log('系统配置采集完成:', systemConfigs.metadata.totalConfigs)

const localConfigs = collectLocalStorageConfigs()
console.log('本地配置采集完成:', Object.keys(localConfigs).length)

const apiConfigs = await collectApiConfigs()
console.log('API配置采集完成:', Object.keys(apiConfigs).length)
```

## 📚 相关文档

- [AINO系统架构设计文档](../文档/AINO-app架构设计文档.md)
- [页面配置与预览运行期配置清单](../../docs/页面配置与预览运行期配置清单.md)
- [卡片系统与模块对接方案](../文档/卡片系统与模块对接方案.md)
