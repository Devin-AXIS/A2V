#!/usr/bin/env node

/**
 * 测试卡片包绑定模块安装功能
 * 使用方法: node scripts/test-card-package-install.js
 */

const { ModuleService } = require('../src/modules/modules/service')
const { moduleRegistry } = require('../src/platform/modules/registry')
const { createCardPackageTables, checkCardPackageTables } = require('../src/lib/card-package-tables')

async function testCardPackageInstall() {
    console.log('🧪 开始测试卡片包绑定模块安装功能...\n')

    try {
        // 1. 测试模块注册表
        console.log('1️⃣ 检查模块注册表...')
        const modules = moduleRegistry.getAll()
        console.log(`   找到 ${modules.length} 个模块:`)

        modules.forEach(module => {
            const cardPackageInfo = module.cardPackage
                ? `📦 绑定卡片包: ${module.cardPackage.packageName} (${module.cardPackage.packageId})`
                : '🔧 无卡片包绑定'
            console.log(`   - ${module.name} (${module.key}): ${cardPackageInfo}`)
        })
        console.log()

        // 2. 测试卡片包数据表创建
        console.log('2️⃣ 测试卡片包数据表创建...')
        const testApplicationId = 'test-app-123'

        // 测试招聘卡片包
        console.log('   测试招聘卡片包数据表创建...')
        await createCardPackageTables(testApplicationId, 'recruitment-package', 'test')
        const recruitmentTablesExist = await checkCardPackageTables(testApplicationId, 'recruitment-package', 'test')
        console.log(`   招聘卡片包数据表创建结果: ${recruitmentTablesExist ? '✅ 成功' : '❌ 失败'}`)

        // 测试教育卡片包
        console.log('   测试教育卡片包数据表创建...')
        await createCardPackageTables(testApplicationId, 'education-package', 'test')
        const educationTablesExist = await checkCardPackageTables(testApplicationId, 'education-package', 'test')
        console.log(`   教育卡片包数据表创建结果: ${educationTablesExist ? '✅ 成功' : '❌ 失败'}`)
        console.log()

        // 3. 测试模块安装服务
        console.log('3️⃣ 测试模块安装服务...')
        const moduleService = new ModuleService()

        // 测试安装教育模块（带卡片包）
        console.log('   测试安装教育模块（带卡片包）...')
        try {
            const eduModule = await moduleService.installModule(
                testApplicationId,
                {
                    moduleKey: 'edu',
                    moduleVersion: '1.0.0',
                    installConfig: {},
                    cardPackageConfig: {
                        packageId: 'education-package',
                        autoCreateTables: true,
                        tablePrefix: 'edu_test'
                    }
                },
                'test-user'
            )
            console.log(`   ✅ 教育模块安装成功: ${eduModule.moduleName} (${eduModule.moduleKey})`)
            console.log(`   📦 卡片包配置:`, eduModule.installConfig.cardPackage)
        } catch (error) {
            console.log(`   ❌ 教育模块安装失败: ${error.message}`)
        }

        // 测试安装招聘模块（带卡片包）
        console.log('   测试安装招聘模块（带卡片包）...')
        try {
            const recruitmentModule = await moduleService.installModule(
                testApplicationId,
                {
                    moduleKey: 'recruitment',
                    moduleVersion: '1.0.0',
                    installConfig: {},
                    cardPackageConfig: {
                        packageId: 'recruitment-package',
                        autoCreateTables: true,
                        tablePrefix: 'rec_test'
                    }
                },
                'test-user'
            )
            console.log(`   ✅ 招聘模块安装成功: ${recruitmentModule.moduleName} (${recruitmentModule.moduleKey})`)
            console.log(`   📦 卡片包配置:`, recruitmentModule.installConfig.cardPackage)
        } catch (error) {
            console.log(`   ❌ 招聘模块安装失败: ${error.message}`)
        }

        // 测试安装通用自定义模块（无卡片包）
        console.log('   测试安装通用自定义模块（无卡片包）...')
        try {
            const blankModule = await moduleService.installModule(
                testApplicationId,
                {
                    moduleKey: 'blank-template',
                    moduleVersion: '1.0.0',
                    installConfig: {},
                    // 不提供cardPackageConfig
                },
                'test-user'
            )
            console.log(`   ✅ 通用自定义模块安装成功: ${blankModule.moduleName} (${blankModule.moduleKey})`)
            console.log(`   📦 卡片包配置:`, blankModule.installConfig.cardPackage || '无')
        } catch (error) {
            console.log(`   ❌ 通用自定义模块安装失败: ${error.message}`)
        }

        console.log('\n🎉 卡片包绑定模块安装功能测试完成！')

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error)
        process.exit(1)
    }
}

// 运行测试
if (require.main === module) {
    testCardPackageInstall()
        .then(() => {
            console.log('\n✅ 所有测试完成')
            process.exit(0)
        })
        .catch((error) => {
            console.error('\n❌ 测试失败:', error)
            process.exit(1)
        })
}

module.exports = { testCardPackageInstall }
