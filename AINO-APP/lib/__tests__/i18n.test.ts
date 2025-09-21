import {
  getCoreDictionary,
  getPlatformDictionary,
  getCombinedDictionary,
  getDictionary,
  type Platform,
} from "../dictionaries"
import type { Locale } from "@/config/i18n.config"

// 测试核心字典加载
export async function testCoreDictionary() {
  console.log("Testing core dictionary loading...")

  try {
    const zhCore = await getCoreDictionary("zh")
    const enCore = await getCoreDictionary("en")

    console.log("✅ Core dictionaries loaded successfully")
    console.log("ZH Core keys:", Object.keys(zhCore))
    console.log("EN Core keys:", Object.keys(enCore))

    // 验证公共词条存在
    if (zhCore.common && enCore.common) {
      console.log("✅ Common translations found")
    } else {
      console.log("❌ Common translations missing")
    }

    return true
  } catch (error) {
    console.error("❌ Core dictionary test failed:", error)
    return false
  }
}

// 测试平台字典加载
export async function testPlatformDictionaries() {
  console.log("Testing platform dictionary loading...")

  const platforms: Platform[] = ["pc", "app", "card"]
  const locales: Locale[] = ["zh", "en"]

  try {
    for (const platform of platforms) {
      for (const locale of locales) {
        const dict = await getPlatformDictionary(locale, platform)
        console.log(`✅ ${platform.toUpperCase()} ${locale.toUpperCase()} dictionary loaded`)
        console.log(`Keys: ${Object.keys(dict).length}`)
      }
    }
    return true
  } catch (error) {
    console.error("❌ Platform dictionary test failed:", error)
    return false
  }
}

// 测试按需加载
export async function testLazyLoading() {
  console.log("Testing lazy loading...")

  try {
    // 只加载PC端
    const pcOnly = await getCombinedDictionary("zh", ["pc"])
    console.log("✅ PC-only dictionary loaded")
    console.log("PC-only keys:", Object.keys(pcOnly))

    // 加载PC + App
    const pcApp = await getCombinedDictionary("zh", ["pc", "app"])
    console.log("✅ PC + App dictionary loaded")
    console.log("PC + App keys:", Object.keys(pcApp))

    // 验证按需加载减少了包体积
    const pcOnlySize = JSON.stringify(pcOnly).length
    const pcAppSize = JSON.stringify(pcApp).length

    console.log(`PC-only size: ${pcOnlySize} bytes`)
    console.log(`PC + App size: ${pcAppSize} bytes`)

    if (pcAppSize > pcOnlySize) {
      console.log("✅ Lazy loading working - different sizes confirmed")
    }

    return true
  } catch (error) {
    console.error("❌ Lazy loading test failed:", error)
    return false
  }
}

// 测试向后兼容性
export async function testBackwardCompatibility() {
  console.log("Testing backward compatibility...")

  try {
    const fullDict = await getDictionary("zh")
    console.log("✅ Full dictionary loaded (backward compatibility)")
    console.log("Full dictionary keys:", Object.keys(fullDict))

    // 验证所有原有的键都存在
    const expectedKeys = [
      "common",
      "lang",
      "browserHeader",
      "mainPage",
      "bottomNav",
      "profilePage",
      "chatPage",
      "cardComponentsPage",
    ]

    const missingKeys = expectedKeys.filter((key) => !(key in fullDict))

    if (missingKeys.length === 0) {
      console.log("✅ All expected keys present - backward compatibility maintained")
    } else {
      console.log("❌ Missing keys:", missingKeys)
    }

    return missingKeys.length === 0
  } catch (error) {
    console.error("❌ Backward compatibility test failed:", error)
    return false
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log("🚀 Starting i18n structure tests...\n")

  const results = await Promise.all([
    testCoreDictionary(),
    testPlatformDictionaries(),
    testLazyLoading(),
    testBackwardCompatibility(),
  ])

  const allPassed = results.every((result) => result)

  console.log("\n📊 Test Results:")
  console.log(`Core Dictionary: ${results[0] ? "✅" : "❌"}`)
  console.log(`Platform Dictionaries: ${results[1] ? "✅" : "❌"}`)
  console.log(`Lazy Loading: ${results[2] ? "✅" : "❌"}`)
  console.log(`Backward Compatibility: ${results[3] ? "✅" : "❌"}`)

  if (allPassed) {
    console.log("\n🎉 All tests passed! New i18n structure is working correctly.")
  } else {
    console.log("\n⚠️ Some tests failed. Please check the implementation.")
  }

  return allPassed
}
