"use client"

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from "react"
import type { LayoutConfig, LayoutConfigContextType } from "@/types"
import { defaultLayoutConfig, layoutPresets } from "@/config/layout-config"
import { LayoutConfigManager } from "@/lib/layout-config-manager"

const LayoutConfigContext = createContext<LayoutConfigContextType | undefined>(undefined)

export function LayoutConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LayoutConfig>(defaultLayoutConfig)
  const [manager] = useState(() => new LayoutConfigManager(defaultLayoutConfig))

  // 从 localStorage 读取保存的配置
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("aino_layout_config")
        if (saved) {
          const parsedConfig = JSON.parse(saved) as LayoutConfig
          setConfig(parsedConfig)
          manager.updateConfig(parsedConfig)
        }
      }
    } catch (error) {
      console.warn("Failed to load layout config from localStorage:", error)
    }
  }, [manager])

  // 配置变更时保存到 localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("aino_layout_config", JSON.stringify(config))
      }
    } catch (error) {
      console.warn("Failed to save layout config to localStorage:", error)
    }
  }, [config])

  // 更新配置
  const updateConfig = useCallback((updates: Partial<LayoutConfig>) => {
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
    const preset = layoutPresets[presetName as keyof typeof layoutPresets]
    if (preset) {
      setConfig(preset as LayoutConfig)
      manager.updateConfig(preset as LayoutConfig)
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
    <LayoutConfigContext.Provider value={value}>
      {children}
    </LayoutConfigContext.Provider>
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
export function useLayoutConfig(): LayoutConfigContextType {
  const context = useContext(LayoutConfigContext)
  if (context === undefined) {
    throw new Error("useLayoutConfig must be used within a LayoutConfigProvider")
  }
  return context
}
