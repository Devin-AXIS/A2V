"use client"

import { useLayoutConfig } from "@/components/providers/layout-config-provider"
import { 
  useLayoutType, 
  useSidebarConfig, 
  useHeaderConfig, 
  useContentConfig,
  useGridSystem,
  useSpacingSystem 
} from "@/hooks/use-layout-config"

export function LayoutConfigTest() {
  const { config, applyPreset, generateCSSVariables, export: exportConfig } = useLayoutConfig()
  
  // 使用各种 Hook
  const [layoutType, setLayoutType] = useLayoutType()
  const [sidebar, updateSidebar] = useSidebarConfig()
  const [header, updateHeader] = useHeaderConfig()
  const [content, updateContent] = useContentConfig()
  const [gridSystem, updateGridSystem] = useGridSystem()
  const [spacing, updateSpacing] = useSpacingSystem()

  const handleExportCSS = () => {
    const css = generateCSSVariables()
    console.log("Generated Layout CSS:", css)
  }

  const handleExportJSON = () => {
    const json = exportConfig("json")
    console.log("Exported Layout JSON:", json)
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">布局配置系统测试</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 布局类型选择 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">布局类型</h3>
          <div className="space-y-2">
            {['sidebar', 'topbar', 'fullscreen', 'split'].map((type) => (
              <button
                key={type}
                onClick={() => setLayoutType(type as any)}
                className={`w-full px-4 py-2 rounded-md border transition-colors ${
                  layoutType === type
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 预设选择 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">布局预设</h3>
          <div className="space-y-2">
            {['default', 'compact', 'spacious', 'topbar', 'fullscreen', 'split'].map((preset) => (
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
      </div>

      {/* 配置详情 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 侧边栏配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">侧边栏配置</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">宽度: {sidebar.width}px</label>
              <input
                type="range"
                min="200"
                max="400"
                value={sidebar.width}
                onChange={(e) => updateSidebar({ width: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">收起宽度: {sidebar.collapsedWidth}px</label>
              <input
                type="range"
                min="40"
                max="120"
                value={sidebar.collapsedWidth}
                onChange={(e) => updateSidebar({ collapsedWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">位置</label>
              <select
                value={sidebar.position}
                onChange={(e) => updateSidebar({ position: e.target.value as any })}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="left">左侧</option>
                <option value="right">右侧</option>
              </select>
            </div>
          </div>
        </div>

        {/* 头部配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">头部配置</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">高度: {header.height}px</label>
              <input
                type="range"
                min="40"
                max="120"
                value={header.height}
                onChange={(e) => updateHeader({ height: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="header-sticky"
                checked={header.sticky}
                onChange={(e) => updateHeader({ sticky: e.target.checked })}
              />
              <label htmlFor="header-sticky" className="text-sm">粘性定位</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="header-transparent"
                checked={header.transparent}
                onChange={(e) => updateHeader({ transparent: e.target.checked })}
              />
              <label htmlFor="header-transparent" className="text-sm">透明背景</label>
            </div>
          </div>
        </div>

        {/* 内容配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">内容配置</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">最大宽度: {content.maxWidth}px</label>
              <input
                type="range"
                min="800"
                max="2000"
                step="100"
                value={content.maxWidth}
                onChange={(e) => updateContent({ maxWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">内边距: {content.padding}px</label>
              <input
                type="range"
                min="0"
                max="64"
                value={content.padding}
                onChange={(e) => updateContent({ padding: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">外边距</label>
              <select
                value={content.margin}
                onChange={(e) => updateContent({ margin: e.target.value as any })}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="auto">自动居中</option>
                <option value="none">无外边距</option>
              </select>
            </div>
          </div>
        </div>

        {/* 网格系统配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">网格系统</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm">列数: {gridSystem.columns}</label>
              <input
                type="range"
                min="6"
                max="24"
                value={gridSystem.columns}
                onChange={(e) => updateGridSystem({ columns: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">间距: {gridSystem.gutter}px</label>
              <input
                type="range"
                min="8"
                max="48"
                value={gridSystem.gutter}
                onChange={(e) => updateGridSystem({ gutter: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">外边距: {gridSystem.margin}px</label>
              <input
                type="range"
                min="0"
                max="32"
                value={gridSystem.margin}
                onChange={(e) => updateGridSystem({ margin: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 间距系统配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">间距系统</h3>
          <div className="space-y-2">
            {Object.entries(spacing).map(([size, value]) => (
              <div key={size}>
                <label className="text-sm">{size.toUpperCase()}: {value}px</label>
                <input
                  type="range"
                  min="0"
                  max="128"
                  value={value}
                  onChange={(e) => updateSpacing({ [size]: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 断点配置 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">断点配置</h3>
          <div className="space-y-2">
            {Object.entries(gridSystem.breakpoints).map(([breakpoint, value]) => (
              <div key={breakpoint}>
                <label className="text-sm">{breakpoint.toUpperCase()}: {value}px</label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={value}
                  onChange={(e) => updateGridSystem({
                    breakpoints: {
                      ...gridSystem.breakpoints,
                      [breakpoint]: parseInt(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
            ))}
          </div>
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

      {/* 配置预览 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">配置预览</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
