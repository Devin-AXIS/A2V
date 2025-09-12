import { useEffect, useState } from "react"
import { CardRegistry } from "@/components/card/registry"

export function useCardRegistryData<T>(name: string, defaultData: T) {
    const [data, setData] = useState<T>(defaultData)

    useEffect(() => {
        const current = CardRegistry.getData(name)
        if (current) {
            setData((current as T) || defaultData)
        } else {
            CardRegistry.listen((eventName: string, payload: T) => {
                if (eventName === name) {
                    setData(payload || defaultData)
                }
            })
        }
    }, [name])

    return data
}


