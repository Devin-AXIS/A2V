# AINO-app

一个基于 Next.js 15 的现代化前端应用，专注于提供组件库展示、卡片化设计系统和多端适配能力。

## ✨ 核心特性

- **🎨 组件库展示**：完整的 UI 组件库和业务组件展示
- **🃏 卡片化设计**：统一的卡片系统，支持拖拽和主题定制
- **📱 多端适配**：移动端和 PC 端完全分离的布局系统
- **🎭 主题系统**：多层级主题管理，支持实时切换
- **🌍 国际化**：完整的多语言支持系统（中文/英文）
- **🔐 认证系统**：完整的移动端登录注册功能
- **🎯 业务场景**：覆盖教育、招聘、内容管理等多个领域

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- pnpm（推荐）或 npm

### 一键启动 (推荐)

**macOS/Linux 用户:**
```bash
# 克隆项目
git clone https://github.com/Devin-AXIS/AINO-APP.git
cd AINO-APP

# 运行一键启动脚本
chmod +x setup.sh
./setup.sh
```

**Windows 用户:**
```bash
# 克隆项目
git clone https://github.com/Devin-AXIS/AINO-APP.git
cd AINO-APP

# 手动安装依赖并启动
pnpm install
pnpm dev
```

### 手动启动

如果一键启动脚本遇到问题，可以手动执行以下步骤：

```bash
# 安装依赖
pnpm install
# 或使用 npm: npm install

# 启动开发服务器
pnpm dev
# 或使用 npm: npm run dev
```

应用将在 [http://localhost:3002](http://localhost:3002) 启动。

### 构建生产版本

```bash
# 构建
pnpm build

# 启动生产服务器
pnpm start
```

## 📁 项目结构

```
AINO-app/
├── app/                    # Next.js App Router 页面
│   ├── [locale]/          # 国际化路由
│   │   ├── auth/          # 认证页面
│   │   ├── components/    # 组件展示页面
│   │   ├── demo/          # 演示页面
│   │   └── ...
│   ├── globals.css        # 全局样式
│   └── layout.tsx         # 根布局
├── components/            # 组件库
│   ├── ui/               # 基础 UI 组件
│   ├── card/             # 卡片组件
│   ├── auth/             # 认证组件
│   ├── layout/           # 布局组件
│   └── ...
├── config/               # 配置文件
│   ├── design-tokens.ts  # 设计令牌
│   ├── component-style-config.ts # 组件样式配置
│   └── ...
├── lib/                  # 工具库
│   ├── utils.ts          # 通用工具
│   ├── design-tokens-manager.ts # 设计令牌管理
│   └── ...
├── hooks/                # 自定义 Hooks
├── types/                # TypeScript 类型定义
└── public/               # 静态资源
```

## 🎨 设计系统

### 设计令牌系统

项目采用三层设计令牌架构：

1. **Foundation Layer**：基础颜色、字体、间距、圆角
2. **Semantic Layer**：语义令牌，如 `surface.default`、`text.primary`
3. **Component Layer**：组件变体和尺寸配置

### 约束系统

- **统一设计约束**：确保所有组件遵循统一设计规范
- **卡片布局约束**：拖拽功能的布局验证
- **配置验证系统**：配置策略和规则引擎

## 🃏 卡片系统

### 卡片类型

- **业务卡片**：课程卡片、职位卡片、产品卡片等
- **数据展示卡片**：图表卡片、统计卡片等
- **交互卡片**：表单卡片、操作卡片等

### 拖拽功能

- **网格布局**：基于网格的拖拽排序
- **自由布局**：自由拖拽和调整大小
- **约束验证**：自动验证拖拽操作的合法性

## 🔐 认证系统

### 功能特性

- **多种登录方式**：手机验证码登录、密码登录
- **完整注册流程**：多步骤注册，包含验证码验证
- **状态管理**：全局认证状态，支持本地存储
- **用户界面**：统一的认证组件和交互体验

### 使用方式

```typescript
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }
  
  return <UserDashboard user={user} onLogout={logout} />
}
```

## 🌍 国际化

支持中文和英文两种语言，使用自定义国际化系统。

### 添加新语言

1. 在 `app/locales/` 目录下添加新的语言文件
2. 在 `lib/dictionaries.ts` 中配置语言映射
3. 更新 `config/i18n.config.ts` 配置

## 🎭 主题系统

### 主题类型

- **Light Theme**：明亮主题
- **Dark Theme**：暗色主题
- **Minimal Theme**：极简主题
- **Custom Themes**：自定义主题

### 主题配置

```typescript
import { useUnifiedConfig } from '@/hooks/use-unified-config'

function ThemeSelector() {
  const config = useUnifiedConfig()
  
  const changeTheme = (themeName: string) => {
    config.designTokens.set(themePresets[themeName])
  }
  
  return (
    <select onChange={(e) => changeTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="minimal">Minimal</option>
    </select>
  )
}
```

## 🛠️ 开发指南

### 组件开发规范

1. **使用统一组件**：优先使用 `components/ui/` 中的基础组件
2. **遵循设计系统**：使用设计令牌而非硬编码样式
3. **卡片容器**：内容必须通过 `AppCard` 容器承载
4. **约束检查**：开发时自动进行设计约束验证

### 添加新组件

```typescript
// 1. 在 components/ui/ 中创建基础组件
export function MyComponent({ className, ...props }) {
  return (
    <div className={cn("base-styles", className)} {...props} />
  )
}

// 2. 在 components/card/business-cards/ 中创建业务卡片
export function MyBusinessCard({ data, onAction }) {
  return (
    <AppCard>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.content}
      </CardContent>
      <CardFooter>
        <Button onClick={onAction}>操作</Button>
      </CardFooter>
    </AppCard>
  )
}
```

### 添加新页面

```typescript
// 在 app/[locale]/ 目录下创建页面
export default function MyPage() {
  return (
    <div>
      <h1>我的页面</h1>
      <MyBusinessCard data={data} onAction={handleAction} />
    </div>
  )
}
```

## 📊 性能优化

### 已实现的优化

- **代码分割**：按路由和组件进行代码分割
- **懒加载**：组件和页面的懒加载
- **图片优化**：Next.js 图片优化
- **缓存策略**：合理的缓存配置

### 监控工具

- **Bundle Analyzer**：分析打包体积
- **性能监控**：拖拽操作性能监控
- **约束违规统计**：设计约束违规统计

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行类型检查
pnpm type-check

# 运行代码检查
pnpm lint
```

## 📚 文档

- [设计系统与约束系统架构文档](./设计系统与约束系统架构文档.md)
- [AINO-app架构设计文档](./文档/AINO-app架构设计文档.md)
- [组件使用指南](./文档/AINO-app组件使用指南.md)
- [开发约束文档](./文档/开发约束文档.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 启动后页面空白或内容不显示？

A: 请使用一键启动脚本解决：
```bash
# 运行一键启动脚本（推荐）
./setup.sh
```

如果仍有问题，请检查以下几点：
1. 确保已安装所有依赖：`pnpm install`
2. 检查 Node.js 版本是否 >= 18.0
3. 清除缓存后重新安装：`rm -rf node_modules pnpm-lock.yaml && pnpm install`
4. 检查端口 3002 是否被占用

### Q: 启动脚本执行失败？

A: 请确保：
1. 脚本有执行权限：`chmod +x setup.sh`
2. 在项目根目录运行脚本
3. 已安装 Node.js 18.0 或更高版本

### Q: 拖拽功能不工作？

A: 请确保：
1. 页面处于编辑模式
2. 组件支持拖拽功能
3. 浏览器支持现代 JavaScript 特性

### Q: 主题切换不生效？

A: 请检查：
1. 主题配置是否正确
2. CSS 变量是否正确定义
3. 组件是否使用了设计令牌

### Q: 认证功能异常？

A: 请确认：
1. 认证状态是否正确初始化
2. 本地存储是否可用
3. 路由配置是否正确

## 📞 支持

如果您遇到问题或有任何建议，请：

1. 查看 [Issues](https://github.com/Devin-AXIS/AINO-APP/issues) 页面
2. 创建新的 Issue 描述问题
3. 联系维护者

---

**AINO-app** - 让设计系统更简单，让开发更高效！ 🚀
