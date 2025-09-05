import { useCallback } from "react"
import { useLayoutConfig } from "@/components/providers/layout-config-provider"

// 便捷的布局配置访问 Hook
export function useLayoutConfigValue(path: string) {
  const { getConfig, setConfig } = useLayoutConfig()
  
  const value = getConfig(path)
  const updateValue = useCallback((newValue: any) => {
    setConfig(path, newValue)
  }, [setConfig, path])

  return [value, updateValue] as const
}

// 页面布局配置 Hook
export function usePageLayout() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updatePageLayout = useCallback((updates: Partial<typeof config.pageLayout>) => {
    updateConfig({
      pageLayout: { ...config.pageLayout, ...updates }
    })
  }, [config.pageLayout, updateConfig])

  return [config.pageLayout, updatePageLayout] as const
}

// 侧边栏配置 Hook
export function useSidebarConfig() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updateSidebar = useCallback((updates: Partial<typeof config.pageLayout.sidebar>) => {
    updateConfig({
      pageLayout: {
        ...config.pageLayout,
        sidebar: { ...config.pageLayout.sidebar, ...updates }
      }
    })
  }, [config.pageLayout, updateConfig])

  return [config.pageLayout.sidebar, updateSidebar] as const
}

// 头部配置 Hook
export function useHeaderConfig() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updateHeader = useCallback((updates: Partial<typeof config.pageLayout.header>) => {
    updateConfig({
      pageLayout: {
        ...config.pageLayout,
        header: { ...config.pageLayout.header, ...updates }
      }
    })
  }, [config.pageLayout, updateConfig])

  return [config.pageLayout.header, updateHeader] as const
}

// 内容配置 Hook
export function useContentConfig() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updateContent = useCallback((updates: Partial<typeof config.pageLayout.content>) => {
    updateConfig({
      pageLayout: {
        ...config.pageLayout,
        content: { ...config.pageLayout.content, ...updates }
      }
    })
  }, [config.pageLayout, updateConfig])

  return [config.pageLayout.content, updateContent] as const
}

// 网格系统配置 Hook
export function useGridSystem() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updateGridSystem = useCallback((updates: Partial<typeof config.gridSystem>) => {
    updateConfig({
      gridSystem: { ...config.gridSystem, ...updates }
    })
  }, [config.gridSystem, updateConfig])

  return [config.gridSystem, updateGridSystem] as const
}

// 容器配置 Hook
export function useContainers() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updateContainers = useCallback((updates: Partial<typeof config.containers>) => {
    updateConfig({
      containers: { ...config.containers, ...updates }
    })
  }, [config.containers, updateConfig])

  return [config.containers, updateContainers] as const
}

// 间距系统配置 Hook
export function useSpacingSystem() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updateSpacing = useCallback((updates: Partial<typeof config.spacing>) => {
    updateConfig({
      spacing: { ...config.spacing, ...updates }
    })
  }, [config.spacing, updateConfig])

  return [config.spacing, updateSpacing] as const
}

// 断点配置 Hook
export function useBreakpoints() {
  const { config, updateConfig } = useLayoutConfig()
  
  const updateBreakpoints = useCallback((updates: Partial<typeof config.gridSystem.breakpoints>) => {
    updateConfig({
      gridSystem: {
        ...config.gridSystem,
        breakpoints: { ...config.gridSystem.breakpoints, ...updates }
      }
    })
  }, [config.gridSystem, updateConfig])

  return [config.gridSystem.breakpoints, updateBreakpoints] as const
}

// 布局类型 Hook
export function useLayoutType() {
  const { config, updateConfig } = useLayoutConfig()
  
  const setLayoutType = useCallback((type: typeof config.pageLayout.type) => {
    updateConfig({
      pageLayout: {
        ...config.pageLayout,
        type
      }
    })
  }, [config.pageLayout, updateConfig])

  return [config.pageLayout.type, setLayoutType] as const
}
