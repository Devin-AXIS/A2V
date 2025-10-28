"use client"

import type React from "react"
import { createContext, useContext } from "react"

interface LocalThemeKeyContextValue {
    key?: string
    recMainTitle?: string
}

const LocalThemeKeyContext = createContext<LocalThemeKeyContextValue>({})

export function LocalThemeKeyProvider({ value, recMainTitle, children }: { value: string; children: React.ReactNode }) {
    return <LocalThemeKeyContext.Provider value={{ key: value, recMainTitle }}>{children}</LocalThemeKeyContext.Provider>
}

export function useLocalThemeKey() {
    return useContext(LocalThemeKeyContext)
}