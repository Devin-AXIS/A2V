/**
 * Unified Data Sources utilities for preview/runtime
 * - Resolve data source from Manifest
 * - Build URL with params replacement
 * - Attach application context headers and optional appUser auth
 * - Fetch data with basic error handling
 */

export type DataSourceAuthType = "server" | "appUser" | undefined

export interface ManifestLike {
    app?: { appKey?: string }
    dataSources?: Record<string, {
        type?: string
        method?: string
        url: string
        auth?: DataSourceAuthType
    }>
}

export interface QueryOptions {
    params?: Record<string, any>
    selectPath?: string // e.g. "$.data.records" -> dot path "data.records"
    baseUrl?: string // default: http://localhost:3007
}

function getApplicationId(manifest?: ManifestLike): string | null {
    try {
        const fromManifest = manifest?.app?.appKey
        if (fromManifest) return String(fromManifest)
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('CURRENT_APP_ID')
            if (raw) return String(raw)
        }
    } catch { }
    return null
}

function getAppUserToken(): string | null {
    try {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('APP_USER_TOKEN')
            if (raw) return String(raw)
        }
    } catch { }
    return null
}

function buildUrl(template: string, params?: Record<string, any>): string {
    if (!params) return template
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        const value = params[key]
        return value == null ? '' : encodeURIComponent(String(value))
    })
}

function applySelectPath<T = any>(data: any, selectPath?: string): T {
    if (!selectPath) return data as T
    // very small helper: support "$.a.b.c" or "a.b.c"
    const path = selectPath.startsWith('$.') ? selectPath.slice(2) : (selectPath.startsWith('$') ? selectPath.slice(1) : selectPath)
    if (!path) return data as T
    return path.split('.').reduce<any>((acc, key) => (acc && key in acc ? acc[key] : undefined), data) as T
}

export function resolveDataSource(manifest: ManifestLike | undefined, sourceName: string) {
    if (!manifest?.dataSources) return undefined
    return manifest.dataSources[sourceName]
}

export async function queryDataSource<T = any>(
    manifest: ManifestLike | undefined,
    sourceName: string,
    options?: QueryOptions
): Promise<T> {
    const ds = resolveDataSource(manifest, sourceName)
    if (!ds?.url) throw new Error(`DataSource not found: ${sourceName}`)

    const appId = getApplicationId(manifest)
    const method = (ds.method || 'GET').toUpperCase()
    const baseUrl = options?.baseUrl || 'http://localhost:3007'
    const urlPath = buildUrl(ds.url, options?.params)
    // Prefer absolute server base to avoid proxy
    const requestUrl = urlPath.startsWith('http') ? urlPath : `${baseUrl}${urlPath}`

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (appId) {
        headers['x-application-id'] = appId
    }
    // For compatibility, append applicationId query as well when not present in template
    const urlObj = new URL(requestUrl)
    if (appId && !urlObj.searchParams.has('applicationId')) {
        urlObj.searchParams.set('applicationId', appId)
    }

    if (ds.auth === 'appUser') {
        const token = getAppUserToken()
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(urlObj.toString(), {
        method,
        headers,
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
        const message = (body && (body.message || body.error)) || `Request failed: ${res.status}`
        throw new Error(message)
    }
    const payload = (body && (body.data ?? body))
    return applySelectPath<T>(payload, options?.selectPath)
}

export async function loadPageData(
    manifest: ManifestLike | undefined,
    page: any,
    baseUrl?: string
): Promise<Record<string, any>> {
    const result: Record<string, any> = {}
    if (!manifest || !page || !page.data || typeof page.data !== 'object') return result

    const entries = Object.entries(page.data) as Array<[string, any]>
    for (const [key, cfg] of entries) {
        try {
            const sourceName: string | undefined = cfg?.source
            const params: Record<string, any> | undefined = cfg?.params
            const selectPath: string | undefined = cfg?.select
            if (!sourceName) continue
            result[key] = await queryDataSource(manifest, sourceName, { params, selectPath, baseUrl })
        } catch (e) {
            // Store the error message to make debugging easier in preview
            result[key] = { __error: (e as any)?.message || 'fetch error' }
        }
    }
    return result
}


