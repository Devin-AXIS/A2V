"use client"

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from "react"
import type { ComponentStyleConfig, ComponentStyleConfigContextType } from "@/types"
import { defaultComponentStyleConfig, componentStylePresets } from "@/config/component-style-config"
import { ComponentStyleConfigManager } from "@/lib/component-style-config-manager"

const ComponentStyleConfigContext = createContext<ComponentStyleConfigContextType | undefined>(undefined)

export function ComponentStyleConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ComponentStyleConfig>(defaultComponentStyleConfig)
  const [manager] = useState(() => new ComponentStyleConfigManager(defaultComponentStyleConfig))

  // 从 localStorage 读取保存的配置
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("aino_component_style_config")
        if (saved) {
          const parsedConfig = JSON.parse(saved) as ComponentStyleConfig
          setConfig(parsedConfig)
          manager.updateConfig(parsedConfig)
        }
      }
    } catch (error) {
      console.warn("Failed to load component style config from localStorage:", error)
    }
  }, [manager])

  // 配置变更时保存到 localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("aino_component_style_config", JSON.stringify(config))
      }
    } catch (error) {
      console.warn("Failed to save component style config to localStorage:", error)
    }
  }, [config])

  // 更新配置
  const updateConfig = useCallback((updates: Partial<ComponentStyleConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    manager.updateConfig(newConfig)
  }, [config, manager])

  // 获取配置
  const getConfig = useCallback((path: string) => {
    return manager.getConfig(path)
  }, [manager])

  // 设置配置
  const setConfigValue = useCallback((path: string, value: any) => {
    const newConfig = { ...config }
    setNestedValue(newConfig, path, value)
    setConfig(newConfig)
    manager.updateConfig(newConfig)
  }, [config, manager])

  // 生成 CSS 变量
  const generateCSSVariables = useCallback(() => {
    return manager.generateCSSVariables()
  }, [manager])

  // 导出配置
  const exportConfig = useCallback((format: 'json' | 'css') => {
    return manager.export(format)
  }, [manager])

  // 应用预设
  const applyPreset = useCallback((presetName: string) => {
    const preset = componentStylePresets[presetName as keyof typeof componentStylePresets]
    if (preset) {
      setConfig(preset as ComponentStyleConfig)
      manager.updateConfig(preset as ComponentStyleConfig)
    }
  }, [manager])

  const value = useMemo(() => ({
    config,
    updateConfig,
    getConfig,
    setConfig: setConfigValue,
    applyPreset,
    generateCSSVariables,
    export: exportConfig
  }), [
    config,
    updateConfig,
    getConfig,
    setConfigValue,
    applyPreset,
    generateCSSVariables,
    exportConfig
  ])

  return (
    <ComponentStyleConfigContext.Provider value={value}>
      {children}
    </ComponentStyleConfigContext.Provider>
  )
}

// 设置嵌套值的辅助函数
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => {
    if (!current[key]) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}

// Hook 使用
export function useComponentStyleConfig(): ComponentStyleConfigContextType {
  const context = useContext(ComponentStyleConfigContext)
  if (context === undefined) {
    throw new Error("useComponentStyleConfig must be used within a ComponentStyleConfigProvider")
  }
  return context
}
