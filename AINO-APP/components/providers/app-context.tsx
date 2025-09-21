"use client"

import React, { createContext, useContext, useMemo, useState } from "react"

export type AppContextValue = {
    appKey?: string | null
    locale?: string
    device?: "mobile" | "pc"
    setDevice?: (d: "mobile" | "pc") => void
}

const AppContext = createContext<AppContextValue>({})

export function useAppContext() {
    return useContext(AppContext)
}

export function AppContextProvider({ appKey, locale, device: defaultDevice = "mobile", children }: {
    appKey?: string | null
    locale?: string
    device?: "mobile" | "pc"
    children: React.ReactNode
}) {
    const [device, setDevice] = useState<"mobile" | "pc">(defaultDevice)
    const value = useMemo<AppContextValue>(() => ({ appKey, locale, device, setDevice }), [appKey, locale, device])
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}


