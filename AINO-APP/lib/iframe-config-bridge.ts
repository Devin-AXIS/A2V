/**
 * AINO-APP iframe配置桥接
 * 处理来自Studio的配置请求，返回APP端配置信息
 */

// iframe消息类型
interface IframeMessage {
    type: 'aino:config:request' | 'aino:config:response' | 'aino:config:error'
    payload?: any
    requestId?: string
}

// APP配置接口
export interface AppConfigResponse {
    layout: any
    components: any
    design: any
    animation: any
    accessibility: any
    themes: any
    cards: any
    localStorage: Record<string, any>
    metadata: {
        collectedAt: string
        source: 'AINO-APP iframe bridge'
        totalConfigs: number
    }
}

/**
 * 初始化iframe配置桥接
 */
export function initIframeConfigBridge() {
    console.log('🌉 初始化AINO-APP iframe配置桥接...')

    // 监听来自父窗口的消息
    window.addEventListener('message', handleConfigRequest)

    console.log('✅ iframe配置桥接初始化完成')
}

/**
 * 处理配置请求消息
 */
async function handleConfigRequest(event: MessageEvent) {
    try {
        const message = event.data as IframeMessage

        // 只处理配置请求消息
        if (message.type !== 'aino:config:request') {
            return
        }

        console.log('📨 收到配置请求:', message.requestId)

        // 采集APP配置
        const appConfigs = await collectAppConfigs()

        // 发送响应消息
        const response: IframeMessage = {
            type: 'aino:config:response',
            requestId: message.requestId,
            payload: appConfigs
        }

        event.source?.postMessage(response, '*')
        console.log('📤 配置响应已发送:', message.requestId)

    } catch (error) {
        console.error('❌ 配置请求处理失败:', error)

        // 发送错误响应
        const errorResponse: IframeMessage = {
            type: 'aino:config:error',
            requestId: event.data?.requestId,
            payload: {
                message: error instanceof Error ? error.message : '配置采集失败'
            }
        }

        event.source?.postMessage(errorResponse, '*')
    }
}

/**
 * 采集APP端配置
 */
async function collectAppConfigs(): Promise<AppConfigResponse> {
    console.log('📱 开始采集APP端配置...')

    try {
        // 并行采集各种配置
        const [
            layoutConfigs,
            componentConfigs,
            designConfigs,
            animationConfigs,
            accessibilityConfigs,
            themeConfigs,
            cardConfigs,
            localStorageConfigs
        ] = await Promise.all([
            collectLayoutConfigs(),
            collectComponentConfigs(),
            collectDesignConfigs(),
            collectAnimationConfigs(),
            collectAccessibilityConfigs(),
            collectThemeConfigs(),
            collectCardConfigs(),
            collectLocalStorageConfigs()
        ])

        const totalConfigs =
            Object.keys(layoutConfigs).length +
            Object.keys(componentConfigs).length +
            Object.keys(designConfigs).length +
            Object.keys(animationConfigs).length +
            Object.keys(accessibilityConfigs).length +
            Object.keys(themeConfigs).length +
            Object.keys(cardConfigs).length +
            Object.keys(localStorageConfigs).length

        const result: AppConfigResponse = {
            layout: layoutConfigs,
            components: componentConfigs,
            design: designConfigs,
            animation: animationConfigs,
            accessibility: accessibilityConfigs,
            themes: themeConfigs,
            cards: cardConfigs,
            localStorage: localStorageConfigs,
            metadata: {
                collectedAt: new Date().toISOString(),
                source: 'AINO-APP iframe bridge',
                totalConfigs
            }
        }

        console.log('✅ APP配置采集完成，总计配置项:', totalConfigs)
        return result

    } catch (error) {
        console.error('❌ APP配置采集失败:', error)
        throw error
    }
}

/**
 * 采集布局配置
 */
async function collectLayoutConfigs(): Promise<any> {
    try {
        // 从localStorage获取布局配置
        const layoutConfig = localStorage.getItem('layout_config')
        const layoutPreset = localStorage.getItem('layout_preset')

        return {
            current: layoutConfig ? JSON.parse(layoutConfig) : null,
            preset: layoutPreset || 'default',
            available: ['default', 'compact', 'spacious', 'topbar', 'fullscreen', 'split']
        }
    } catch (error) {
        console.warn('⚠️ 布局配置采集失败:', error)
        return {}
    }
}

/**
 * 采集组件配置
 */
async function collectComponentConfigs(): Promise<any> {
    try {
        const componentConfig = localStorage.getItem('component_style_config')
        const componentPreset = localStorage.getItem('component_preset')

        return {
            current: componentConfig ? JSON.parse(componentConfig) : null,
            preset: componentPreset || 'default',
            available: ['default', 'modern', 'minimal', 'colorful']
        }
    } catch (error) {
        console.warn('⚠️ 组件配置采集失败:', error)
        return {}
    }
}

/**
 * 采集设计配置
 */
async function collectDesignConfigs(): Promise<any> {
    try {
        const designTokens = localStorage.getItem('design_tokens')
        const designPreset = localStorage.getItem('design_preset')
        const semanticTokens = localStorage.getItem('semantic_tokens')

        return {
            tokens: designTokens ? JSON.parse(designTokens) : null,
            preset: designPreset || 'light',
            semantic: semanticTokens ? JSON.parse(semanticTokens) : null,
            available: ['light', 'dark', 'minimal']
        }
    } catch (error) {
        console.warn('⚠️ 设计配置采集失败:', error)
        return {}
    }
}

/**
 * 采集动画配置
 */
async function collectAnimationConfigs(): Promise<any> {
    try {
        const animationConfig = localStorage.getItem('animation_config')
        const animationPreset = localStorage.getItem('animation_preset')
        const reducedMotion = localStorage.getItem('reduced_motion')

        return {
            current: animationConfig ? JSON.parse(animationConfig) : null,
            preset: animationPreset || 'default',
            reducedMotion: reducedMotion === 'true',
            available: ['default', 'minimal', 'enhanced']
        }
    } catch (error) {
        console.warn('⚠️ 动画配置采集失败:', error)
        return {}
    }
}

/**
 * 采集可访问性配置
 */
async function collectAccessibilityConfigs(): Promise<any> {
    try {
        const accessibilityConfig = localStorage.getItem('accessibility_config')
        const highContrast = localStorage.getItem('high_contrast')
        const screenReader = localStorage.getItem('screen_reader_mode')

        return {
            current: accessibilityConfig ? JSON.parse(accessibilityConfig) : null,
            highContrast: highContrast === 'true',
            screenReader: screenReader === 'true',
            preferences: {
                reducedMotion: localStorage.getItem('reduced_motion') === 'true',
                highContrast: highContrast === 'true',
                screenReader: screenReader === 'true'
            }
        }
    } catch (error) {
        console.warn('⚠️ 可访问性配置采集失败:', error)
        return {}
    }
}

/**
 * 采集主题配置
 */
async function collectThemeConfigs(): Promise<any> {
    try {
        const unifiedTheme = localStorage.getItem('unified_theme')
        const cardTheme = localStorage.getItem('card_theme')
        const themePreset = localStorage.getItem('theme_preset')

        return {
            unified: unifiedTheme ? JSON.parse(unifiedTheme) : null,
            card: cardTheme ? JSON.parse(cardTheme) : null,
            preset: themePreset || 'default',
            available: ['default', 'modern', 'minimal', 'classic', 'nature']
        }
    } catch (error) {
        console.warn('⚠️ 主题配置采集失败:', error)
        return {}
    }
}

/**
 * 采集卡片配置
 */
async function collectCardConfigs(): Promise<any> {
    try {
        const cardLayouts = localStorage.getItem('card_layouts')
        const cardThemes = localStorage.getItem('card_themes')
        const cardRegistry = localStorage.getItem('card_registry')

        return {
            layouts: cardLayouts ? JSON.parse(cardLayouts) : {},
            themes: cardThemes ? JSON.parse(cardThemes) : {},
            registry: cardRegistry ? JSON.parse(cardRegistry) : [],
            current: {
                layout: localStorage.getItem('current_card_layout') || 'default',
                theme: localStorage.getItem('current_card_theme') || 'default'
            }
        }
    } catch (error) {
        console.warn('⚠️ 卡片配置采集失败:', error)
        return {}
    }
}

/**
 * 采集localStorage配置
 */
async function collectLocalStorageConfigs(): Promise<Record<string, any>> {
    const configs: Record<string, any> = {}

    try {
        // 采集APP相关的配置键
        const configKeys = [
            'CURRENT_APP_ID',
            'CURRENT_APP_NAV_ITEMS',
            'APP_GLOBAL_CONFIG',
            'APP_PAGE_',
            'dynamic_page_layout_',
            'layout_config',
            'component_style_config',
            'design_tokens',
            'animation_config',
            'accessibility_config',
            'unified_theme',
            'semantic_tokens',
            'card_theme',
            'font_size_config',
            'theme_config',
            'layout_preset',
            'component_preset',
            'design_preset',
            'animation_preset',
            'theme_preset',
            'high_contrast',
            'screen_reader_mode',
            'reduced_motion',
            'card_layouts',
            'card_themes',
            'card_registry',
            'current_card_layout',
            'current_card_theme'
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

        console.log('📦 从localStorage采集到APP配置项:', Object.keys(configs).length)
        return configs

    } catch (error) {
        console.error('❌ localStorage配置采集失败:', error)
        return {}
    }
}

/**
 * 清理iframe配置桥接
 */
export function cleanupIframeConfigBridge() {
    console.log('🧹 清理iframe配置桥接...')
    window.removeEventListener('message', handleConfigRequest)
    console.log('✅ iframe配置桥接已清理')
}

// 自动初始化（如果是在iframe中运行）
if (typeof window !== 'undefined' && window !== window.parent) {
    initIframeConfigBridge()
}

export default {
    initIframeConfigBridge,
    cleanupIframeConfigBridge,
    collectAppConfigs
}
