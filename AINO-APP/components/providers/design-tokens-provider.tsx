"use client"

import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react"
import { defaultDesignTokens, designTokenPresets } from "@/config/design-tokens"
import { updateCSSVariablesFromTokens } from "@/lib/color-variable-mapper"
import type { DesignTokens, DesignTokensContextType } from "@/types"

const DesignTokensContext = createContext<DesignTokensContextType | undefined>(undefined)

export function DesignTokensProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<DesignTokens>(defaultDesignTokens)

  // 初始化时同步CSS变量
  useEffect(() => {
    // 同步所有颜色相关的设计令牌到CSS变量
    const colorTokenPaths = [
      'colors.primary.50', 'colors.primary.100', 'colors.primary.200', 'colors.primary.300', 'colors.primary.400',
      'colors.primary.500', 'colors.primary.600', 'colors.primary.700', 'colors.primary.800', 'colors.primary.900',
      'colors.secondary.50', 'colors.secondary.100', 'colors.secondary.200', 'colors.secondary.300', 'colors.secondary.400',
      'colors.secondary.500', 'colors.secondary.600', 'colors.secondary.700', 'colors.secondary.800', 'colors.secondary.900',
      'colors.neutral.50', 'colors.neutral.100', 'colors.neutral.200', 'colors.neutral.300', 'colors.neutral.400',
      'colors.neutral.500', 'colors.neutral.600', 'colors.neutral.700', 'colors.neutral.800', 'colors.neutral.900',
      'colors.semantic.success.50', 'colors.semantic.success.100', 'colors.semantic.success.200', 'colors.semantic.success.300', 'colors.semantic.success.400',
      'colors.semantic.success.500', 'colors.semantic.success.600', 'colors.semantic.success.700', 'colors.semantic.success.800', 'colors.semantic.success.900',
      'colors.semantic.warning.50', 'colors.semantic.warning.100', 'colors.semantic.warning.200', 'colors.semantic.warning.300', 'colors.semantic.warning.400',
      'colors.semantic.warning.500', 'colors.semantic.warning.600', 'colors.semantic.warning.700', 'colors.semantic.warning.800', 'colors.semantic.warning.900',
      'colors.semantic.error.50', 'colors.semantic.error.100', 'colors.semantic.error.200', 'colors.semantic.error.300', 'colors.semantic.error.400',
      'colors.semantic.error.500', 'colors.semantic.error.600', 'colors.semantic.error.700', 'colors.semantic.error.800', 'colors.semantic.error.900',
      'colors.semantic.info.50', 'colors.semantic.info.100', 'colors.semantic.info.200', 'colors.semantic.info.300', 'colors.semantic.info.400',
      'colors.semantic.info.500', 'colors.semantic.info.600', 'colors.semantic.info.700', 'colors.semantic.info.800', 'colors.semantic.info.900',
      'colors.background.primary', 'colors.background.secondary', 'colors.background.tertiary',
      'colors.text.primary', 'colors.text.secondary', 'colors.text.tertiary', 'colors.text.inverse'
    ]
    
    updateCSSVariablesFromTokens(tokens, colorTokenPaths)
  }, [tokens])

  // 更新设计令牌 - 使用深度合并
  const updateTokens = (updates: Partial<DesignTokens>) => {
    // 深度合并函数
    const deepMerge = (target: any, source: any): any => {
      const result = { ...target }
      
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(target[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
      
      return result
    }
    
    const newTokens = deepMerge(tokens, updates)
    setTokens(newTokens)
    
    // 自动同步颜色相关的更新到CSS变量
    const updatedColorPaths = Object.keys(updates).filter(key => key.startsWith('colors.'))
    if (updatedColorPaths.length > 0) {
      updateCSSVariablesFromTokens(newTokens, updatedColorPaths)
    }
  }

  // 获取设计令牌值
  const getToken = (path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, tokens)
  }

  // 设置设计令牌值
  const setToken = (path: string, value: any) => {
    const pathParts = path.split('.')
    const lastKey = pathParts.pop()!
    const target = pathParts.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {}
      }
      return current[key]
    }, tokens as any)
    
    target[lastKey] = value
    
    // 如果是颜色相关的令牌，自动同步到CSS变量
    if (path.startsWith('colors.')) {
      updateCSSVariablesFromTokens(tokens, [path])
    }
    
    setTokens({ ...tokens })
  }

  // 生成CSS变量
  const generateCSSVariables = (): string => {
    let css = ':root {\n'
    
    // 生成颜色变量
    Object.entries(tokens.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object' && colors !== null) {
        Object.entries(colors).forEach(([shade, value]) => {
          if (typeof value === 'string') {
            css += `  --${category}-${shade}: ${value};\n`
          }
        })
      }
    })
    
    css += '}'
    return css
  }

  // 导出配置
  const exportConfig = (format: 'json' | 'css' | 'scss'): string => {
    switch (format) {
      case 'json':
        return JSON.stringify(tokens, null, 2)
      case 'css':
        return generateCSSVariables()
      case 'scss':
        return generateCSSVariables().replace(':root', '$tokens: (')
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  // 应用预设
  const applyPreset = (presetName: keyof typeof designTokenPresets) => {
    const preset = designTokenPresets[presetName]
    if (preset) {
      updateTokens(preset)
    }
  }

  const value: DesignTokensContextType = {
    tokens,
    updateTokens,
    getToken,
    setToken,
    generateCSSVariables,
    export: exportConfig,
    applyPreset
  }

  return (
    <DesignTokensContext.Provider value={value}>
      {children}
    </DesignTokensContext.Provider>
  )
}

export function useDesignTokens() {
  const context = useContext(DesignTokensContext)
  if (!context) {
    throw new Error('useDesignTokens must be used within DesignTokensProvider')
  }
  return context
}
