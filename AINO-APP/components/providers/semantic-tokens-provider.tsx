"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { semanticTokenMapping, semanticContexts, getSemanticToken, validateSemanticToken, getSemanticTokenFallback, generateSemanticCSSVariables } from "@/config/semantic-tokens"
import type { SemanticTokensContextType, SemanticTokens, SemanticContext } from "@/types"

const SemanticTokensContext = createContext<SemanticTokensContextType | undefined>(undefined)

export function SemanticTokensProvider({ children }: { children: ReactNode }) {
  const [currentContext, setCurrentContext] = useState<string>('default')
  const [tokens] = useState<SemanticTokens>({
    mapping: semanticTokenMapping,
    contexts: semanticContexts,
    currentContext: 'default'
  })

  // 初始化时注入语义令牌CSS变量
  useEffect(() => {
    const css = generateSemanticCSSVariables(currentContext)
    
    // 创建或更新样式标签
    let styleTag = document.getElementById('semantic-tokens-css')
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = 'semantic-tokens-css'
      document.head.appendChild(styleTag)
    }
    styleTag.textContent = css
  }, [currentContext])

  // 切换语义上下文
  const setContext = (context: string) => {
    const validContext = semanticContexts.find(ctx => ctx.name === context)
    if (validContext) {
      setCurrentContext(context)
      tokens.currentContext = context
    } else {
      console.warn(`Invalid semantic context: ${context}`)
    }
  }

  // 获取语义令牌值
  const getToken = (semanticPath: string, context?: string): any => {
    const targetContext = context || currentContext
    return getSemanticToken(semanticPath, targetContext)
  }

  // 验证语义令牌
  const validateToken = (semanticPath: string): { isValid: boolean; error?: string } => {
    return validateSemanticToken(semanticPath)
  }

  // 获取语义令牌的回退链
  const getFallback = (semanticPath: string, context?: string): string[] => {
    const targetContext = context || currentContext
    return getSemanticTokenFallback(semanticPath, targetContext)
  }

  // 生成CSS变量
  const generateCSS = (context?: string): string => {
    const targetContext = context || currentContext
    return generateSemanticCSSVariables(targetContext)
  }

  const value: SemanticTokensContextType = {
    tokens,
    currentContext,
    setContext,
    getToken,
    validateToken,
    getFallback,
    generateCSS
  }

  return (
    <SemanticTokensContext.Provider value={value}>
      {children}
    </SemanticTokensContext.Provider>
  )
}

export function useSemanticTokens() {
  const context = useContext(SemanticTokensContext)
  if (!context) {
    throw new Error('useSemanticTokens must be used within SemanticTokensProvider')
  }
  return context
}
