"use client"

import type React from "react"
import { createContext, useContext } from "react"

interface LocalThemeKeyContextValue {
    key?: string
}

const LocalThemeKeyContext = createContext<LocalThemeKeyContextValue>({})

export function LocalThemeKeyProvider({ value, children }: { value: string; children: React.ReactNode }) {
    return <LocalThemeKeyContext.Provider value={{ key: value }}>{children}</LocalThemeKeyContext.Provider>
}

export function useLocalThemeKey() {
    return useContext(LocalThemeKeyContext)
} 