# 动态模块 API 与前端对接完整方案（增强版）

## 1. 背景与目标

现代企业应用要求高度灵活，用户可自由定义字段和模块，快速满足不同业务需求。传统开发模式中，每次字段变化都需要开发和部署，成本高、效率低。本方案旨在：

- 支持用户**自定义字段**和模块结构动态变化。
- 提供自动化的 API 生成机制，无需手工开发接口。
- 前端通过 Schema 驱动渲染，降低字段变化带来的维护成本。
- 确保 API 稳定性、扩展性与性能，支持企业级应用。

---

## 2. 系统架构设计理念

| 层级        | 功能                     | 特点              |
| --------- | ---------------------- | --------------- |
| **核心数据层** | 固定基础字段：id、tenantId、时间戳 | 不随用户变化，保证接口稳定   |
| **动态字段层** | 自定义字段存 JSONB/JSON      | 高度灵活，支持无限制字段扩展  |
| **元数据层**  | 存字段定义、关系、索引等元数据        | Schema 驱动前后端    |
| **API 层** | 通用 CRUD、查询、批量接口        | 动态模块统一协议，无需重新开发 |
| **前端适配层** | Schema 驱动渲染器           | 无需写死字段，支持热更新    |

**特点：**

- “稳定核 + 动态层”设计，保证接口协议不变。
- Schema 是单一真相源，集中管理字段定义、权限、视图配置。

---

## 3. 后端 API 设计与用法

### 3.1 模块管理

- `GET /modules`：获取所有模块。
- `GET /modules/:moduleKey/schema`：返回模块 Schema（字段、索引、关系、校验规则）。
- `GET /modules/:moduleKey/views`：返回模块默认视图配置。

### 3.2 CRUD API

- `GET /records?moduleKey=jobs`：查询记录。
- `POST /records`：新增记录。
- `PATCH /records/:id`：修改记录。
- `DELETE /records/:id`：删除记录。

示例：

```json
POST /records
{
  "moduleKey": "jobs",
  "data": {
    "core": { "tenantId": "t1" },
    "props": {
      "title": "Frontend Engineer",
      "city": "Shanghai",
      "experience": { "years": 3 }
    }
  }
}
```

### 3.3 查询协议

```json
{
  "and": [
    { "path": "props.city", "op": "eq", "value": "Shanghai" },
    { "path": "props.experience.years", "op": ">=", "value": 3 }
  ]
}
```

### 3.4 Schema 示例

```json
{
  "moduleKey": "jobs",
  "schemaVersion": "1.2.0",
  "fields": [
    {
      "key": "title",
      "label": "职位",
      "type": "text",
      "required": true,
      "ui": { "widget": "Input" }
    },
    {
      "key": "city",
      "label": "城市",
      "type": "select",
      "options": ["北京","上海","深圳"]
    },
    {
      "key": "experience",
      "label": "经验",
      "type": "object",
      "schema": [
        { "key": "years", "type": "number" }
      ]
    }
  ]
}
```

---

## 4. 前端适配方案

### 4.1 Schema 驱动渲染器

- **FormRenderer**：表单控件动态渲染。
- **ListRenderer**：表格/卡片布局动态渲染。
- **FilterBuilder**：自动生成筛选器。

示例：

```tsx
<FormRenderer schema={jobSchema} value={record.props} onChange={setProps} />
```

### 4.2 缓存与热更新机制

- 首次加载缓存 Schema。
- 每个 API 响应携带 `X-Schema-Version`。
- 当版本不一致时自动拉取最新 Schema 并热更新渲染器。

---

## 5. 动态字段策略

| 场景     | 策略                            |
| ------ | ----------------------------- |
| 字段频繁变化 | 字段 `key` 稳定，`label` 可变，避免破坏兼容 |
| 查询性能   | 热字段标记 `index: true` 自动建索引或物化列 |
| 字段删除   | 字段进入 `deprecated` 状态，前端显示提示   |
| 回滚/审计  | 所有 Schema 变更版本化，支持回退          |

---

## 6. 联表与引用字段

- 通过 `relation` 声明模块关系：

```json
{
  "key": "customer",
  "type": "relation",
  "relation": {
    "targetModule": "customers",
    "displayField": "name"
  }
}
```

- 查询示例：

```
GET /records?moduleKey=orders&include=customer(name,level)
```

---

## 7. 产品视角

- 用户无需理解数据库表结构，只需界面配置字段和模块。
- 新增字段即时生效，表单、列表自动更新。
- 新业务模块无需开发新 API，快速上线。

---

## 8. 技术视角

- 核心字段表固定，动态字段 JSONB 存储。
- Schema 作为单一真相源，驱动前后端逻辑。
- 统一 API 协议，减少耦合。
- 缓存 + schemaVersion 检测实现热更新。

---

## 9. 扩展计划

- 自动生成 SDK：通过 OpenAPI 自动生成类型文件和 API SDK。
- 组件库沉淀：丰富控件类型，支持复杂业务表单。
- 高级特性：公式字段、聚合统计、字段级权限策略。

---

## 10. 架构图（建议）

```
用户配置 → Schema 存储 → 动态 API → 前端渲染器 → 实时业务场景
```

---

### 📌 总结

该方案保证了灵活性和稳定性：

- 字段完全可自定义，但接口协议不变。
- 前端通过 Schema 渲染器实现自动适配，无需频繁改代码。
- 技术架构支持快速迭代与扩展，是适合 SaaS/低代码/企业平台的通用方案。

