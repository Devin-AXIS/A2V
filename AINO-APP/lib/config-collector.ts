/**
 * AINO系统配置采集器
 * 采集所有Studio和APP端的配置信息，返回完整的JSON配置对象
 */

import type {
    LayoutConfig,
    ComponentStyleConfig,
    DesignTokens,
    AnimationConfig,
    AccessibilityConstraints,
    UnifiedThemePreset,
    SemanticTokens,
    CardConfig
} from "@/types"
import { http } from "@/lib/request"

// 导入所有配置
import { defaultLayoutConfig, layoutPresets } from "@/config/layout-config"
import { defaultComponentStyleConfig, componentStylePresets } from "@/config/component-style-config"
import { defaultDesignTokens, designTokenPresets } from "@/config/design-tokens"
import { animationDurations, animationEasings, animationPresets, componentAnimations, pageTransitions } from "@/config/animation-config"
import { contrastRequirements, focusManagementConstraints, keyboardNavigationConstraints, screenReaderConstraints, motionPreferences } from "@/config/accessibility-constraints"
import { unifiedThemePresets } from "@/config/unified-theme-presets"
import { semanticTokenMapping, semanticContexts } from "@/config/semantic-tokens"
import { cardThemePresets } from "@/config/card-theme"

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
}

// APP端配置接口
export interface AppConfigs {
    layout: LayoutConfigs
    components: ComponentConfigs
    design: DesignConfigs
    animation: AnimationConfigs
    accessibility: AccessibilityConfigs
    themes: ThemeConfigs
    cards: CardConfigs
}

// 配置元数据接口
export interface ConfigMetadata {
    version: string
    collectedAt: string
    source: string
    totalConfigs: number
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

export interface LayoutConfigs {
    default: LayoutConfig
    presets: typeof layoutPresets
}

export interface ComponentConfigs {
    default: ComponentStyleConfig
    presets: typeof componentStylePresets
}

export interface DesignConfigs {
    tokens: DesignTokens
    presets: typeof designTokenPresets
    semantic: {
        mapping: typeof semanticTokenMapping
        contexts: typeof semanticContexts
    }
}

export interface AnimationConfigs {
    durations: typeof animationDurations
    easings: typeof animationEasings
    presets: typeof animationPresets
    components: typeof componentAnimations
    pageTransitions: typeof pageTransitions
}

export interface AccessibilityConfigs {
    contrast: typeof contrastRequirements
    focus: typeof focusManagementConstraints
    keyboard: typeof keyboardNavigationConstraints
    screenReader: typeof screenReaderConstraints
    motion: typeof motionPreferences
}

export interface ThemeConfigs {
    unified: UnifiedThemePreset[]
    card: typeof cardThemePresets
}

export interface CardConfigs {
    registry: CardConfig[]
    layouts: any
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

        // 采集APP端配置
        const appConfigs = await collectAppConfigs()

        // 生成元数据
        const metadata: ConfigMetadata = {
            version: '1.0.0',
            collectedAt: new Date().toISOString(),
            source: 'AINO Config Collector',
            totalConfigs: countTotalConfigs(studioConfigs, appConfigs)
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

    // 模拟从Studio获取的配置（实际应用中应该从API或存储中获取）
    const manifest: ManifestConfig = {
        schemaVersion: "1.0",
        app: {
            appKey: "default-app",
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

    const auth: AuthConfig = {
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

    const pages: PageConfigs = {
        home: {
            title: { zh: "首页", en: "Home" },
            route: "/home",
            layout: "mobile",
            category: "workspace",
            cardsDefault: ["universal-info", "quick-actions"]
        }
    }

    const dataSources: DataSourceConfigs = {}

    return {
        manifest,
        auth,
        pages,
        dataSources
    }
}

/**
 * 采集APP端配置
 */
async function collectAppConfigs(): Promise<AppConfigs> {
    console.log('📱 采集APP端配置...')

    // 布局配置
    const layout: LayoutConfigs = {
        default: defaultLayoutConfig,
        presets: layoutPresets
    }

    // 组件配置
    const components: ComponentConfigs = {
        default: defaultComponentStyleConfig,
        presets: componentStylePresets
    }

    // 设计配置
    const design: DesignConfigs = {
        tokens: defaultDesignTokens,
        presets: designTokenPresets,
        semantic: {
            mapping: semanticTokenMapping,
            contexts: semanticContexts
        }
    }

    // 动画配置
    const animation: AnimationConfigs = {
        durations: animationDurations,
        easings: animationEasings,
        presets: animationPresets,
        components: componentAnimations,
        pageTransitions: pageTransitions
    }

    // 可访问性配置
    const accessibility: AccessibilityConfigs = {
        contrast: contrastRequirements,
        focus: focusManagementConstraints,
        keyboard: keyboardNavigationConstraints,
        screenReader: screenReaderConstraints,
        motion: motionPreferences
    }

    // 主题配置
    const themes: ThemeConfigs = {
        unified: unifiedThemePresets,
        card: cardThemePresets
    }

    // 卡片配置
    const cards: CardConfigs = {
        registry: [], // 实际应用中应该从卡片注册表获取
        layouts: {} // 实际应用中应该从布局管理器获取
    }

    return {
        layout,
        components,
        design,
        animation,
        accessibility,
        themes,
        cards
    }
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

    // 计算APP配置数量
    count += Object.keys(app.layout.default).length
    count += Object.keys(app.layout.presets).length
    count += Object.keys(app.components.default).length
    count += Object.keys(app.components.presets).length
    count += Object.keys(app.design.tokens).length
    count += Object.keys(app.design.presets).length
    count += Object.keys(app.design.semantic.mapping).length
    count += Object.keys(app.design.semantic.contexts).length
    count += Object.keys(app.animation.durations).length
    count += Object.keys(app.animation.easings).length
    count += Object.keys(app.animation.presets).length
    count += Object.keys(app.animation.components).length
    count += Object.keys(app.animation.pageTransitions).length
    count += Object.keys(app.accessibility.contrast).length
    count += Object.keys(app.accessibility.focus).length
    count += Object.keys(app.accessibility.keyboard).length
    count += Object.keys(app.accessibility.screenReader).length
    count += Object.keys(app.accessibility.motion).length
    count += app.themes.unified.length
    count += app.themes.card.length
    count += app.cards.registry.length
    count += Object.keys(app.cards.layouts).length

    return count
}

/**
 * 从本地存储采集配置
 * 采集当前存储在localStorage中的配置
 */
export function collectLocalStorageConfigs(): Record<string, any> {
    const configs: Record<string, any> = {}

    try {
        // 采集常见的配置键
        const configKeys = [
            'CURRENT_APP_ID',
            'CURRENT_APP_NAV_ITEMS',
            'APP_GLOBAL_CONFIG',
            'APP_PAGE_',
            'dynamic_page_layout_',
            'aino_token',
            'user',
            'theme_config',
            'layout_config',
            'component_style_config',
            'design_tokens',
            'animation_config',
            'accessibility_config',
            'unified_theme',
            'semantic_tokens',
            'card_theme',
            'font_size_config'
        ]

        for (const key of configKeys) {
            // 检查精确匹配
            const value = localStorage.getItem(key)
            if (value) {
                try {
                    configs[key] = JSON.parse(value)
                } catch {
                    configs[key] = value
                }
            }

            // 检查前缀匹配
            for (let i = 0; i < localStorage.length; i++) {
                const storageKey = localStorage.key(i)
                if (storageKey && storageKey.startsWith(key)) {
                    const storageValue = localStorage.getItem(storageKey)
                    if (storageValue) {
                        try {
                            configs[storageKey] = JSON.parse(storageValue)
                        } catch {
                            configs[storageKey] = storageValue
                        }
                    }
                }
            }
        }

        console.log('📦 从localStorage采集到配置项:', Object.keys(configs).length)
        return configs

    } catch (error) {
        console.error('❌ localStorage配置采集失败:', error)
        return {}
    }
}

/**
 * 从API采集配置
 * 从后端API获取配置信息
 */
export async function collectApiConfigs(): Promise<Record<string, any>> {
    const configs: Record<string, any> = {}

    try {
        const baseUrl = 'http://localhost:3007'

        // 采集应用配置
        try {
            const appResponse = await http.get('/api/apps/default-app/manifest?state=published')
            configs.app_manifest = appResponse
        } catch (error) {
            console.warn('⚠️ 应用配置API调用失败:', error)
        }

        // 采集页面配置
        try {
            const pageResponse = await http.get('/api/page-configs')
            configs.page_configs = pageResponse
        } catch (error) {
            console.warn('⚠️ 页面配置API调用失败:', error)
        }

        // 采集预览配置
        try {
            const previewResponse = await http.get('/api/preview-manifests')
            configs.preview_configs = previewResponse
        } catch (error) {
            console.warn('⚠️ 预览配置API调用失败:', error)
        }

        console.log('🌐 从API采集到配置项:', Object.keys(configs).length)
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
export function exportConfigsToJson(configs: any, filename: string = 'aino-configs.json'): void {
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
        if (!configs.app.layout) {
            errors.push('APP layout配置缺失')
        }

        if (!configs.app.components) {
            errors.push('APP components配置缺失')
        }

        if (!configs.app.design) {
            errors.push('APP design配置缺失')
        }

        // 验证元数据
        if (!configs.metadata) {
            errors.push('配置元数据缺失')
        }

        // 检查配置数量
        if (configs.metadata.totalConfigs < 10) {
            warnings.push('配置项数量较少，可能采集不完整')
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
