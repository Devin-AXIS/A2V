import { useCallback } from "react"
import { useDesignTokens } from "@/components/providers/design-tokens-provider"

// 便捷的令牌访问 Hook
export function useToken(path: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const value = getToken(path)
  const updateValue = useCallback((newValue: any) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 颜色令牌 Hook
export function useColorToken(category: string, scale?: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const path = scale ? `colors.${category}.${scale}` : `colors.${category}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: any) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 字体令牌 Hook
export function useTypographyToken(type: string, property?: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const path = property ? `typography.${type}.${property}` : `typography.${type}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: any) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 间距令牌 Hook
export function useSpacingToken(size: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const path = `spacing.${size}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: string) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 圆角令牌 Hook
export function useRadiusToken(size: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const path = `radius.${size}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: string) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 阴影令牌 Hook
export function useShadowToken(size: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const path = `shadows.${size}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: string) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 边框令牌 Hook
export function useBorderToken(type: string, property: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const path = `borders.${type}.${property}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: string) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 语义化颜色 Hook
export function useSemanticColor(type: 'success' | 'warning' | 'error' | 'info', scale?: string) {
  const { getToken, setToken } = useDesignTokens()
  
  const path = scale ? `colors.semantic.${type}.${scale}` : `colors.semantic.${type}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: any) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 背景颜色 Hook
export function useBackgroundColor(type: 'primary' | 'secondary' | 'tertiary') {
  const { getToken, setToken } = useDesignTokens()
  
  const path = `colors.background.${type}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: string) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}

// 文字颜色 Hook
export function useTextColor(type: 'primary' | 'secondary' | 'tertiary' | 'inverse') {
  const { getToken, setToken } = useDesignTokens()
  
  const path = `colors.text.${type}`
  const value = getToken(path)
  
  const updateValue = useCallback((newValue: string) => {
    setToken(path, newValue)
  }, [setToken, path])

  return [value, updateValue] as const
}
