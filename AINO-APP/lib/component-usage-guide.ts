// 组件使用规范指南
// 帮助开发者选择正确的公用组件，避免重复开发

import { cn } from "@/lib/utils"

// 标准UI组件库（优先使用）
export const STANDARD_UI_COMPONENTS = {
  // 基础组件
  button: {
    path: "@/components/ui/button",
    description: "标准按钮组件，支持多种变体和尺寸",
    variants: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    sizes: ["default", "sm", "lg", "icon"]
  },
  input: {
    path: "@/components/ui/input",
    description: "标准输入框组件，基础文本输入",
    variants: ["default"],
    sizes: ["default"]
  },
  select: {
    path: "@/components/ui/select",
    description: "标准选择器组件，下拉选择",
    variants: ["default"],
    sizes: ["default"]
  },
  checkbox: {
    path: "@/components/ui/checkbox",
    description: "标准复选框组件",
    variants: ["default"],
    sizes: ["default"]
  },
  radio: {
    path: "@/components/ui/radio-group",
    description: "标准单选框组件组",
    variants: ["default"],
    sizes: ["default"]
  },
  switch: {
    path: "@/components/ui/switch",
    description: "标准开关组件",
    variants: ["default"],
    sizes: ["default"]
  },
  textarea: {
    path: "@/components/ui/textarea",
    description: "标准文本域组件",
    variants: ["default"],
    sizes: ["default"]
  },
  label: {
    path: "@/components/ui/label",
    description: "标准标签组件",
    variants: ["default"],
    sizes: ["default"]
  },
  
  // 布局组件
  card: {
    path: "@/components/ui/card",
    description: "标准卡片容器组件",
    variants: ["default"],
    sizes: ["default"]
  },
  separator: {
    path: "@/components/ui/separator",
    description: "标准分隔线组件",
    variants: ["default"],
    sizes: ["default"]
  },
  aspectRatio: {
    path: "@/components/ui/aspect-ratio",
    description: "标准宽高比组件",
    variants: ["default"],
    sizes: ["default"]
  },
  
  // 反馈组件
  alert: {
    path: "@/components/ui/alert",
    description: "标准警告提示组件",
    variants: ["default", "destructive"],
    sizes: ["default"]
  },
  toast: {
    path: "@/components/ui/toast",
    description: "标准消息提示组件",
    variants: ["default", "destructive", "success"],
    sizes: ["default"]
  },
  dialog: {
    path: "@/components/ui/dialog",
    description: "标准对话框组件",
    variants: ["default"],
    sizes: ["default"]
  },
  sheet: {
    path: "@/components/ui/sheet",
    description: "标准侧边抽屉组件",
    variants: ["default"],
    sizes: ["default"]
  },
  popover: {
    path: "@/components/ui/popover",
    description: "标准弹出框组件",
    variants: ["default"],
    sizes: ["default"]
  },
  tooltip: {
    path: "@/components/ui/tooltip",
    description: "标准工具提示组件",
    variants: ["default"],
    sizes: ["default"]
  },
  
  // 导航组件
  tabs: {
    path: "@/components/ui/tabs",
    description: "标准标签页组件",
    variants: ["default"],
    sizes: ["default"]
  },
  accordion: {
    path: "@/components/ui/accordion",
    description: "标准手风琴组件",
    variants: ["default"],
    sizes: ["default"]
  },
  breadcrumb: {
    path: "@/components/ui/breadcrumb",
    description: "标准面包屑导航组件",
    variants: ["default"],
    sizes: ["default"]
  },
  pagination: {
    path: "@/components/ui/pagination",
    description: "标准分页组件",
    variants: ["default"],
    sizes: ["default"]
  },
  
  // 数据展示组件
  table: {
    path: "@/components/ui/table",
    description: "标准表格组件",
    variants: ["default"],
    sizes: ["default"]
  },
  badge: {
    path: "@/components/ui/badge",
    description: "标准徽章组件",
    variants: ["default", "secondary", "destructive", "outline"],
    sizes: ["default"]
  },
  avatar: {
    path: "@/components/ui/avatar",
    description: "标准头像组件",
    variants: ["default"],
    sizes: ["default", "sm", "lg"]
  },
  progress: {
    path: "@/components/ui/progress",
    description: "标准进度条组件",
    variants: ["default"],
    sizes: ["default"]
  },
  skeleton: {
    path: "@/components/ui/skeleton",
    description: "标准骨架屏组件",
    variants: ["default"],
    sizes: ["default"]
  }
} as const

// 自定义组件（特殊需求时使用）
export const CUSTOM_COMPONENTS = {
  // 特殊按钮
  pillButton: {
    path: "@/components/basic/pill-button",
    description: "胶囊形状按钮，支持毛玻璃效果和主题色",
    useWhen: "需要胶囊形状、毛玻璃效果或主题色按钮时",
    alternatives: ["@/components/ui/button (使用rounded-full类名)"]
  },
  floatingButton: {
    path: "@/components/basic/floating-button",
    description: "浮动按钮，支持图标和特殊定位",
    useWhen: "需要浮动定位或特殊图标按钮时",
    alternatives: ["@/components/ui/button (使用fixed定位)"]
  },
  
  // 特殊输入
  textInput: {
    path: "@/components/input/text-input",
    description: "带标签的文本输入框，支持毛玻璃效果",
    useWhen: "需要带标签、毛玻璃效果或特殊样式时",
    alternatives: ["@/components/ui/input + @/components/ui/label"]
  }
} as const

// 组件选择指南
export class ComponentUsageGuide {
  // 获取组件推荐
  static getComponentRecommendation(componentType: string, requirements: string[] = []): {
    recommended: string
    reason: string
    alternatives: string[]
  } {
    const standard = STANDARD_UI_COMPONENTS[componentType as keyof typeof STANDARD_UI_COMPONENTS]
    const custom = CUSTOM_COMPONENTS[componentType as keyof typeof CUSTOM_COMPONENTS]
    
    if (standard) {
      return {
        recommended: standard.path,
        reason: "标准UI组件，设计一致，功能完整",
        alternatives: custom ? [custom.path] : []
      }
    }
    
    if (custom) {
      return {
        recommended: custom.path,
        reason: custom.useWhen,
        alternatives: custom.alternatives
      }
    }
    
    return {
      recommended: "需要开发新组件",
      reason: "未找到合适的现有组件",
      alternatives: []
    }
  }
  
  // 检查组件使用规范
  static checkComponentUsage(componentPath: string, context: string): {
    isStandard: boolean
    recommendation: string
    warning?: string
  } {
    const isStandard = Object.values(STANDARD_UI_COMPONENTS).some(comp => comp.path === componentPath)
    const isCustom = Object.values(CUSTOM_COMPONENTS).some(comp => comp.path === componentPath)
    
    if (isStandard) {
      return {
        isStandard: true,
        recommendation: "✅ 使用了标准UI组件，符合规范"
      }
    }
    
    if (isCustom) {
      return {
        isStandard: false,
        recommendation: "⚠️ 使用了自定义组件，确保这是必要的选择"
      }
    }
    
    return {
      isStandard: false,
      recommendation: "❌ 使用了未规范的组件，建议检查是否有合适的标准组件",
      warning: `在 ${context} 中使用了 ${componentPath}，请考虑使用标准UI组件`
    }
  }
  
  // 生成组件使用报告
  static generateUsageReport(componentUsages: Array<{path: string, context: string}>): string {
    const report = {
      standard: 0,
      custom: 0,
      unknown: 0,
      violations: [] as string[]
    }
    
    componentUsages.forEach(({path, context}) => {
      const check = this.checkComponentUsage(path, context)
      if (check.isStandard) {
        report.standard++
      } else if (Object.values(CUSTOM_COMPONENTS).some(comp => comp.path === path)) {
        report.custom++
      } else {
        report.unknown++
        if (check.warning) {
          report.violations.push(check.warning)
        }
      }
    })
    
    let reportText = `# 组件使用规范报告\n\n`
    reportText += `**标准UI组件使用**: ${report.standard} 次 ✅\n`
    reportText += `**自定义组件使用**: ${report.custom} 次 ⚠️\n`
    reportText += `**未规范组件使用**: ${report.unknown} 次 ❌\n\n`
    
    if (report.violations.length > 0) {
      reportText += `### 规范违规:\n`
      report.violations.forEach(violation => {
        reportText += `- ${violation}\n`
      })
    }
    
    return reportText
  }
  
  // 获取所有可用组件
  static getAllAvailableComponents(): Record<string, any> {
    return {
      standard: STANDARD_UI_COMPONENTS,
      custom: CUSTOM_COMPONENTS
    }
  }
}

// 便捷函数
export function getComponentRecommendation(type: string, requirements: string[] = []) {
  return ComponentUsageGuide.getComponentRecommendation(type, requirements)
}

export function checkComponentUsage(path: string, context: string) {
  return ComponentUsageGuide.checkComponentUsage(path, context)
}

export function generateUsageReport(usages: Array<{path: string, context: string}>) {
  return ComponentUsageGuide.generateUsageReport(usages)
}
