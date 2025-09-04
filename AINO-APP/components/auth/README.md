# 移动端认证系统

完整的移动端登录注册功能，采用现代化设计风格，支持毛玻璃效果、柔和阴影、磨砂质感等视觉效果。

## 功能特性

### 🎨 设计特色
- **毛玻璃效果**: 使用 `backdrop-filter` 实现磨砂质感
- **柔和阴影**: 多层次阴影效果，营造深度感
- **背景模糊**: 动态背景模糊效果
- **渐变背景**: 多种渐变色彩方案
- **动画效果**: 流畅的过渡动画和交互反馈

### 📱 移动端优化
- 响应式设计，完美适配移动设备
- 触摸友好的交互体验
- 优化的输入体验（数字键盘、自动聚焦等）
- 流畅的页面切换动画

### 🔐 认证功能
- **手机号登录**: 支持验证码登录
- **密码登录**: 传统密码登录方式
- **手机号注册**: 分步注册流程
- **验证码验证**: 6位数字验证码输入
- **表单验证**: 实时输入验证和错误提示

## 组件结构

```
components/auth/
├── index.ts                    # 组件导出文件
├── mobile-login.tsx           # 移动端登录组件
├── mobile-register.tsx        # 移动端注册组件
├── phone-input.tsx            # 手机号输入组件
├── verification-code-input.tsx # 验证码输入组件
├── glass-background.tsx       # 毛玻璃背景组件
└── README.md                  # 说明文档
```

## 使用方法

### 1. 基本使用

```tsx
import { MobileLogin, MobileRegister } from '@/components/auth'

// 登录页面
function LoginPage() {
  const handleLogin = (data) => {
    console.log('登录数据:', data)
    // 处理登录逻辑
  }

  return (
    <MobileLogin
      onLogin={handleLogin}
      onRegister={() => router.push('/register')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  )
}

// 注册页面
function RegisterPage() {
  const handleRegister = (data) => {
    console.log('注册数据:', data)
    // 处理注册逻辑
  }

  return (
    <MobileRegister
      onRegister={handleRegister}
      onLogin={() => router.push('/login')}
    />
  )
}
```

### 2. 单独使用组件

```tsx
import { PhoneInput, VerificationCodeInput, GlassBackground } from '@/components/auth'

function CustomAuthForm() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')

  return (
    <GlassBackground>
      <PhoneInput
        value={phone}
        onChange={setPhone}
        placeholder="请输入手机号"
      />
      <VerificationCodeInput
        value={code}
        onChange={setCode}
        onComplete={(code) => console.log('验证码完成:', code)}
      />
    </GlassBackground>
  )
}
```

## 组件API

### MobileLogin

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| onLogin | `(data: LoginData) => void` | - | 登录成功回调 |
| onRegister | `() => void` | - | 跳转注册页面回调 |
| onForgotPassword | `() => void` | - | 忘记密码回调 |
| className | `string` | - | 自定义样式类名 |

### MobileRegister

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| onRegister | `(data: RegisterData) => void` | - | 注册成功回调 |
| onLogin | `() => void` | - | 跳转登录页面回调 |
| className | `string` | - | 自定义样式类名 |

### PhoneInput

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| value | `string` | - | 手机号值 |
| onChange | `(value: string) => void` | - | 值变化回调 |
| onValidate | `(isValid: boolean) => void` | - | 验证状态回调 |
| placeholder | `string` | "请输入手机号" | 占位符文本 |
| disabled | `boolean` | false | 是否禁用 |
| error | `string` | - | 错误信息 |
| success | `boolean` | false | 是否成功状态 |

### VerificationCodeInput

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| value | `string` | - | 验证码值 |
| onChange | `(value: string) => void` | - | 值变化回调 |
| onComplete | `(code: string) => void` | - | 完成输入回调 |
| length | `number` | 6 | 验证码长度 |
| disabled | `boolean` | false | 是否禁用 |
| error | `string` | - | 错误信息 |
| success | `boolean` | false | 是否成功状态 |
| autoFocus | `boolean` | true | 是否自动聚焦 |

## 数据格式

### LoginData
```typescript
interface LoginData {
  phone: string        // 手机号
  code?: string        // 验证码（验证码登录时）
  password?: string    // 密码（密码登录时）
}
```

### RegisterData
```typescript
interface RegisterData {
  phone: string           // 手机号
  countryCode: string     // 国家代码
  code: string           // 验证码
  password: string       // 密码
  confirmPassword: string // 确认密码
  agreeTerms: boolean    // 是否同意用户协议
}
```

## 样式定制

### CSS 变量
组件使用 CSS 变量进行样式定制，可以在全局样式中覆盖：

```css
:root {
  --primary-500: #3b82f6;     /* 主色调 */
  --secondary-500: #64748b;   /* 辅色调 */
  --success-500: #22c55e;     /* 成功色 */
  --error-500: #ef4444;       /* 错误色 */
}
```

### 自定义样式类
组件支持通过 `className` 属性添加自定义样式：

```tsx
<MobileLogin 
  className="custom-login-style"
  onLogin={handleLogin}
/>
```

## 国际化支持

组件支持中英文国际化，语言文件位于：
- `app/locales/zh.json` - 中文
- `app/locales/en.json` - 英文

### 添加新的语言
1. 在 `app/locales/` 目录下创建新的语言文件
2. 复制现有的 `auth` 配置结构
3. 翻译相应的文本内容

## 路由配置

### 页面路由
```
/auth/login     - 登录页面
/auth/register  - 注册页面
/auth-demo      - 演示页面
```

### 使用示例
```tsx
// 在 Next.js 中使用
import { useRouter } from 'next/navigation'

const router = useRouter()

// 跳转到登录页面
router.push('/auth/login')

// 跳转到注册页面
router.push('/auth/register')
```

## 最佳实践

### 1. 错误处理
```tsx
const handleLogin = async (data: LoginData) => {
  try {
    const response = await loginAPI(data)
    // 处理成功响应
  } catch (error) {
    // 处理错误
    console.error('登录失败:', error)
  }
}
```

### 2. 加载状态
```tsx
const [isLoading, setIsLoading] = useState(false)

const handleLogin = async (data: LoginData) => {
  setIsLoading(true)
  try {
    await loginAPI(data)
  } finally {
    setIsLoading(false)
  }
}
```

### 3. 表单验证
组件内置了基本的表单验证，建议在服务端也进行相应的验证：

```tsx
// 手机号验证
const phoneRegex = /^1[3-9]\d{9}$/

// 密码验证
const passwordMinLength = 6
```

## 浏览器兼容性

- Chrome 76+
- Firefox 72+
- Safari 13.1+
- Edge 79+

## 注意事项

1. **毛玻璃效果**: 需要现代浏览器支持 `backdrop-filter` 属性
2. **移动端优化**: 建议在移动设备上测试交互体验
3. **性能优化**: 大量动画效果可能影响低端设备性能
4. **无障碍访问**: 组件已考虑基本的无障碍访问支持

## 更新日志

### v1.0.0
- 初始版本发布
- 支持手机号登录和注册
- 实现毛玻璃效果和动画
- 添加国际化支持
- 完整的表单验证
