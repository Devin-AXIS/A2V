"use client"

import type React from "react"
import { createContext, useContext } from "react"

interface LocalThemeEditorVisibilityContextValue {
    visible: boolean
}

const LocalThemeEditorVisibilityContext = createContext<LocalThemeEditorVisibilityContextValue>({ visible: true })

export function LocalThemeEditorVisibilityProvider({ visible, children }: { visible: boolean; children: React.ReactNode }) {
    return (
        <LocalThemeEditorVisibilityContext.Provider value={{ visible }}>
            {children}
        </LocalThemeEditorVisibilityContext.Provider>
    )
}

export function useLocalThemeEditorVisibility() {
    return useContext(LocalThemeEditorVisibilityContext)
} 