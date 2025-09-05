/**
 * 统一Hook使用工具
 * 提供标准化的Hook使用模式，确保性能优化一致性
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react"

// 统一的状态管理Hook
export function useUnifiedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue)
  
  const updateState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(newState)
  }, [])
  
  const resetState = useCallback(() => {
    setState(initialValue)
  }, [initialValue])
  
  return [state, updateState, resetState] as const
}

// 统一的副作用Hook
export function useUnifiedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList = []
) {
  useEffect(effect, deps)
}

// 统一的计算值Hook
export function useUnifiedMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps)
}

// 统一的回调Hook
export function useUnifiedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

// 统一的引用Hook
export function useUnifiedRef<T>(initialValue: T | null = null) {
  return useRef<T>(initialValue)
}

// 统一的异步状态Hook
export function useUnifiedAsyncState<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFunction()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, deps)
  
  useEffect(() => {
    execute()
  }, [execute])
  
  return { data, loading, error, refetch: execute }
}

// 统一的本地存储Hook
export function useUnifiedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
      }
      return initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])
  
  return [storedValue, setValue]
}

// 统一的防抖Hook
export function useUnifiedDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// 统一的节流Hook
export function useUnifiedThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())
  
  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [value, delay])
  
  return throttledValue
}

// 统一的窗口尺寸Hook
export function useUnifiedWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  
  return windowSize
}

// 统一的媒体查询Hook
export function useUnifiedMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)
    
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])
  
  return matches
}
