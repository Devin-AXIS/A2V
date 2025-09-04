"use client"

import { useComponentStyleConfig } from "@/components/providers/component-style-config-provider"
import { 
  useButtonStyle, 
  useInputStyle, 
  useCardStyle,
  useTagStyle,
  useButtonVariants,
  useInputStates,
  useCardVariants,
  useTagVariants
} from "@/hooks/use-component-style-config"

export function ComponentStyleConfigTest() {
  const { config, applyPreset, generateCSSVariables, export: exportConfig } = useComponentStyleConfig()
  
  // 使用各种 Hook
  const [buttonStyle, updateButtonStyle] = useButtonStyle()
  const [inputStyle, updateInputStyle] = useInputStyle()
  const [cardStyle, updateCardStyle] = useCardStyle()
  const [tagStyle, updateTagStyle] = useTagStyle()
  const [buttonVariants, updateButtonVariants] = useButtonVariants()
  const [inputStates, updateInputStates] = useInputStates()
  const [cardVariants, updateCardVariants] = useCardVariants()
  const [tagVariants, updateTagVariants] = useTagVariants()

  const handleExportCSS = () => {
    const css = generateCSSVariables()
    console.log("Generated Component Style CSS:", css)
  }

  const handleExportJSON = () => {
    const json = exportConfig("json")
    console.log("Exported Component Style JSON:", json)
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">组件样式配置系统测试</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 预设选择 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">样式预设</h3>
          <div className="space-y-2">
            {['default', 'modern', 'minimal', 'colorful'].map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                应用 {preset.charAt(0).toUpperCase() + preset.slice(1)} 预设
              </button>
            ))}
          </div>
        </div>

        {/* 导出功能 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">导出功能</h3>
          <div className="flex gap-4">
            <button
              onClick={handleExportCSS}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              导出 CSS 变量
            </button>
            <button
              onClick={handleExportJSON}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              导出 JSON
            </button>
          </div>
        </div>
      </div>

      {/* 配置详情 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 按钮基础配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">按钮基础配置</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">圆角: {buttonStyle.base.borderRadius}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.125"
                value={parseFloat(buttonStyle.base.borderRadius)}
                onChange={(e) => updateButtonStyle({
                  base: { ...buttonStyle.base, borderRadius: `${e.target.value}rem` }
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">字体大小: {buttonStyle.base.fontSize}</label>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.125"
                value={parseFloat(buttonStyle.base.fontSize)}
                onChange={(e) => updateButtonStyle({
                  base: { ...buttonStyle.base, fontSize: `${e.target.value}rem` }
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">字体粗细</label>
              <select
                value={buttonStyle.base.fontWeight}
                onChange={(e) => updateButtonStyle({
                  base: { ...buttonStyle.base, fontWeight: e.target.value }
                })}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semi-bold</option>
                <option value="700">Bold</option>
              </select>
            </div>
          </div>
        </div>

        {/* 按钮主色调配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">按钮主色调</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">背景色</label>
              <input
                type="color"
                value={buttonVariants.primary.backgroundColor}
                onChange={(e) => updateButtonVariants({
                  primary: { ...buttonVariants.primary, backgroundColor: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="text-sm">文字色</label>
              <input
                type="color"
                value={buttonVariants.primary.color}
                onChange={(e) => updateButtonVariants({
                  primary: { ...buttonVariants.primary, color: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="text-sm">边框色</label>
              <input
                type="color"
                value={buttonVariants.primary.borderColor}
                onChange={(e) => updateButtonVariants({
                  primary: { ...buttonVariants.primary, borderColor: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
          </div>
        </div>

        {/* 输入框配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">输入框配置</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">圆角: {inputStyle.base.borderRadius}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.125"
                value={parseFloat(inputStyle.base.borderRadius)}
                onChange={(e) => updateInputStyle({
                  base: { ...inputStyle.base, borderRadius: `${e.target.value}rem` }
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">聚焦边框色</label>
              <input
                type="color"
                value={inputStates.focus.borderColor}
                onChange={(e) => updateInputStates({
                  focus: { ...inputStates.focus, borderColor: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="text-sm">错误边框色</label>
              <input
                type="color"
                value={inputStates.error.borderColor}
                onChange={(e) => updateInputStates({
                  error: { ...inputStates.error, borderColor: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
          </div>
        </div>

        {/* 卡片配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">卡片配置</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">圆角: {cardStyle.base.borderRadius}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.125"
                value={parseFloat(cardStyle.base.borderRadius)}
                onChange={(e) => updateCardStyle({
                  base: { ...cardStyle.base, borderRadius: `${e.target.value}rem` }
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">阴影</label>
              <select
                value={cardStyle.base.boxShadow}
                onChange={(e) => updateCardStyle({
                  base: { ...cardStyle.base, boxShadow: e.target.value }
                })}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="none">无阴影</option>
                <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)">轻微阴影</option>
                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)">中等阴影</option>
                <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)">重阴影</option>
              </select>
            </div>
            <div>
              <label className="text-sm">边框色</label>
              <input
                type="color"
                value={cardVariants.default.borderColor}
                onChange={(e) => updateCardVariants({
                  default: { ...cardVariants.default, borderColor: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
          </div>
        </div>

        {/* 标签配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">标签配置</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">圆角: {tagStyle.base.borderRadius}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.125"
                value={parseFloat(tagStyle.base.borderRadius)}
                onChange={(e) => updateTagStyle({
                  base: { ...tagStyle.base, borderRadius: `${e.target.value}rem` }
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">主色调背景色</label>
              <input
                type="color"
                value={tagVariants.primary.backgroundColor}
                onChange={(e) => updateTagVariants({
                  primary: { ...tagVariants.primary, backgroundColor: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="text-sm">主色调文字色</label>
              <input
                type="color"
                value={tagVariants.primary.color}
                onChange={(e) => updateTagVariants({
                  primary: { ...tagVariants.primary, color: e.target.value }
                })}
                className="w-full h-10 border rounded"
              />
            </div>
          </div>
        </div>

        {/* 预览区域 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">样式预览</h3>
          <div className="space-y-4 p-4 border rounded">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              按钮示例
            </button>
            <input 
              type="text" 
              placeholder="输入框示例" 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="p-4 bg-white border rounded shadow">
              <h4 className="font-semibold">卡片示例</h4>
              <p className="text-gray-600">这是一个卡片内容示例</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">标签示例</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">成功</span>
            </div>
          </div>
        </div>
      </div>

      {/* 配置预览 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">配置预览</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
