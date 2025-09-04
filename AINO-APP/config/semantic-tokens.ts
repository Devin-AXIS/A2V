/**
 * 语义令牌系统
 * 建立Foundation到Semantic的映射关系，实现语义优先的设计原则
 * 参考架构师方案的"分层建模"理念
 */

import type { SemanticTokens, TokenMapping, SemanticContext } from "@/types"

// 语义令牌映射表 - Foundation → Semantic
export const semanticTokenMapping: TokenMapping = {
  // 表面语义令牌
  'surface.default': {
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    border: 'hsl(var(--border))',
    fallback: ['hsl(var(--neutral-50))', 'hsl(var(--neutral-100))']
  },
  'surface.secondary': {
    background: 'hsl(var(--background-secondary))',
    color: 'hsl(var(--foreground-secondary))',
    border: 'hsl(var(--border))',
    fallback: ['hsl(var(--neutral-100))', 'hsl(var(--neutral-200))']
  },
  'surface.tertiary': {
    background: 'hsl(var(--background-tertiary))',
    color: 'hsl(var(--foreground-tertiary))',
    border: 'hsl(var(--border))',
    fallback: ['hsl(var(--neutral-200))', 'hsl(var(--neutral-300))']
  },
  'surface.card': {
    background: 'hsl(var(--card))',
    color: 'hsl(var(--card-foreground))',
    border: 'hsl(var(--border))',
    shadow: 'var(--shadow-sm)',
    fallback: ['hsl(var(--background))', 'hsl(var(--neutral-50))']
  },
  'surface.popover': {
    background: 'hsl(var(--popover))',
    color: 'hsl(var(--popover-foreground))',
    border: 'hsl(var(--border))',
    shadow: 'var(--shadow-lg)',
    fallback: ['hsl(var(--card))', 'hsl(var(--background))']
  },
  'surface.overlay': {
    background: 'hsl(var(--background) / 0.8)',
    color: 'hsl(var(--foreground))',
    border: 'hsl(var(--border))',
    backdrop: 'blur(8px)',
    fallback: ['hsl(var(--background) / 0.9)', 'hsl(var(--neutral-900) / 0.8)']
  },
  
  // 文本语义令牌
  'text.primary': {
    color: 'hsl(var(--foreground))',
    fallback: ['hsl(var(--neutral-900))', 'hsl(var(--neutral-800))']
  },
  'text.secondary': {
    color: 'hsl(var(--foreground-secondary))',
    fallback: ['hsl(var(--neutral-700))', 'hsl(var(--neutral-600))']
  },
  'text.tertiary': {
    color: 'hsl(var(--foreground-tertiary))',
    fallback: ['hsl(var(--neutral-500))', 'hsl(var(--neutral-400))']
  },
  'text.inverse': {
    color: 'hsl(var(--foreground-inverse))',
    fallback: ['hsl(var(--neutral-50))', 'hsl(var(--neutral-100))']
  },
  'text.muted': {
    color: 'hsl(var(--muted-foreground))',
    fallback: ['hsl(var(--neutral-500))', 'hsl(var(--neutral-400))']
  },
  
  // 主要操作语义令牌
  'primary.default': {
    background: 'hsl(var(--primary-500))',
    color: 'hsl(var(--primary-foreground))',
    border: 'hsl(var(--primary-500))',
    fallback: ['hsl(var(--primary-600))', 'hsl(var(--primary-700))']
  },
  'primary.hover': {
    background: 'hsl(var(--primary-600))',
    color: 'hsl(var(--primary-foreground))',
    border: 'hsl(var(--primary-600))',
    fallback: ['hsl(var(--primary-700))', 'hsl(var(--primary-800))']
  },
  'primary.active': {
    background: 'hsl(var(--primary-700))',
    color: 'hsl(var(--primary-foreground))',
    border: 'hsl(var(--primary-700))',
    fallback: ['hsl(var(--primary-800))', 'hsl(var(--primary-900))']
  },
  'primary.focus': {
    background: 'hsl(var(--primary-500))',
    color: 'hsl(var(--primary-foreground))',
    border: 'hsl(var(--ring))',
    ring: 'hsl(var(--ring) / 0.2)',
    fallback: ['hsl(var(--primary-600))', 'hsl(var(--ring))']
  },
  
  // 次要操作语义令牌
  'secondary.default': {
    background: 'hsl(var(--secondary-500))',
    color: 'hsl(var(--secondary-foreground))',
    border: 'hsl(var(--secondary-500))',
    fallback: ['hsl(var(--secondary-600))', 'hsl(var(--neutral-600))']
  },
  'secondary.hover': {
    background: 'hsl(var(--secondary-600))',
    color: 'hsl(var(--secondary-foreground))',
    border: 'hsl(var(--secondary-600))',
    fallback: ['hsl(var(--secondary-700))', 'hsl(var(--neutral-700))']
  },
  
  // 成功语义令牌
  'success.default': {
    background: 'hsl(var(--success-500))',
    color: 'hsl(var(--success-foreground))',
    border: 'hsl(var(--success-500))',
    fallback: ['hsl(var(--success-600))', 'hsl(var(--success-700))']
  },
  'success.hover': {
    background: 'hsl(var(--success-600))',
    color: 'hsl(var(--success-foreground))',
    border: 'hsl(var(--success-600))',
    fallback: ['hsl(var(--success-700))', 'hsl(var(--success-800))']
  },
  
  // 警告语义令牌
  'warning.default': {
    background: 'hsl(var(--warning-500))',
    color: 'hsl(var(--warning-foreground))',
    border: 'hsl(var(--warning-500))',
    fallback: ['hsl(var(--warning-600))', 'hsl(var(--warning-700))']
  },
  'warning.hover': {
    background: 'hsl(var(--warning-600))',
    color: 'hsl(var(--warning-foreground))',
    border: 'hsl(var(--warning-600))',
    fallback: ['hsl(var(--warning-700))', 'hsl(var(--warning-800))']
  },
  
  // 危险语义令牌
  'danger.default': {
    background: 'hsl(var(--destructive))',
    color: 'hsl(var(--destructive-foreground))',
    border: 'hsl(var(--destructive))',
    fallback: ['hsl(var(--error-600))', 'hsl(var(--error-700))']
  },
  'danger.hover': {
    background: 'hsl(var(--destructive-600))',
    color: 'hsl(var(--destructive-foreground))',
    border: 'hsl(var(--destructive-600))',
    fallback: ['hsl(var(--error-700))', 'hsl(var(--error-800))']
  },
  
  // 焦点语义令牌
  'focus.ring': {
    ring: 'hsl(var(--ring) / 0.2)',
    border: 'hsl(var(--ring))',
    fallback: ['hsl(var(--primary-500) / 0.2)', 'hsl(var(--primary-600))']
  },
  'focus.visible': {
    outline: '2px solid hsl(var(--ring))',
    outlineOffset: '2px',
    fallback: ['2px solid hsl(var(--primary-500))', '2px solid hsl(var(--primary-600))']
  },
  
  // 选择语义令牌
  'selection.background': {
    background: 'hsl(var(--primary-200) / 0.3)',
    fallback: ['hsl(var(--primary-300) / 0.3)', 'hsl(var(--primary-400) / 0.3)']
  },
  'selection.text': {
    color: 'hsl(var(--primary-900))',
    fallback: ['hsl(var(--primary-800))', 'hsl(var(--primary-700))']
  },
  
  // 输入语义令牌
  'input.default': {
    background: 'hsl(var(--input))',
    color: 'hsl(var(--input-foreground))',
    border: 'hsl(var(--border-input))',
    fallback: ['hsl(var(--background))', 'hsl(var(--neutral-100))']
  },
  'input.focus': {
    background: 'hsl(var(--input))',
    color: 'hsl(var(--input-foreground))',
    border: 'hsl(var(--ring))',
    ring: 'hsl(var(--ring) / 0.1)',
    fallback: ['hsl(var(--background))', 'hsl(var(--primary-500))']
  },
  'input.error': {
    background: 'hsl(var(--input))',
    color: 'hsl(var(--destructive))',
    border: 'hsl(var(--destructive))',
    ring: 'hsl(var(--destructive) / 0.1)',
    fallback: ['hsl(var(--background))', 'hsl(var(--error-500))']
  },
  'input.disabled': {
    background: 'hsl(var(--muted))',
    color: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--muted))',
    fallback: ['hsl(var(--neutral-100))', 'hsl(var(--neutral-200))']
  },
  
  // 毛玻璃语义令牌
  'glass.soft': {
    background: 'hsl(var(--background) / 0.7)',
    backdrop: 'blur(4px)',
    border: 'hsl(var(--border) / 0.3)',
    fallback: ['hsl(var(--neutral-50) / 0.9)', 'hsl(var(--neutral-100) / 0.8)']
  },
  'glass.medium': {
    background: 'hsl(var(--background) / 0.8)',
    backdrop: 'blur(8px)',
    border: 'hsl(var(--border) / 0.4)',
    fallback: ['hsl(var(--neutral-50) / 0.85)', 'hsl(var(--neutral-100) / 0.75)']
  },
  'glass.strong': {
    background: 'hsl(var(--background) / 0.9)',
    backdrop: 'blur(16px)',
    border: 'hsl(var(--border) / 0.5)',
    fallback: ['hsl(var(--neutral-50) / 0.8)', 'hsl(var(--neutral-100) / 0.7)']
  },
  
  // 海拔语义令牌
  'elevation.0': {
    shadow: 'none',
    border: 'hsl(var(--border))',
    fallback: ['none', '1px solid hsl(var(--neutral-200))']
  },
  'elevation.1': {
    shadow: 'var(--shadow-sm)',
    border: 'hsl(var(--border))',
    fallback: ['0 1px 2px 0 hsl(var(--neutral-900) / 0.05)', '1px solid hsl(var(--neutral-200))']
  },
  'elevation.2': {
    shadow: 'var(--shadow-md)',
    border: 'hsl(var(--border))',
    fallback: ['0 4px 6px -1px hsl(var(--neutral-900) / 0.1)', '1px solid hsl(var(--neutral-200))']
  },
  'elevation.3': {
    shadow: 'var(--shadow-lg)',
    border: 'hsl(var(--border))',
    fallback: ['0 10px 15px -3px hsl(var(--neutral-900) / 0.1)', '1px solid hsl(var(--neutral-200))']
  },
  'elevation.4': {
    shadow: 'var(--shadow-xl)',
    border: 'hsl(var(--border))',
    fallback: ['0 20px 25px -5px hsl(var(--neutral-900) / 0.1)', '1px solid hsl(var(--neutral-200))']
  },
  'elevation.5': {
    shadow: 'var(--shadow-2xl)',
    border: 'hsl(var(--border))',
    fallback: ['0 25px 50px -12px hsl(var(--neutral-900) / 0.25)', '1px solid hsl(var(--neutral-200))']
  }
}

// 语义上下文配置
export const semanticContexts: SemanticContext[] = [
  {
    name: 'default',
    description: '默认语义上下文',
    tokens: semanticTokenMapping
  },
  {
    name: 'high-contrast',
    description: '高对比度语义上下文',
    tokens: {
      // 高对比度下的语义令牌覆盖
      'surface.default': {
        background: 'hsl(var(--neutral-900))',
        color: 'hsl(var(--neutral-50))',
        border: 'hsl(var(--neutral-700))',
        fallback: ['hsl(var(--neutral-800))', 'hsl(var(--neutral-900))']
      },
      'text.primary': {
        color: 'hsl(var(--neutral-50))',
        fallback: ['hsl(var(--neutral-100))', 'hsl(var(--neutral-200))']
      },
      'focus.ring': {
        ring: 'hsl(var(--primary-400) / 0.4)',
        border: 'hsl(var(--primary-400))',
        fallback: ['hsl(var(--primary-300) / 0.5)', 'hsl(var(--primary-500))']
      }
    }
  }
]

// 获取语义令牌值
export function getSemanticToken(semanticPath: string, context: string = 'default'): any {
  const contextTokens = semanticContexts.find(ctx => ctx.name === context)?.tokens
  if (!contextTokens) {
    console.warn(`Semantic context '${context}' not found, falling back to default`)
    return semanticTokenMapping[semanticPath]
  }
  
  return contextTokens[semanticPath] || semanticTokenMapping[semanticPath]
}

// 验证语义令牌
export function validateSemanticToken(semanticPath: string): { isValid: boolean; error?: string } {
  if (!semanticTokenMapping[semanticPath]) {
    return {
      isValid: false,
      error: `Semantic token '${semanticPath}' not found`
    }
  }
  
  return { isValid: true }
}

// 获取语义令牌的回退链
export function getSemanticTokenFallback(semanticPath: string, context: string = 'default'): string[] {
  const token = getSemanticToken(semanticPath, context)
  return token?.fallback || []
}

// 生成语义令牌的CSS变量
export function generateSemanticCSSVariables(context: string = 'default'): string {
  const contextTokens = semanticContexts.find(ctx => ctx.name === context)?.tokens || semanticTokenMapping
  let css = `/* Semantic tokens for context: ${context} */\n:root {\n`
  
  Object.entries(contextTokens).forEach(([path, token]) => {
    const cssVarName = `--${path.replace(/\./g, '-')}`
    
    if (token.background) css += `  ${cssVarName}-bg: ${token.background};\n`
    if (token.color) css += `  ${cssVarName}-color: ${token.color};\n`
    if (token.border) css += `  ${cssVarName}-border: ${token.border};\n`
    if (token.shadow) css += `  ${cssVarName}-shadow: ${token.shadow};\n`
    if (token.ring) css += `  ${cssVarName}-ring: ${token.ring};\n`
    if (token.backdrop) css += `  ${cssVarName}-backdrop: ${token.backdrop};\n`
  })
  
  css += '}'
  return css
}
