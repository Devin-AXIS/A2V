"use client"

import React, { type ReactNode } from "react"
import { DesignTokensProvider } from "./design-tokens-provider"
import { LayoutConfigProvider } from "./layout-config-provider"
import { ComponentStyleConfigProvider } from "./component-style-config-provider"
import { CardThemeProvider } from "./card-theme-provider"
import { UnifiedDesignConstraintsProvider } from "./unified-design-constraints-provider"
import { UnifiedThemeProvider } from "./unified-theme-provider"

interface DesignConfigProviderProps {
  children: ReactNode
}

export function DesignConfigProvider({ children }: DesignConfigProviderProps) {
  return (
    <DesignTokensProvider>
      <LayoutConfigProvider>
        <ComponentStyleConfigProvider>
          <CardThemeProvider>
            <UnifiedThemeProvider>
              <UnifiedDesignConstraintsProvider>
                {children}
              </UnifiedDesignConstraintsProvider>
            </UnifiedThemeProvider>
          </CardThemeProvider>
        </ComponentStyleConfigProvider>
      </LayoutConfigProvider>
    </DesignTokensProvider>
  )
}
