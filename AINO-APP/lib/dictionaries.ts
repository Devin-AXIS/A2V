import "server-only"

export const i18n = {
  defaultLocale: "zh" as const,
  locales: ["zh", "en"] as const,
  localeLabels: {
    zh: "中文",
    en: "English",
  },
} as const

export type Locale = (typeof i18n.locales)[number]

type DictionaryModule = { default: any }

const coreDictionaries = {
  en: () => import("../core/i18n/en.json").then((module: DictionaryModule) => module.default),
  zh: () => import("../core/i18n/zh.json").then((module: DictionaryModule) => module.default),
}

const pcDictionaries = {
  en: () => import("../pc/locales/en.json").then((module: DictionaryModule) => module.default),
  zh: () => import("../pc/locales/zh.json").then((module: DictionaryModule) => module.default),
}

const appDictionaries = {
  en: () => import("../app/locales/en.json").then((module: DictionaryModule) => module.default),
  zh: () => import("../app/locales/zh.json").then((module: DictionaryModule) => module.default),
}

const cardDictionaries = {
  en: () => import("../components/card/locales/en.json").then((module: DictionaryModule) => module.default),
  zh: () => import("../components/card/locales/zh.json").then((module: DictionaryModule) => module.default),
}

export type Platform = "pc" | "app" | "card"

export const getCoreDictionary = async (locale: Locale) => {
  const loader = coreDictionaries[locale] || coreDictionaries[i18n.defaultLocale]
  try {
    return await loader()
  } catch (error) {
    console.error(`Core dictionary for locale "${locale}" not found. Falling back to default.`, error)
    return await coreDictionaries[i18n.defaultLocale]()
  }
}

export const getPlatformDictionary = async (locale: Locale, platform: Platform) => {
  let platformDictionaries

  switch (platform) {
    case "pc":
      platformDictionaries = pcDictionaries
      break
    case "app":
      platformDictionaries = appDictionaries
      break
    case "card":
      platformDictionaries = cardDictionaries
      break
    default:
      console.warn(`Unknown platform: ${platform}`)
      return {}
  }

  const loader = platformDictionaries[locale] || platformDictionaries[i18n.defaultLocale]
  try {
    return await loader()
  } catch (error) {
    console.error(`Platform dictionary for "${platform}" and locale "${locale}" not found.`, error)
    return {}
  }
}

export const getCombinedDictionary = async (locale: Locale, platforms: Platform[] = []) => {
  try {
    // 始终加载核心字典
    const coreDictionary = await getCoreDictionary(locale)

    // 按需加载平台字典
    const platformDictionaries = await Promise.all(platforms.map((platform) => getPlatformDictionary(locale, platform)))

    // 合并所有字典
    return platformDictionaries.reduce((combined, platformDict) => ({ ...combined, ...platformDict }), coreDictionary)
  } catch (error) {
    console.error(`Failed to load combined dictionary for locale "${locale}"`, error)
    return await getCoreDictionary(i18n.defaultLocale)
  }
}

export const getDictionary = async (locale: Locale) => {
  // 默认加载所有端的字典以保持向后兼容
  return getCombinedDictionary(locale, ["pc", "app", "card"])
}
