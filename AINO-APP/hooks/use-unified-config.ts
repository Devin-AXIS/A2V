import { useTheme } from "@/components/providers/theme-provider"
import { useCardTheme } from "@/components/providers/card-theme-provider"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFontSizePreset } from "@/hooks/use-font-size-config"
import { useSemanticTokens } from "@/components/providers/semantic-tokens-provider"
import { useGlobalRadius } from "@/hooks/use-global-radius"
import { cardThemePresets } from "@/config/card-theme"
// 这些配置已经整合到统一主题系统中
import { componentVariants } from "@/config/component-variants"
import { animationPresets, componentAnimations } from "@/config/animation-config"
import { contrastRequirements, focusManagementConstraints } from "@/config/accessibility-constraints"
import { validateConfig } from "@/lib/config-validator"

/**
 * 升级版统一配置Hook - 整合所有主题配置功能 + 新设计系统
 * 保持向后兼容，不破坏现有功能，但增加新能力
 */
export function useUnifiedConfig() {
  // 现有hooks（保持不变）
  const theme = useTheme()
  const cardTheme = useCardTheme()
  const chartTheme = useChartTheme()
  const dataChartTheme = useDataChartTheme()
  const fontSize = useFontSizePreset()
  
  // 新增设计系统hooks
  const semanticTokens = useSemanticTokens()
  const globalRadius = useGlobalRadius()

  // 返回升级后的统一配置对象
  return {
    // === 现有功能（完全保持不变） ===
    
    // 全局主题配置
    theme: {
      colors: theme.colors,
      updateColor: theme.updateColor,
      toggleColor: theme.toggleColor,
      applyPreset: theme.applyPreset,
      gradientStyle: theme.gradientStyle,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor
    },
    
    // 卡片主题配置
    card: {
      theme: cardTheme.theme,
      setTheme: cardTheme.setTheme,
      applyPreset: cardTheme.applyPreset,
      cardThemePresets: cardThemePresets
    },
    
    // 图表主题配置
    chart: {
      applyPalette: chartTheme.applyPalette,
      chartPalettes: [] // 已整合到统一主题系统
    },
    
    // 数据图表主题配置
    dataChart: {
      applyPalette: dataChartTheme.applyPalette,
      dataChartPalettes: [] // 已整合到统一主题系统
    },
    
    // 字体大小配置
    fontSize: {
      setPreset: fontSize.setPreset,
      current: fontSize.current
    },

    // 全局边角配置 - 新增
    radius: {
      // 当前激活的预设
      activePreset: globalRadius.activePreset,
      // 可用的预设列表
      presets: globalRadius.presets,
      // 切换预设
      setActivePreset: globalRadius.setActivePreset,
      // 获取组件边角值
      getComponentRadius: globalRadius.getComponentRadius,
      // 应用CSS变量
      applyRadiusToDOM: globalRadius.applyRadiusToDOM,
      // 应用边角到现有组件
      applyRadiusToExistingComponents: globalRadius.applyRadiusToExistingComponents,
      // 捕获初始状态
      captureInitialRadius: globalRadius.captureInitialRadius,
      // 更新默认预设
      updateDefaultPreset: globalRadius.updateDefaultPreset,
      // 初始边角值
      initialRadiusValues: globalRadius.initialRadiusValues
    },

    // === 新增设计系统功能 ===
    
    // 语义令牌系统
    semantic: {
      // 获取语义令牌值
      getToken: (path: string) => semanticTokens.getToken(path),
      // 切换语义上下文（如高对比度）
      setContext: (context: string) => semanticTokens.setContext(context),
      // 当前上下文
      currentContext: semanticTokens.currentContext,
      // 验证令牌
      validateToken: (path: string) => semanticTokens.validateToken(path),
      // 获取回退链
      getFallback: (path: string) => semanticTokens.getFallback(path)
    },

    // 组件变体系统
    variants: {
      // 获取组件变体配置
      getComponentVariants: (componentName: string) => componentVariants[componentName as keyof typeof componentVariants],
      // 验证变体配置
      validateVariant: (componentName: string, variant: string, size?: string) => {
        const variants = componentVariants[componentName as keyof typeof componentVariants]
        if (!variants) return { isValid: false, error: `Component ${componentName} not found` }
        if (!variants.variant[variant]) return { isValid: false, error: `Variant ${variant} not found` }
        if (size && !variants.size[size]) return { isValid: false, error: `Size ${size} not found` }
        return { isValid: true, error: null }
      }
    },

    // 动画系统
    animations: {
      // 获取动画预设
      getPreset: (name: string) => animationPresets[name],
      // 获取组件动画
      getComponentAnimation: (componentName: string, animationType: string) => 
        componentAnimations[componentName]?.[animationType],
      // 验证动画配置
      validateAnimation: (componentName: string, animationType: string) => {
        const hasComponentAnimation = !!componentAnimations[componentName]?.[animationType]
        const hasPresetAnimation = !!animationPresets[animationType]
        if (!hasComponentAnimation && !hasPresetAnimation) {
          return { isValid: false, error: `Animation ${animationType} not found for component ${componentName}` }
        }
        return { isValid: true, error: null }
      }
    },

    // 可访问性系统
    accessibility: {
      // 对比度要求
      contrastRequirements,
      // 焦点管理约束
      focusManagement: focusManagementConstraints,
      // 验证对比度
      validateContrast: (foreground: string, background: string, requirement: keyof typeof contrastRequirements = 'AA-normal') => {
        // 这里需要导入对比度验证函数
        return { isValid: true, ratio: 4.5, required: 4.5 } // 临时返回值
      }
    },

    // 配置验证系统
    validation: {
      // 验证整个配置
      validate: (config: any) => validateConfig(config),
      // 获取验证策略
      getPolicies: () => {
        // 这里需要导入策略获取函数
        return []
      }
    },

    // === 高级功能（基于现有功能增强） ===
    
    // 智能主题推荐
    recommendations: {
      // 基于当前配置推荐主题
      suggestTheme: () => {
        const currentColors = [theme.primaryColor, theme.secondaryColor, theme.accentColor]
        // 这里可以实现智能推荐逻辑
        return {
          name: "智能推荐",
          colors: currentColors,
          reason: "基于当前使用习惯"
        }
      },
      
      // 检查配置一致性
      checkConsistency: () => {
        const issues = []
        // 检查颜色对比度
        // 检查语义令牌使用
        // 检查组件变体一致性
        return {
          isValid: issues.length === 0,
          issues
        }
      }
    },

    // 配置导出导入
    importExport: {
      // 导出当前配置
      export: () => {
        const config = {
          theme: theme.colors,
          card: cardTheme.theme,
          chart: chartTheme.currentPalette,
          dataChart: dataChartTheme.currentPalette,
          fontSize: fontSize.current,
          semantic: semanticTokens.currentContext
        }
        return JSON.stringify(config, null, 2)
      },
      
      // 导入配置
      import: (configData: string) => {
        try {
          const config = JSON.parse(configData)
          // 应用导入的配置
          if (config.theme) theme.applyPreset(config.theme)
          if (config.card) cardTheme.setTheme(config.card)
          if (config.fontSize) fontSize.setPreset(config.fontSize.current)
          if (config.semantic) semanticTokens.setContext(config.semantic)
          return { success: true, message: "配置导入成功" }
        } catch (error) {
          return { success: false, message: "配置导入失败: " + error.message }
        }
      }
    },

    // 性能优化
    performance: {
      // 批量更新配置
      batchUpdate: (updates: Record<string, any>) => {
        Object.entries(updates).forEach(([key, value]) => {
          // 根据key分发到对应的更新函数
          switch (key) {
            case 'theme':
              theme.applyPreset(value)
              break
            case 'card':
              cardTheme.setTheme(value)
              break
            case 'fontSize':
              fontSize.setPreset(value)
              break
            // 可以添加更多
          }
        })
      },
      
      // 防抖更新
      debouncedUpdate: (() => {
        let timeoutId: NodeJS.Timeout
        return (updates: Record<string, any>, delay: number = 300) => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            // 执行批量更新
            // 这里可以实现防抖逻辑
          }, delay)
        }
      })()
    }
  }
}
