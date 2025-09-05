'use client'

import { useEffect } from 'react'
import { useGlobalRadius } from '@/hooks/use-global-radius'

/**
 * 边角应用器组件
 * 监听边角配置变化，自动应用到页面上的现有组件
 */
export function RadiusApplier() {
  const { applyRadiusToExistingComponents } = useGlobalRadius()

  useEffect(() => {
    // 组件挂载时应用当前边角配置
    applyRadiusToExistingComponents()

    // 监听边角更新事件
    const handleRadiusUpdate = () => {
      applyRadiusToExistingComponents()
    }

    window.addEventListener('radiusUpdated', handleRadiusUpdate)

    // 监听设计令牌变化
    const handleTokensChange = () => {
      // 延迟应用，确保令牌已更新
      setTimeout(() => {
        applyRadiusToExistingComponents()
      }, 100)
    }

    // 监听 DOM 变化，自动应用边角到新添加的组件
    const observer = new MutationObserver((mutations) => {
      let shouldApply = false
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 检查是否有新的组件被添加
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.classList.contains('rounded-lg') || 
                  element.classList.contains('rounded-xl') || 
                  element.classList.contains('rounded-2xl') ||
                  element.classList.contains('rounded-full')) {
                shouldApply = true
              }
            }
          })
        }
      })
      
      if (shouldApply) {
        setTimeout(() => {
          applyRadiusToExistingComponents()
        }, 100)
      }
    })

    // 开始观察 DOM 变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      window.removeEventListener('radiusUpdated', handleRadiusUpdate)
      observer.disconnect()
    }
  }, [applyRadiusToExistingComponents])

  // 这个组件不渲染任何内容，只负责应用边角
  return null
}
