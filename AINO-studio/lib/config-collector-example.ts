/**
 * AINO配置采集器使用示例 - Studio版本
 * 展示如何在Studio中使用配置采集器获取所有配置信息
 */

import {
    collectAllConfigs,
    collectCompleteConfigs,
    collectLocalStorageConfigs,
    collectApiConfigs,
    exportConfigsToJson,
    validateConfigs
} from './config-collector'

/**
 * 基础配置采集示例
 */
export async function basicConfigCollectionExample() {
    console.log('=== 基础配置采集示例 ===')

    try {
        // 采集所有系统配置
        const configs = await collectAllConfigs()

        console.log('📋 采集到的配置结构:')
        console.log('- Studio配置:', Object.keys(configs.studio))
        console.log('- APP配置:', Object.keys(configs.app))
        console.log('- 元数据:', configs.metadata)

        // 验证配置
        const validation = validateConfigs(configs)
        console.log('✅ 配置验证结果:', validation)

        return configs

    } catch (error) {
        console.error('❌ 基础配置采集失败:', error)
        throw error
    }
}

/**
 * 完整配置采集示例
 */
export async function completeConfigCollectionExample() {
    console.log('=== 完整配置采集示例 ===')

    try {
        // 采集所有配置源
        const completeConfigs = await collectCompleteConfigs()

        console.log('📊 完整配置采集结果:')
        console.log('- 系统配置项数:', completeConfigs.system.metadata.totalConfigs)
        console.log('- 本地存储配置项数:', Object.keys(completeConfigs.local).length)
        console.log('- API配置项数:', Object.keys(completeConfigs.api).length)
        console.log('- 总计配置项数:', completeConfigs.summary.totalConfigs)

        // 导出配置到JSON文件
        exportConfigsToJson(completeConfigs, 'aino-studio-complete-configs.json')

        return completeConfigs

    } catch (error) {
        console.error('❌ 完整配置采集失败:', error)
        throw error
    }
}

/**
 * 分步配置采集示例
 */
export async function stepByStepConfigCollectionExample() {
    console.log('=== 分步配置采集示例 ===')

    try {
        // 1. 采集系统配置
        console.log('1️⃣ 采集系统配置...')
        const systemConfigs = await collectAllConfigs()

        // 2. 采集本地存储配置
        console.log('2️⃣ 采集本地存储配置...')
        const localConfigs = collectLocalStorageConfigs()

        // 3. 采集API配置
        console.log('3️⃣ 采集API配置...')
        const apiConfigs = await collectApiConfigs()

        // 4. 合并所有配置
        const mergedConfigs = {
            system: systemConfigs,
            local: localConfigs,
            api: apiConfigs,
            mergedAt: new Date().toISOString()
        }

        console.log('📦 合并后的配置结构:')
        console.log('- 系统配置:', Object.keys(mergedConfigs.system))
        console.log('- 本地配置:', Object.keys(mergedConfigs.local))
        console.log('- API配置:', Object.keys(mergedConfigs.api))

        return mergedConfigs

    } catch (error) {
        console.error('❌ 分步配置采集失败:', error)
        throw error
    }
}

/**
 * 配置分析和报告示例
 */
export async function configAnalysisExample() {
    console.log('=== 配置分析和报告示例 ===')

    try {
        const configs = await collectAllConfigs()

        // 分析Studio配置
        const studioAnalysis = {
            manifest: {
                hasAppKey: !!configs.studio.manifest.app.appKey,
                hasBottomNav: configs.studio.manifest.app.bottomNav.length > 0,
                navItems: configs.studio.manifest.app.bottomNav.length
            },
            auth: {
                hasProviders: configs.studio.auth.providers.length > 0,
                enabledProviders: configs.studio.auth.providers.filter(p => p.enabled).length,
                totalProviders: configs.studio.auth.providers.length
            },
            pages: {
                totalPages: Object.keys(configs.studio.pages).length,
                pageKeys: Object.keys(configs.studio.pages)
            },
            dataSources: {
                totalDataSources: Object.keys(configs.studio.dataSources).length,
                dataSourceKeys: Object.keys(configs.studio.dataSources)
            },
            user: {
                hasCurrentUser: !!configs.studio.user.currentUser,
                hasPreferences: !!configs.studio.user.preferences,
                hasSettings: !!configs.studio.user.settings
            },
            modules: {
                totalModules: Object.keys(configs.studio.modules).length,
                moduleKeys: Object.keys(configs.studio.modules)
            }
        }

        // 分析APP配置
        const appAnalysis = {
            layout: {
                hasConfig: Object.keys(configs.app.layout).length > 0,
                configKeys: Object.keys(configs.app.layout)
            },
            components: {
                hasConfig: Object.keys(configs.app.components).length > 0,
                configKeys: Object.keys(configs.app.components)
            },
            design: {
                hasConfig: Object.keys(configs.app.design).length > 0,
                configKeys: Object.keys(configs.app.design)
            },
            animation: {
                hasConfig: Object.keys(configs.app.animation).length > 0,
                configKeys: Object.keys(configs.app.animation)
            },
            accessibility: {
                hasConfig: Object.keys(configs.app.accessibility).length > 0,
                configKeys: Object.keys(configs.app.accessibility)
            },
            themes: {
                hasConfig: Object.keys(configs.app.themes).length > 0,
                configKeys: Object.keys(configs.app.themes)
            },
            cards: {
                hasConfig: Object.keys(configs.app.cards).length > 0,
                configKeys: Object.keys(configs.app.cards)
            },
            localStorage: {
                totalItems: Object.keys(configs.app.localStorage).length,
                itemKeys: Object.keys(configs.app.localStorage)
            }
        }

        const analysisReport = {
            studio: studioAnalysis,
            app: appAnalysis,
            metadata: configs.metadata,
            analysisAt: new Date().toISOString()
        }

        console.log('📊 配置分析报告:')
        console.log(JSON.stringify(analysisReport, null, 2))

        // 导出分析报告
        exportConfigsToJson(analysisReport, 'aino-studio-config-analysis.json')

        return analysisReport

    } catch (error) {
        console.error('❌ 配置分析失败:', error)
        throw error
    }
}

/**
 * 配置对比示例
 */
export async function configComparisonExample() {
    console.log('=== 配置对比示例 ===')

    try {
        // 采集当前配置
        const currentConfigs = await collectAllConfigs()

        // 模拟历史配置（实际应用中应该从存储中获取）
        const historicalConfigs = {
            ...currentConfigs,
            metadata: {
                ...currentConfigs.metadata,
                collectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24小时前
                version: '0.9.0'
            }
        }

        // 对比配置变化
        const comparison = {
            current: currentConfigs,
            historical: historicalConfigs,
            changes: {
                versionChanged: currentConfigs.metadata.version !== historicalConfigs.metadata.version,
                configCountChanged: currentConfigs.metadata.totalConfigs !== historicalConfigs.metadata.totalConfigs,
                appConfigSourceChanged: currentConfigs.metadata.appConfigSource !== historicalConfigs.metadata.appConfigSource,
                collectedAt: {
                    current: currentConfigs.metadata.collectedAt,
                    historical: historicalConfigs.metadata.collectedAt
                }
            },
            comparedAt: new Date().toISOString()
        }

        console.log('🔄 配置对比结果:')
        console.log('- 版本变化:', comparison.changes.versionChanged)
        console.log('- 配置数量变化:', comparison.changes.configCountChanged)
        console.log('- APP配置来源变化:', comparison.changes.appConfigSourceChanged)
        console.log('- 当前版本:', currentConfigs.metadata.version)
        console.log('- 历史版本:', historicalConfigs.metadata.version)

        return comparison

    } catch (error) {
        console.error('❌ 配置对比失败:', error)
        throw error
    }
}

/**
 * 配置备份示例
 */
export async function configBackupExample() {
    console.log('=== 配置备份示例 ===')

    try {
        const configs = await collectCompleteConfigs()

        // 创建备份配置
        const backup = {
            ...configs,
            backup: {
                createdAt: new Date().toISOString(),
                version: '1.0.0',
                description: 'AINO Studio系统配置完整备份',
                source: 'AINO Studio Config Collector',
                totalSize: JSON.stringify(configs).length
            }
        }

        // 导出备份文件
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `aino-studio-config-backup-${timestamp}.json`
        exportConfigsToJson(backup, filename)

        console.log('💾 配置备份完成:')
        console.log('- 备份文件:', filename)
        console.log('- 备份大小:', backup.backup.totalSize, 'bytes')
        console.log('- 备份时间:', backup.backup.createdAt)

        return backup

    } catch (error) {
        console.error('❌ 配置备份失败:', error)
        throw error
    }
}

/**
 * iframe桥接测试示例
 */
export async function iframeBridgeTestExample() {
    console.log('=== iframe桥接测试示例 ===')

    try {
        const configs = await collectAllConfigs()

        // 测试iframe桥接是否正常工作
        const bridgeTest = {
            appConfigSource: configs.metadata.appConfigSource,
            hasAppConfigs: Object.keys(configs.app).length > 0,
            appConfigKeys: Object.keys(configs.app),
            localStorageItems: Object.keys(configs.app.localStorage).length,
            bridgeWorking: configs.metadata.appConfigSource === 'iframe' && Object.keys(configs.app).length > 0
        }

        console.log('🌉 iframe桥接测试结果:')
        console.log('- 桥接工作正常:', bridgeTest.bridgeWorking)
        console.log('- APP配置来源:', bridgeTest.appConfigSource)
        console.log('- APP配置项数:', bridgeTest.appConfigKeys.length)
        console.log('- 本地存储项数:', bridgeTest.localStorageItems)

        if (!bridgeTest.bridgeWorking) {
            console.warn('⚠️ iframe桥接可能存在问题，请检查:')
            console.warn('1. AINO-APP是否在iframe中运行')
            console.warn('2. iframe配置桥接是否已初始化')
            console.warn('3. 跨域设置是否正确')
        }

        return bridgeTest

    } catch (error) {
        console.error('❌ iframe桥接测试失败:', error)
        throw error
    }
}

/**
 * 主函数 - 运行所有示例
 */
export async function runAllExamples() {
    console.log('🚀 开始运行所有Studio配置采集示例...')

    try {
        // 运行所有示例
        const results = await Promise.allSettled([
            basicConfigCollectionExample(),
            completeConfigCollectionExample(),
            stepByStepConfigCollectionExample(),
            configAnalysisExample(),
            configComparisonExample(),
            configBackupExample(),
            iframeBridgeTestExample()
        ])

        // 统计结果
        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        console.log('📊 示例运行结果:')
        console.log('- 成功:', successful)
        console.log('- 失败:', failed)
        console.log('- 总计:', results.length)

        // 输出失败的原因
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`❌ 示例 ${index + 1} 失败:`, result.reason)
            }
        })

        return {
            results,
            summary: {
                total: results.length,
                successful,
                failed,
                completedAt: new Date().toISOString()
            }
        }

    } catch (error) {
        console.error('❌ 示例运行失败:', error)
        throw error
    }
}

// 导出所有示例函数
export {
    basicConfigCollectionExample,
    completeConfigCollectionExample,
    stepByStepConfigCollectionExample,
    configAnalysisExample,
    configComparisonExample,
    configBackupExample,
    iframeBridgeTestExample,
    runAllExamples
}
