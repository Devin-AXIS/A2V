/**
 * AINO配置采集器测试文件 - Studio版本
 * 用于验证Studio配置采集器的功能
 */

import {
    collectAllConfigs,
    collectCompleteConfigs,
    validateConfigs,
    exportConfigsToJson
} from './config-collector'

/**
 * 测试基础配置采集功能
 */
export async function testBasicConfigCollection() {
    console.log('🧪 测试基础配置采集功能...')

    try {
        const configs = await collectAllConfigs()

        // 验证返回结构
        const hasStudio = !!configs.studio
        const hasApp = !!configs.app
        const hasMetadata = !!configs.metadata

        console.log('✅ 基础配置采集测试通过')
        console.log('- Studio配置存在:', hasStudio)
        console.log('- APP配置存在:', hasApp)
        console.log('- 元数据存在:', hasMetadata)
        console.log('- 总配置项数:', configs.metadata.totalConfigs)
        console.log('- APP配置来源:', configs.metadata.appConfigSource)

        return {
            success: true,
            hasStudio,
            hasApp,
            hasMetadata,
            totalConfigs: configs.metadata.totalConfigs,
            appConfigSource: configs.metadata.appConfigSource
        }

    } catch (error) {
        console.error('❌ 基础配置采集测试失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }
    }
}

/**
 * 测试配置验证功能
 */
export async function testConfigValidation() {
    console.log('🧪 测试配置验证功能...')

    try {
        const configs = await collectAllConfigs()
        const validation = validateConfigs(configs)

        console.log('✅ 配置验证测试完成')
        console.log('- 验证通过:', validation.isValid)
        console.log('- 错误数量:', validation.errors.length)
        console.log('- 警告数量:', validation.warnings.length)

        if (validation.errors.length > 0) {
            console.log('❌ 验证错误:', validation.errors)
        }

        if (validation.warnings.length > 0) {
            console.log('⚠️ 验证警告:', validation.warnings)
        }

        return {
            success: validation.isValid,
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings
        }

    } catch (error) {
        console.error('❌ 配置验证测试失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }
    }
}

/**
 * 测试完整配置采集功能
 */
export async function testCompleteConfigCollection() {
    console.log('🧪 测试完整配置采集功能...')

    try {
        const completeConfigs = await collectCompleteConfigs()

        const hasSystem = !!completeConfigs.system
        const hasLocal = !!completeConfigs.local
        const hasApi = !!completeConfigs.api
        const hasSummary = !!completeConfigs.summary

        console.log('✅ 完整配置采集测试通过')
        console.log('- 系统配置存在:', hasSystem)
        console.log('- 本地配置存在:', hasLocal)
        console.log('- API配置存在:', hasApi)
        console.log('- 摘要信息存在:', hasSummary)
        console.log('- 系统配置项数:', completeConfigs.system.metadata.totalConfigs)
        console.log('- 本地配置项数:', Object.keys(completeConfigs.local).length)
        console.log('- API配置项数:', Object.keys(completeConfigs.api).length)
        console.log('- 总配置项数:', completeConfigs.summary.totalConfigs)

        return {
            success: true,
            hasSystem,
            hasLocal,
            hasApi,
            hasSummary,
            systemConfigs: completeConfigs.system.metadata.totalConfigs,
            localConfigs: Object.keys(completeConfigs.local).length,
            apiConfigs: Object.keys(completeConfigs.api).length,
            totalConfigs: completeConfigs.summary.totalConfigs
        }

    } catch (error) {
        console.error('❌ 完整配置采集测试失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }
    }
}

/**
 * 测试配置导出功能
 */
export async function testConfigExport() {
    console.log('🧪 测试配置导出功能...')

    try {
        const configs = await collectAllConfigs()

        // 测试导出功能（在浏览器环境中）
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            exportConfigsToJson(configs, 'test-studio-configs.json')
            console.log('✅ 配置导出测试通过（浏览器环境）')
            return {
                success: true,
                exported: true,
                environment: 'browser'
            }
        } else {
            console.log('⚠️ 配置导出测试跳过（非浏览器环境）')
            return {
                success: true,
                exported: false,
                environment: 'node'
            }
        }

    } catch (error) {
        console.error('❌ 配置导出测试失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }
    }
}

/**
 * 测试配置结构完整性
 */
export async function testConfigStructure() {
    console.log('🧪 测试配置结构完整性...')

    try {
        const configs = await collectAllConfigs()

        // 检查Studio配置结构
        const studioStructure = {
            hasManifest: !!configs.studio.manifest,
            hasAuth: !!configs.studio.auth,
            hasPages: !!configs.studio.pages,
            hasDataSources: !!configs.studio.dataSources,
            hasUser: !!configs.studio.user,
            hasModules: !!configs.studio.modules
        }

        // 检查APP配置结构
        const appStructure = {
            hasLayout: !!configs.app.layout,
            hasComponents: !!configs.app.components,
            hasDesign: !!configs.app.design,
            hasAnimation: !!configs.app.animation,
            hasAccessibility: !!configs.app.accessibility,
            hasThemes: !!configs.app.themes,
            hasCards: !!configs.app.cards,
            hasLocalStorage: !!configs.app.localStorage
        }

        // 检查元数据结构
        const metadataStructure = {
            hasVersion: !!configs.metadata.version,
            hasCollectedAt: !!configs.metadata.collectedAt,
            hasSource: !!configs.metadata.source,
            hasTotalConfigs: typeof configs.metadata.totalConfigs === 'number',
            hasAppConfigSource: !!configs.metadata.appConfigSource
        }

        const allStructuresValid =
            Object.values(studioStructure).every(Boolean) &&
            Object.values(appStructure).every(Boolean) &&
            Object.values(metadataStructure).every(Boolean)

        console.log('✅ 配置结构完整性测试完成')
        console.log('- Studio结构完整:', Object.values(studioStructure).every(Boolean))
        console.log('- APP结构完整:', Object.values(appStructure).every(Boolean))
        console.log('- 元数据结构完整:', Object.values(metadataStructure).every(Boolean))
        console.log('- 整体结构完整:', allStructuresValid)

        return {
            success: allStructuresValid,
            studio: studioStructure,
            app: appStructure,
            metadata: metadataStructure,
            allValid: allStructuresValid
        }

    } catch (error) {
        console.error('❌ 配置结构完整性测试失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }
    }
}

/**
 * 测试iframe桥接功能
 */
export async function testIframeBridge() {
    console.log('🧪 测试iframe桥接功能...')

    try {
        const configs = await collectAllConfigs()

        // 检查iframe桥接是否正常工作
        const bridgeTest = {
            appConfigSource: configs.metadata.appConfigSource,
            hasAppConfigs: Object.keys(configs.app).length > 0,
            appConfigKeys: Object.keys(configs.app),
            localStorageItems: Object.keys(configs.app.localStorage).length,
            bridgeWorking: configs.metadata.appConfigSource === 'iframe' && Object.keys(configs.app).length > 0
        }

        console.log('✅ iframe桥接测试完成')
        console.log('- 桥接工作正常:', bridgeTest.bridgeWorking)
        console.log('- APP配置来源:', bridgeTest.appConfigSource)
        console.log('- APP配置项数:', bridgeTest.appConfigKeys.length)
        console.log('- 本地存储项数:', bridgeTest.localStorageItems)

        if (!bridgeTest.bridgeWorking) {
            console.warn('⚠️ iframe桥接可能存在问题')
        }

        return {
            success: bridgeTest.bridgeWorking,
            bridgeWorking: bridgeTest.bridgeWorking,
            appConfigSource: bridgeTest.appConfigSource,
            appConfigCount: bridgeTest.appConfigKeys.length,
            localStorageCount: bridgeTest.localStorageItems
        }

    } catch (error) {
        console.error('❌ iframe桥接测试失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }
    }
}

/**
 * 运行所有测试
 */
export async function runAllTests() {
    console.log('🚀 开始运行所有Studio配置采集器测试...')

    const tests = [
        { name: '基础配置采集', fn: testBasicConfigCollection },
        { name: '配置验证', fn: testConfigValidation },
        { name: '完整配置采集', fn: testCompleteConfigCollection },
        { name: '配置导出', fn: testConfigExport },
        { name: '配置结构完整性', fn: testConfigStructure },
        { name: 'iframe桥接', fn: testIframeBridge }
    ]

    const results = []

    for (const test of tests) {
        console.log(`\n--- ${test.name}测试 ---`)
        try {
            const result = await test.fn()
            results.push({
                name: test.name,
                success: result.success,
                result
            })
        } catch (error) {
            console.error(`❌ ${test.name}测试异常:`, error)
            results.push({
                name: test.name,
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            })
        }
    }

    // 统计测试结果
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log('\n📊 测试结果统计:')
    console.log('- 总测试数:', results.length)
    console.log('- 成功:', successful)
    console.log('- 失败:', failed)
    console.log('- 成功率:', `${((successful / results.length) * 100).toFixed(1)}%`)

    // 输出失败的测试
    const failedTests = results.filter(r => !r.success)
    if (failedTests.length > 0) {
        console.log('\n❌ 失败的测试:')
        failedTests.forEach(test => {
            console.log(`- ${test.name}: ${test.error || '未知错误'}`)
        })
    }

    return {
        results,
        summary: {
            total: results.length,
            successful,
            failed,
            successRate: (successful / results.length) * 100,
            completedAt: new Date().toISOString()
        }
    }
}

/**
 * 快速测试函数
 */
export async function quickTest() {
    console.log('⚡ 快速测试Studio配置采集器...')

    try {
        const configs = await collectAllConfigs()
        const validation = validateConfigs(configs)

        const result = {
            success: validation.isValid,
            totalConfigs: configs.metadata.totalConfigs,
            appConfigSource: configs.metadata.appConfigSource,
            hasErrors: validation.errors.length > 0,
            hasWarnings: validation.warnings.length > 0,
            errors: validation.errors,
            warnings: validation.warnings
        }

        console.log('⚡ 快速测试结果:', result)
        return result

    } catch (error) {
        console.error('❌ 快速测试失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }
    }
}

// 导出所有测试函数
export {
    testBasicConfigCollection,
    testConfigValidation,
    testCompleteConfigCollection,
    testConfigExport,
    testConfigStructure,
    testIframeBridge,
    runAllTests,
    quickTest
}
