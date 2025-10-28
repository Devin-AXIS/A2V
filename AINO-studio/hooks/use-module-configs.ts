import { useState, useEffect } from 'react'

export interface ModuleConfigRecord {
    id: string
    title: string
    description: string
    payload: string
    createdAt: string
    updatedAt: string
}

export interface ModuleConfigsResponse {
    items: ModuleConfigRecord[]
    total: number
    offset: number
    limit: number
}

export function useModuleConfigs() {
    const [configs, setConfigs] = useState<ModuleConfigRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchConfigs = async (offset = 0, limit = 20, searchQuery = '') => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
                ...(searchQuery && { q: searchQuery })
            })

            const response = await fetch(`http://localhost:3007/api/module-configs?${params}`)
            const data = await response.json()

            if (data.success) {
                setConfigs(data.data.items)
                return data.data as ModuleConfigsResponse
            } else {
                throw new Error(data.message || 'Failed to fetch module configs')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Failed to fetch module configs:', err)
            return null
        } finally {
            setLoading(false)
        }
    }

    const deleteConfig = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3007/api/module-configs/${id}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                setConfigs(prev => prev.filter(config => config.id !== id))
                return true
            } else {
                throw new Error(data.message || 'Failed to delete module config')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Failed to delete module config:', err)
            return false
        }
    }

    useEffect(() => {
        fetchConfigs()
    }, [])

    return {
        configs,
        loading,
        error,
        fetchConfigs,
        deleteConfig,
        refetch: () => fetchConfigs()
    }
}
