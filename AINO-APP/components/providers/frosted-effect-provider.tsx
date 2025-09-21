"use client"

import { createContext, useContext, useState, useMemo, type ReactNode } from "react"

interface FrostedEffectContextType {
  isFrosted: boolean
  setIsFrosted: (isFrosted: boolean) => void
}

const FrostedEffectContext = createContext<FrostedEffectContextType | undefined>(undefined)

export function FrostedEffectProvider({ children }: { children: ReactNode }) {
  const [isFrosted, setIsFrosted] = useState(false)

  const value = useMemo(
    () => ({
      isFrosted,
      setIsFrosted,
    }),
    [isFrosted],
  )

  return <FrostedEffectContext.Provider value={value}>{children}</FrostedEffectContext.Provider>
}

export function useFrostedEffect() {
  const context = useContext(FrostedEffectContext)
  if (context === undefined) {
    throw new Error("useFrostedEffect must be used within a FrostedEffectProvider")
  }
  return context
}
