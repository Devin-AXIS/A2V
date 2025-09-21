# 设备类型系统使用指南

## 概述

设备类型系统为卡片和组件提供了设备类型属性，支持三种类型：
- **通用 (universal)**: 适用于所有设备
- **移动端 (mobile)**: 专为移动设备优化
- **PC端 (pc)**: 专为桌面设备设计

## 核心功能

### 1. 设备类型定义

```typescript
export type DeviceType = 'universal' | 'mobile' | 'pc'
```

### 2. 基础属性扩展

所有基础组件和卡片都支持 `deviceType` 属性：

```typescript
interface BaseProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  deviceType?: DeviceType // 新增设备类型属性
}
```

## 使用方法

### 1. 卡片使用

#### 基础卡片
```tsx
<CardFactory
  id="my-card"
  type="custom"
  deviceType="mobile" // 指定为移动端专用
>
  <div>移动端专用内容</div>
</CardFactory>
```

#### 业务卡片
```tsx
<CourseCard
  data={courseData}
  deviceType="universal" // 通用卡片
  onAction={handleAction}
/>
```

### 2. 组件使用

```tsx
<Button
  deviceType="pc" // PC端专用按钮
  variant="primary"
  onClick={handleClick}
>
  PC端按钮
</Button>
```

### 3. 设备类型检测

```typescript
import { detectCurrentDeviceType, isDeviceCompatible } from '@/lib/device-utils'

// 检测当前设备类型
const currentDevice = detectCurrentDeviceType()

// 检查组件是否兼容当前设备
const isCompatible = isDeviceCompatible('mobile', currentDevice)
```

### 4. 设备类型过滤

```tsx
import { DeviceTypeFilter } from '@/components/ui/device-type-filter'

<DeviceTypeFilter
  items={cardList}
  onFilteredItemsChange={setFilteredCards}
  showCurrentDevice={true}
  showCount={true}
/>
```

### 5. 设备类型徽章

```tsx
import { DeviceTypeBadge } from '@/components/ui/device-type-badge'

<DeviceTypeBadge deviceType="mobile" size="sm" showIcon={true} />
```

## 新增的专用卡片

### 1. 移动端导航卡片 (MobileNavigationCard)

专为移动端设计的导航卡片，包含：
- 触摸友好的大按钮
- 快速操作区域
- 移动端优化的布局

```tsx
<MobileNavigationCard
  data={{
    title: "导航菜单",
    items: navigationItems,
    showQuickActions: true
  }}
  deviceType="mobile"
  onAction={handleAction}
/>
```

### 2. PC端工具栏卡片 (PCToolbarCard)

专为PC端设计的工具栏卡片，包含：
- 键盘快捷键支持
- 鼠标悬停效果
- 分组工具项
- 折叠/展开功能

```tsx
<PCToolbarCard
  data={{
    title: "编辑工具栏",
    items: toolbarItems,
    showShortcuts: true,
    isCollapsed: false
  }}
  deviceType="pc"
  onAction={handleAction}
/>
```

### 3. 通用信息卡片 (UniversalInfoCard)

跨平台的信息展示卡片，包含：
- 响应式布局
- 数据格式化
- 趋势指示器
- 操作按钮

```tsx
<UniversalInfoCard
  data={{
    title: "数据概览",
    description: "系统关键指标",
    items: infoItems,
    showActions: true
  }}
  deviceType="universal"
  onAction={handleAction}
/>
```

## 工具函数

### 设备类型检测
```typescript
// 检测当前设备类型
detectCurrentDeviceType(): DeviceType

// 检查设备兼容性
isDeviceCompatible(componentDeviceType: DeviceType, currentDeviceType: DeviceType): boolean

// 过滤组件列表
filterComponentsByDevice<T>(components: T[], deviceType: DeviceType): T[]
```

### 设备类型标签和图标
```typescript
// 获取设备类型标签
getDeviceTypeLabel(deviceType: DeviceType): string

// 获取设备类型图标
getDeviceTypeIcon(deviceType: DeviceType): string

// 创建设备类型徽章数据
createDeviceTypeBadge(deviceType: DeviceType)
```

## 演示页面

访问 `/device-type-demo` 页面查看完整的设备类型系统演示，包括：
- 设备类型说明
- 卡片过滤演示
- 组件类型演示
- 实际卡片工厂演示

## 最佳实践

### 1. 设备类型选择
- **通用 (universal)**: 适用于所有设备的基础功能
- **移动端 (mobile)**: 需要触摸优化或移动端特有功能
- **PC端 (pc)**: 需要鼠标交互或键盘快捷键

### 2. 组件设计
- 移动端组件：更大的触摸区域，简化的交互
- PC端组件：支持悬停效果，键盘导航
- 通用组件：响应式设计，适配所有设备

### 3. 性能优化
- 使用设备类型过滤减少不必要的渲染
- 根据设备类型加载相应的资源
- 利用设备特性优化用户体验

## 扩展性

系统设计为可扩展的，未来可以轻松添加新的设备类型：
- 平板 (tablet)
- 智能电视 (tv)
- 可穿戴设备 (wearable)

只需在 `DeviceType` 类型中添加新类型，并更新相关的工具函数即可。
