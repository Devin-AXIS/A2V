"use client"

import { useDesignTokens } from "@/components/providers/design-tokens-provider"
import { useToken, useColorToken, useTypographyToken } from "@/hooks/use-design-tokens"

export function DesignTokensTest() {
  const { tokens, updateTokens, generateCSSVariables, export: exportConfig } = useDesignTokens()
  
  // 测试各种 Hook
  const [primaryColor, setPrimaryColor] = useColorToken("primary", "500")
  const [fontSize, setFontSize] = useTypographyToken("fontSize", "lg")
  const [spacing, setSpacing] = useToken("spacing.md")

  const handleExportCSS = () => {
    const css = generateCSSVariables()
    console.log("Generated CSS:", css)
  }

  const handleExportJSON = () => {
    const json = exportConfig("json")
    console.log("Exported JSON:", json)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">设计令牌系统测试</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 当前令牌值 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">当前令牌值</h3>
          <div className="space-y-1 text-sm">
            <div>主色 500: <span style={{ color: primaryColor }}>{primaryColor}</span></div>
            <div>字体大小 lg: {fontSize}</div>
            <div>间距 md: {spacing}</div>
          </div>
        </div>

        {/* 令牌修改器 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">令牌修改器</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">主色 500:</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="ml-2"
              />
            </div>
            <div>
              <label className="text-sm">字体大小 lg:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
              >
                <option value="0.75rem">xs</option>
                <option value="0.875rem">sm</option>
                <option value="1rem">base</option>
                <option value="1.125rem">lg</option>
                <option value="1.25rem">xl</option>
                <option value="1.5rem">2xl</option>
                <option value="1.875rem">3xl</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 导出功能 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">导出功能</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSS}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            导出 CSS 变量
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            导出 JSON
          </button>
        </div>
      </div>

      {/* 令牌预览 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">令牌预览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 颜色预览 */}
          <div className="space-y-2">
            <h4 className="font-medium">主色</h4>
            <div className="space-y-1">
              {Object.entries(tokens.colors.primary).map(([scale, color]) => (
                <div key={scale} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs">{scale}: {color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 字体大小预览 */}
          <div className="space-y-2">
            <h4 className="font-medium">字体大小</h4>
            <div className="space-y-1">
              {Object.entries(tokens.typography.fontSize).map(([size, value]) => (
                <div key={size} style={{ fontSize: value }}>
                  <span className="text-xs">{size}: {value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 间距预览 */}
          <div className="space-y-2">
            <h4 className="font-medium">间距</h4>
            <div className="space-y-1">
              {Object.entries(tokens.spacing).map(([size, value]) => (
                <div key={size} className="flex items-center gap-2">
                  <div
                    className="bg-gray-300 rounded"
                    style={{ width: value, height: "8px" }}
                  />
                  <span className="text-xs">{size}: {value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 圆角预览 */}
          <div className="space-y-2">
            <h4 className="font-medium">圆角</h4>
            <div className="space-y-1">
              {Object.entries(tokens.radius).map(([size, value]) => (
                <div key={size} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 bg-blue-500"
                    style={{ borderRadius: value }}
                  />
                  <span className="text-xs">{size}: {value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
