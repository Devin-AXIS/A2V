"use client"

import { ReactNode } from "react"
import { LocaleProvider } from "./locale-provider"
import { DesignTokensProvider } from "./design-tokens-provider"
import { SemanticTokensProvider } from "./semantic-tokens-provider"
import { ThemeProvider } from "./theme-provider"
import { UnifiedChartThemeProvider } from "./unified-chart-theme-provider"
import { DesignConfigProvider } from "./design-config-provider"
import { CardThemeProvider } from "./card-theme-provider"
import { FrostedEffectProvider } from "./frosted-effect-provider"
import { EnhancedErrorBoundary } from "./enhanced-error-boundary"
import { UnifiedThemeProvider } from "./unified-theme-provider"
import { EnvironmentWarning } from "@/components/feedback/environment-warning"

interface UnifiedProviderProps {
  children: ReactNode
  locale: string
  dict: any
  showDebugInfo?: boolean
}

/**
 * 统一 Provider 组件
 * 将多个 Provider 合并为一个，减少嵌套层级，提升性能
 * 遵循约束文档：不影响任何功能和使用交互
 */
export function UnifiedProvider({ 
  children, 
  locale, 
  dict, 
  showDebugInfo = process.env.NODE_ENV === 'development' 
}: UnifiedProviderProps) {
  return (
    <LocaleProvider initialLocale={locale}>
      <DesignTokensProvider>
        <SemanticTokensProvider>
          <ThemeProvider>
            <UnifiedThemeProvider>
              <UnifiedChartThemeProvider>
                <DesignConfigProvider>
                  <CardThemeProvider>
                    <FrostedEffectProvider>
                      <EnhancedErrorBoundary showDebugInfo={showDebugInfo}>
                        <EnvironmentWarning />
                        {children}
                      </EnhancedErrorBoundary>
                    </FrostedEffectProvider>
                  </CardThemeProvider>
                </DesignConfigProvider>
              </UnifiedChartThemeProvider>
            </UnifiedThemeProvider>
          </ThemeProvider>
        </SemanticTokensProvider>
      </DesignTokensProvider>
    </LocaleProvider>
  )
}
