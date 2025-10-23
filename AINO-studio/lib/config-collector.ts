/**
 * AINO系统配置采集器 - Studio版本
 * 采集所有Studio和APP端的配置信息，通过iframe桥接获取APP配置
 */

// 导入Studio端配置
import { api } from './api'

// 配置采集器接口
export interface ConfigCollectorResult {
    studio: StudioConfigs
    app: AppConfigs
    metadata: ConfigMetadata
}

// Studio端配置接口
export interface StudioConfigs {
    manifest: ManifestConfig
    auth: AuthConfig
    pages: PageConfigs
    dataSources: DataSourceConfigs
    user: UserConfig
    modules: ModuleConfigs
}

// APP端配置接口（通过iframe桥接获取）
export interface AppConfigs {
    layout: any
    components: any
    design: any
    animation: any
    accessibility: any
    themes: any
    cards: any
    localStorage: Record<string, any>
}

// 配置元数据接口
export interface ConfigMetadata {
    version: string
    collectedAt: string
    source: string
    totalConfigs: number
    appConfigSource: 'iframe' | 'api' | 'local'
}

// 详细配置接口定义
export interface ManifestConfig {
    schemaVersion: string
    app: {
        appKey: string
        locale: string
        defaultLanguage: string
        theme: string
        bottomNav: Array<{
            key: string
            label: string
            icon?: string
            route: string
        }>
        pcTopNav: any[]
    }
}

export interface AuthConfig {
    layoutVariant: 'centered' | 'bottomDocked'
    showBackground: boolean
    backgroundImage?: string
    showLogo: boolean
    logoImage?: string
    showIntro: boolean
    introTitle?: { zh?: string; en?: string }
    introText?: { zh?: string; en?: string }
    titleColor?: string
    bodyColor?: string
    providers: Array<{
        key: string
        label: string
        enabled: boolean
    }>
}

export interface PageConfigs {
    [pageKey: string]: {
        title: string | { zh?: string; en?: string }
        route: string
        layout: 'mobile' | 'pc'
        category: string
        cards?: string[]
        cardsDefault?: string[]
        topBar?: {
            enabled: boolean
            tabs: Array<{ id?: string; title: string }>
        }
        contentNav?: {
            category: 'navigation' | 'status'
            style: 'icon' | 'text'
            type: 'text' | 'iconText'
            layout?: 'grid-4' | 'grid-5' | 'scroll'
            items?: any[]
        }
        overrides?: any
        visibility?: any
    }
}

export interface DataSourceConfigs {
    [dsKey: string]: {
        type: string
        tableId: string
        label?: string
        moduleName?: string
        tableName?: string
    }
}

export interface UserConfig {
    currentUser?: any
    preferences?: any
    settings?: any
}

export interface ModuleConfigs {
    [moduleKey: string]: {
        name: string
        description?: string
        version?: string
        config?: any
    }
}

// iframe桥接消息类型
interface IframeMessage {
    type: 'aino:config:request' | 'aino:config:response' | 'aino:config:error'
    payload?: any
    requestId?: string
}

/**
 * 配置采集器主函数
 * 采集所有Studio和APP端的配置信息
 */
export async function collectAllConfigs(): Promise<ConfigCollectorResult> {
    try {
        console.log('🔍 开始采集AINO系统配置...')

        // 采集Studio端配置
        const studioConfigs = await collectStudioConfigs()

        // 通过iframe桥接采集APP端配置
        const appConfigs = await collectAppConfigsViaIframe()

        // 生成元数据
        const metadata: ConfigMetadata = {
            version: '1.0.0',
            collectedAt: new Date().toISOString(),
            source: 'AINO Studio Config Collector',
            totalConfigs: countTotalConfigs(studioConfigs, appConfigs),
            appConfigSource: 'iframe'
        }

        const result: ConfigCollectorResult = {
            studio: studioConfigs,
            app: appConfigs,
            metadata
        }

        console.log('✅ 配置采集完成，总计配置项:', metadata.totalConfigs)
        return result

    } catch (error) {
        console.error('❌ 配置采集失败:', error)
        throw new Error(`配置采集失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
}

/**
 * 采集Studio端配置
 */
async function collectStudioConfigs(): Promise<StudioConfigs> {
    console.log('📋 采集Studio端配置...')

    try {
        // 1. 采集当前用户信息
        const userConfig = await collectUserConfig()

        // 2. 采集模块配置
        const moduleConfigs = await collectModuleConfigs()

        // 3. 采集应用配置（从当前页面状态获取）
        const manifest = await collectCurrentManifest()

        // 4. 采集认证配置
        const auth = await collectAuthConfig()

        // 5. 采集页面配置
        const pages = await collectPageConfigs()

        // 6. 采集数据源配置
        const dataSources = await collectDataSourceConfigs()

        return {
            manifest,
            auth,
            pages,
            dataSources,
            user: userConfig,
            modules: moduleConfigs
        }

    } catch (error) {
        console.error('❌ Studio配置采集失败:', error)
        throw error
    }
}

/**
 * 采集用户配置
 */
async function collectUserConfig(): Promise<UserConfig> {
    try {
        // 从localStorage获取用户信息
        const currentUser = localStorage.getItem('user')
        const preferences = localStorage.getItem('user_preferences')
        const settings = localStorage.getItem('user_settings')

        return {
            currentUser: currentUser ? JSON.parse(currentUser) : null,
            preferences: preferences ? JSON.parse(preferences) : null,
            settings: settings ? JSON.parse(settings) : null
        }
    } catch (error) {
        console.warn('⚠️ 用户配置采集失败:', error)
        return {}
    }
}

/**
 * 采集模块配置
 */
async function collectModuleConfigs(): Promise<ModuleConfigs> {
    try {
        // 从API获取模块配置
        const response = await api.modules.getAllModules()
        if (response.success && response.data) {
            const modules: ModuleConfigs = {}
            response.data.forEach((module: any) => {
                modules[module.key] = {
                    name: module.name,
                    description: module.description,
                    version: module.version,
                    config: module.config
                }
            })
            return modules
        }
        return {}
    } catch (error) {
        console.warn('⚠️ 模块配置采集失败:', error)
        return {}
    }
}

/**
 * 采集当前Manifest配置
 */
async function collectCurrentManifest(): Promise<ManifestConfig> {
    try {
        // 从当前页面状态获取manifest配置
        // 这里需要根据实际的Studio页面状态来获取
        const appId = getCurrentAppId()

        if (appId) {
            const response = await api.apps.getManifest(appId, 'draft')
            if (response.success && response.data) {
                return response.data
            }
        }

        // 返回默认配置
        return {
            schemaVersion: "1.0",
            app: {
                appKey: appId || "default-app",
                locale: "zh-CN",
                defaultLanguage: "zh",
                theme: "default",
                bottomNav: [
                    { key: "home", label: "首页", route: "/preview" },
                    { key: "me", label: "我的", route: "/profile" }
                ],
                pcTopNav: []
            }
        }
    } catch (error) {
        console.warn('⚠️ Manifest配置采集失败:', error)
        return {
            schemaVersion: "1.0",
            app: {
                appKey: "default-app",
                locale: "zh-CN",
                defaultLanguage: "zh",
                theme: "default",
                bottomNav: [],
                pcTopNav: []
            }
        }
    }
}

/**
 * 采集认证配置
 */
async function collectAuthConfig(): Promise<AuthConfig> {
    try {
        // 从localStorage或页面状态获取认证配置
        const authConfigStr = localStorage.getItem('auth_config')
        if (authConfigStr) {
            return JSON.parse(authConfigStr)
        }

        // 返回默认认证配置
        return {
            layoutVariant: 'centered',
            showBackground: true,
            backgroundImage: undefined,
            showLogo: true,
            logoImage: undefined,
            showIntro: true,
            introTitle: undefined,
            introText: undefined,
            titleColor: undefined,
            bodyColor: undefined,
            providers: [
                { key: "phone", label: "手机号登录", enabled: true },
                { key: "wechat", label: "微信登录", enabled: true },
                { key: "bytedance", label: "字节登录", enabled: false },
                { key: "google", label: "谷歌登录", enabled: true },
                { key: "apple", label: "苹果登录", enabled: true }
            ]
        }
    } catch (error) {
        console.warn('⚠️ 认证配置采集失败:', error)
        return {
            layoutVariant: 'centered',
            showBackground: true,
            providers: []
        }
    }
}

/**
 * 采集页面配置
 */
async function collectPageConfigs(): Promise<PageConfigs> {
    try {
        const appId = getCurrentAppId()
        if (appId) {
            const response = await api.apps.getManifest(appId, 'draft')
            if (response.success && response.data?.pages) {
                return response.data.pages
            }
        }
        return {}
    } catch (error) {
        console.warn('⚠️ 页面配置采集失败:', error)
        return {}
    }
}

/**
 * 采集数据源配置
 */
async function collectDataSourceConfigs(): Promise<DataSourceConfigs> {
    try {
        const appId = getCurrentAppId()
        if (appId) {
            const response = await api.apps.getManifest(appId, 'draft')
            if (response.success && response.data?.dataSources) {
                return response.data.dataSources
            }
        }
        return {}
    } catch (error) {
        console.warn('⚠️ 数据源配置采集失败:', error)
        return {}
    }
}

/**
 * 通过iframe桥接采集APP端配置
 */
async function collectAppConfigsViaIframe(): Promise<AppConfigs> {
    console.log('📱 通过iframe桥接采集APP端配置...')

    try {
        // 查找AINO-APP的iframe
        const iframe = findAppIframe()
        if (!iframe) {
            console.warn('⚠️ 未找到AINO-APP的iframe，使用默认配置')
            return getDefaultAppConfigs()
        }

        // 发送配置请求消息
        const requestId = generateRequestId()
        const message: IframeMessage = {
            type: 'aino:config:request',
            requestId
        }

        // 设置消息监听器
        const response = await sendMessageToIframe(iframe, message, requestId)

        if (response.success) {
            console.log('✅ APP配置采集成功')
            return response.data
        } else {
            console.warn('⚠️ APP配置采集失败，使用默认配置')
            return getDefaultAppConfigs()
        }

    } catch (error) {
        console.error('❌ iframe桥接配置采集失败:', error)
        return getDefaultAppConfigs()
    }
}

/**
 * 查找AINO-APP的iframe
 */
function findAppIframe(): HTMLIFrameElement | null {
    const iframes = document.querySelectorAll('iframe')
    for (const iframe of iframes) {
        try {
            // 检查iframe的src是否指向AINO-APP
            if (iframe.src && (
                iframe.src.includes('47.94.52.142::3002') ||
                iframe.src.includes('47.94.52.142::3005') ||
                iframe.src.includes('/preview') ||
                iframe.src.includes('/p/')
            )) {
                return iframe
            }
        } catch (error) {
            // 忽略跨域错误
            continue
        }
    }
    return null
}

/**
 * 向iframe发送消息并等待响应
 */
function sendMessageToIframe(
    iframe: HTMLIFrameElement,
    message: IframeMessage,
    requestId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve({ success: false, error: '请求超时' })
        }, 10000) // 10秒超时

        const messageHandler = (event: MessageEvent) => {
            if (event.source !== iframe.contentWindow) return

            const response = event.data as IframeMessage
            if (response.type === 'aino:config:response' && response.requestId === requestId) {
                clearTimeout(timeout)
                window.removeEventListener('message', messageHandler)
                resolve({ success: true, data: response.payload })
            } else if (response.type === 'aino:config:error' && response.requestId === requestId) {
                clearTimeout(timeout)
                window.removeEventListener('message', messageHandler)
                resolve({ success: false, error: response.payload?.message || '未知错误' })
            }
        }

        window.addEventListener('message', messageHandler)

        try {
            iframe.contentWindow?.postMessage(message, '*')
        } catch (error) {
            clearTimeout(timeout)
            window.removeEventListener('message', messageHandler)
            resolve({ success: false, error: '消息发送失败' })
        }
    })
}

/**
 * 获取默认APP配置
 */
function getDefaultAppConfigs(): AppConfigs {
    return {
        layout: {},
        components: {},
        design: {},
        animation: {},
        accessibility: {},
        themes: {},
        cards: {},
        localStorage: {}
    }
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
    return `config-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取当前应用ID
 */
function getCurrentAppId(): string | null {
    // 从URL路径中提取appId
    const path = window.location.pathname
    const match = path.match(/\/app\/([^\/]+)/)
    return match ? match[1] : null
}

/**
 * 计算配置总数
 */
function countTotalConfigs(studio: StudioConfigs, app: AppConfigs): number {
    let count = 0

    // 计算Studio配置数量
    count += Object.keys(studio.manifest).length
    count += Object.keys(studio.auth).length
    count += Object.keys(studio.pages).length
    count += Object.keys(studio.dataSources).length
    count += Object.keys(studio.user).length
    count += Object.keys(studio.modules).length

    // 计算APP配置数量
    count += Object.keys(app.layout).length
    count += Object.keys(app.components).length
    count += Object.keys(app.design).length
    count += Object.keys(app.animation).length
    count += Object.keys(app.accessibility).length
    count += Object.keys(app.themes).length
    count += Object.keys(app.cards).length
    count += Object.keys(app.localStorage).length

    return count
}

/**
 * 从本地存储采集Studio配置
 */
export function collectLocalStorageConfigs(): Record<string, any> {
    const configs: Record<string, any> = {}

    try {
        // 采集Studio相关的配置键
        const configKeys = [
            'aino_token',
            'user',
            'user_preferences',
            'user_settings',
            'auth_config',
            'app_config',
            'theme_config',
            'layout_config',
            'component_style_config',
            'design_tokens',
            'animation_config',
            'accessibility_config',
            'unified_theme',
            'semantic_tokens',
            'card_theme',
            'font_size_config',
            'current_app_id',
            'studio_settings'
        ]

        for (const key of configKeys) {
            const value = localStorage.getItem(key)
            if (value) {
                try {
                    configs[key] = JSON.parse(value)
                } catch {
                    configs[key] = value
                }
            }
        }

        console.log('📦 从localStorage采集到Studio配置项:', Object.keys(configs).length)
        return configs

    } catch (error) {
        console.error('❌ localStorage配置采集失败:', error)
        return {}
    }
}

/**
 * 从API采集Studio配置
 */
export async function collectApiConfigs(): Promise<Record<string, any>> {
    const configs: Record<string, any> = {}

    try {
        const appId = getCurrentAppId()

        if (appId) {
            // 采集应用配置
            try {
                const appResponse = await api.apps.getManifest(appId, 'draft')
                if (appResponse.success) {
                    configs.app_manifest_draft = appResponse.data
                }

                const publishedResponse = await api.apps.getManifest(appId, 'published')
                if (publishedResponse.success) {
                    configs.app_manifest_published = publishedResponse.data
                }
            } catch (error) {
                console.warn('⚠️ 应用配置API调用失败:', error)
            }

            // 采集页面配置
            try {
                const pageResponse = await api.pageConfigs.getAll()
                if (pageResponse.success) {
                    configs.page_configs = pageResponse.data
                }
            } catch (error) {
                console.warn('⚠️ 页面配置API调用失败:', error)
            }

            // 采集模块配置
            try {
                const moduleResponse = await api.modules.getAllModules()
                if (moduleResponse.success) {
                    configs.module_configs = moduleResponse.data
                }
            } catch (error) {
                console.warn('⚠️ 模块配置API调用失败:', error)
            }
        }

        console.log('🌐 从API采集到Studio配置项:', Object.keys(configs).length)
        return configs

    } catch (error) {
        console.error('❌ API配置采集失败:', error)
        return {}
    }
}

/**
 * 完整的配置采集函数
 * 采集所有配置源的数据
 */
export async function collectCompleteConfigs(): Promise<{
    system: ConfigCollectorResult
    local: Record<string, any>
    api: Record<string, any>
    summary: {
        totalSources: number
        totalConfigs: number
        collectedAt: string
    }
}> {
    console.log('🚀 开始完整配置采集...')

    try {
        // 并行采集所有配置源
        const [systemConfigs, localConfigs, apiConfigs] = await Promise.all([
            collectAllConfigs(),
            Promise.resolve(collectLocalStorageConfigs()),
            collectApiConfigs()
        ])

        const summary = {
            totalSources: 3,
            totalConfigs: systemConfigs.metadata.totalConfigs + Object.keys(localConfigs).length + Object.keys(apiConfigs).length,
            collectedAt: new Date().toISOString()
        }

        console.log('✅ 完整配置采集完成')
        console.log('📊 采集统计:', summary)

        return {
            system: systemConfigs,
            local: localConfigs,
            api: apiConfigs,
            summary
        }

    } catch (error) {
        console.error('❌ 完整配置采集失败:', error)
        throw error
    }
}

/**
 * 导出配置到JSON文件
 */
export function exportConfigsToJson(configs: any, filename: string = 'aino-studio-configs.json'): void {
    try {
        const jsonString = JSON.stringify(configs, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)
        console.log('📁 配置已导出到文件:', filename)

    } catch (error) {
        console.error('❌ 配置导出失败:', error)
    }
}

/**
 * 验证配置完整性
 */
export function validateConfigs(configs: ConfigCollectorResult): {
    isValid: boolean
    errors: string[]
    warnings: string[]
} {
    const errors: string[] = []
    const warnings: string[] = []

    try {
        // 验证Studio配置
        if (!configs.studio.manifest) {
            errors.push('Studio manifest配置缺失')
        }

        if (!configs.studio.auth) {
            errors.push('Studio auth配置缺失')
        }

        // 验证APP配置
        if (!configs.app) {
            errors.push('APP配置缺失')
        }

        // 验证元数据
        if (!configs.metadata) {
            errors.push('配置元数据缺失')
        }

        // 检查配置数量
        if (configs.metadata.totalConfigs < 5) {
            warnings.push('配置项数量较少，可能采集不完整')
        }

        // 检查APP配置来源
        if (configs.metadata.appConfigSource === 'iframe') {
            warnings.push('APP配置通过iframe获取，可能不完整')
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        }

    } catch (error) {
        return {
            isValid: false,
            errors: [`配置验证失败: ${error instanceof Error ? error.message : '未知错误'}`],
            warnings: []
        }
    }
}

// 默认导出主函数
export default collectAllConfigs
