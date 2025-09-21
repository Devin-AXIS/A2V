import { useEffect, useState } from "react"
import { CardRegistry } from "@/components/card/registry"

type RegistryHookResult<T> = {
    realData: T
    CARD_DISPLAY_DATA?: any
}

export function useCardRegistryData<T>(name: string | undefined, defaultData: T) {
    const [data, setData] = useState<RegistryHookResult<T>>({ realData: defaultData, CARD_DISPLAY_DATA: null })

    const safeName = typeof name === 'string' ? name : ''

    let cardDisplayData: any = null
    try {
        if (typeof window !== 'undefined') {
            const cdd = localStorage.getItem("CARD_DISPLAY_DATA")
            if (cdd) cardDisplayData = JSON.parse(cdd)
        }
    } catch { }

    let cardDisplayEntry: any = null
    if (cardDisplayData && typeof cardDisplayData === 'object') {
        try {
            for (const key in cardDisplayData) {
                if (!Object.prototype.hasOwnProperty.call(cardDisplayData, key)) continue
                if (safeName.includes(key)) { cardDisplayEntry = cardDisplayData[key]; break }
            }
        } catch { }
    }

    useEffect(() => {
        try {
            const current = CardRegistry.getData(safeName)
            const displayPayload = cardDisplayEntry && typeof cardDisplayEntry === 'object' ? (cardDisplayEntry.display ?? null) : null

            // 初始化时优先使用当前注册中心数据
            if (current) {
                setData({ realData: ((current as T) || defaultData), CARD_DISPLAY_DATA: displayPayload })
            } else {
                setData({ realData: defaultData, CARD_DISPLAY_DATA: displayPayload })
            }

            // 始终订阅后续更新
            CardRegistry.listen(safeName, (eventName: string, payload: T) => {
                if (eventName === safeName) {
                    setData({ realData: (payload || defaultData), CARD_DISPLAY_DATA: displayPayload })
                }
            })
        } catch {
            setData({ realData: defaultData, CARD_DISPLAY_DATA: null })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeName])

    return data
}


