import { useCallback } from "react"
import { useComponentStyleConfig } from "@/components/providers/component-style-config-provider"

// 便捷的组件样式配置访问 Hook
export function useComponentStyleConfigValue(path: string) {
  const { getConfig, setConfig } = useComponentStyleConfig()
  
  const value = getConfig(path)
  const updateValue = useCallback((newValue: any) => {
    setConfig(path, newValue)
  }, [setConfig, path])

  return [value, updateValue] as const
}

// 按钮样式配置 Hook
export function useButtonStyle() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateButtonStyle = useCallback((updates: Partial<typeof config.button>) => {
    updateConfig({
      button: { ...config.button, ...updates }
    })
  }, [config.button, updateConfig])

  return [config.button, updateButtonStyle] as const
}

// 输入框样式配置 Hook
export function useInputStyle() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateInputStyle = useCallback((updates: Partial<typeof config.input>) => {
    updateConfig({
      input: { ...config.input, ...updates }
    })
  }, [config.input, updateConfig])

  return [config.input, updateInputStyle] as const
}

// 卡片样式配置 Hook
export function useCardStyle() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateCardStyle = useCallback((updates: Partial<typeof config.card>) => {
    updateConfig({
      card: { ...config.card, ...updates }
    })
  }, [config.card, updateConfig])

  return [config.card, updateCardStyle] as const
}

// 导航样式配置 Hook
export function useNavigationStyle() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateNavigationStyle = useCallback((updates: Partial<typeof config.navigation>) => {
    updateConfig({
      navigation: { ...config.navigation, ...updates }
    })
  }, [config.navigation, updateConfig])

  return [config.navigation, updateNavigationStyle] as const
}

// 标签样式配置 Hook
export function useTagStyle() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateTagStyle = useCallback((updates: Partial<typeof config.tag>) => {
    updateConfig({
      tag: { ...config.tag, ...updates }
    })
  }, [config.tag, updateConfig])

  return [config.tag, updateTagStyle] as const
}

// 按钮变体配置 Hook
export function useButtonVariants() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateButtonVariants = useCallback((updates: Partial<typeof config.button.variants>) => {
    updateConfig({
      button: {
        ...config.button,
        variants: { ...config.button.variants, ...updates }
      }
    })
  }, [config.button, updateConfig])

  return [config.button.variants, updateButtonVariants] as const
}

// 按钮尺寸配置 Hook
export function useButtonSizes() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateButtonSizes = useCallback((updates: Partial<typeof config.button.sizes>) => {
    updateConfig({
      button: {
        ...config.button,
        sizes: { ...config.button.sizes, ...updates }
      }
    })
  }, [config.button, updateConfig])

  return [config.button.sizes, updateButtonSizes] as const
}

// 输入框状态配置 Hook
export function useInputStates() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateInputStates = useCallback((updates: Partial<typeof config.input.states>) => {
    updateConfig({
      input: {
        ...config.input,
        states: { ...config.input.states, ...updates }
      }
    })
  }, [config.input, updateConfig])

  return [config.input.states, updateInputStates] as const
}

// 输入框尺寸配置 Hook
export function useInputSizes() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateInputSizes = useCallback((updates: Partial<typeof config.input.sizes>) => {
    updateConfig({
      input: {
        ...config.input,
        sizes: { ...config.input.sizes, ...updates }
      }
    })
  }, [config.input, updateConfig])

  return [config.input.sizes, updateInputSizes] as const
}

// 卡片变体配置 Hook
export function useCardVariants() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateCardVariants = useCallback((updates: Partial<typeof config.card.variants>) => {
    updateConfig({
      card: {
        ...config.card,
        variants: { ...config.card.variants, ...updates }
      }
    })
  }, [config.card, updateConfig])

  return [config.card.variants, updateCardVariants] as const
}

// 卡片尺寸配置 Hook
export function useCardSizes() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateCardSizes = useCallback((updates: Partial<typeof config.card.sizes>) => {
    updateConfig({
      card: {
        ...config.card,
        sizes: { ...config.card.sizes, ...updates }
      }
    })
  }, [config.card, updateConfig])

  return [config.card.sizes, updateCardSizes] as const
}

// 标签变体配置 Hook
export function useTagVariants() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateTagVariants = useCallback((updates: Partial<typeof config.tag.variants>) => {
    updateConfig({
      tag: {
        ...config.tag,
        variants: { ...config.tag.variants, ...updates }
      }
    })
  }, [config.tag, updateConfig])

  return [config.tag.variants, updateTagVariants] as const
}

// 标签尺寸配置 Hook
export function useTagSizes() {
  const { config, updateConfig } = useComponentStyleConfig()
  
  const updateTagSizes = useCallback((updates: Partial<typeof config.tag.sizes>) => {
    updateConfig({
      tag: {
        ...config.tag,
        sizes: { ...config.tag.sizes, ...updates }
      }
    })
  }, [config.tag, updateConfig])

  return [config.tag.sizes, updateTagSizes] as const
}
