'use client'

import React, { useState, useEffect } from 'react'
import { useUnifiedConfig } from '@/hooks/use-unified-config'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useLocale } from '@/components/providers/locale-provider'
import { Square, Circle, Triangle, RotateCcw, Save } from 'lucide-react'

export function RadiusConfig() {
  const config = useUnifiedConfig()
  const { locale } = useLocale()
  const isEnglish = locale === "en"
  
  const [selectedPreset, setSelectedPreset] = useState(config.radius.activePreset)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // 当配置变化时更新本地状态
  useEffect(() => {
    setSelectedPreset(config.radius.activePreset)
  }, [config.radius.activePreset])

  // 添加全局边角监听器
  useEffect(() => {
    // 页面加载时应用当前边角配置
    const applyInitialRadius = () => {
      setTimeout(() => {
        config.radius.applyRadiusToDOM()
        console.log('🚀 初始边角配置已应用')
      }, 500)
    }

    // 监听边角更新事件
    const handleRadiusUpdate = () => {
      setTimeout(() => {
        config.radius.applyRadiusToDOM()
        console.log('📡 收到边角更新事件，重新应用配置')
      }, 100)
    }

    // 监听强制边角更新事件
    const handleForceRadiusUpdate = () => {
      setTimeout(() => {
        config.radius.applyRadiusToDOM()
        console.log('⚡ 收到强制边角更新事件，重新应用配置')
      }, 100)
    }

    // 添加事件监听器
    window.addEventListener('radiusUpdated', handleRadiusUpdate)
    window.addEventListener('forceRadiusUpdate', handleForceRadiusUpdate)
    
    // 页面加载完成后应用边角
    if (document.readyState === 'complete') {
      applyInitialRadius()
    } else {
      window.addEventListener('load', applyInitialRadius)
    }

    // 立即应用一次，确保初始状态正确
    setTimeout(() => {
      config.radius.applyRadiusToDOM()
      console.log('🎯 立即应用初始边角配置')
    }, 100)

    return () => {
      window.removeEventListener('radiusUpdated', handleRadiusUpdate)
      window.removeEventListener('forceRadiusUpdate', handleForceRadiusUpdate)
      window.removeEventListener('load', applyInitialRadius)
    }
  }, [config.radius])

  // 处理预设切换 - 简化版本
  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey)
    config.radius.setActivePreset(presetKey)
    
    // 添加视觉反馈
    document.body.style.setProperty('--force-radius-update', '1')
    setTimeout(() => {
      document.body.style.removeProperty('--force-radius-update')
    }, 100)
    
    console.log('🔄 边角预设已切换:', presetKey)
  }

  // 手动更新"默认"预设为当前状态
  const handleUpdateDefault = () => {
    config.radius.updateDefaultPreset()
    
    // 显示成功提示
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    
    console.log('✅ 已手动更新"默认"预设')
  }

  // 手动捕获初始状态
  const handleCaptureInitial = () => {
    config.radius.captureInitialRadius()
    
    // 显示成功提示
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    
    console.log('🎯 已手动捕获初始状态')
  }

  // 获取预设图标
  const getPresetIcon = (presetKey: string) => {
    switch (presetKey) {
      case 'sharp':
        return <Square className="w-4 h-4" />
      case 'subtle':
        return <Square className="w-4 h-4" />
      case 'balanced':
        return <Square className="w-4 h-4" />
      case 'rounded':
        return <Circle className="w-4 h-4" />
      case 'soft':
        return <Circle className="w-4 h-4" />
      case 'default':
        return <RotateCcw className="w-4 h-4" />
      default:
        return <Square className="w-4 h-4" />
    }
  }

  // 获取预设颜色
  const getPresetColor = (presetKey: string) => {
    if (presetKey === selectedPreset) {
      return 'bg-primary text-primary-foreground'
    }
    return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  }

  return (
    <div className="space-y-4">
      {/* 标题和描述 */}
      <div>
        <h3 className="text-lg font-semibold">
          {isEnglish ? "Global Radius Configuration" : "全局边角配置"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isEnglish 
            ? "Configure corner radius for all components globally" 
            : "全局配置所有组件的边角样式"
          }
        </p>
      </div>

      {/* 当前激活的预设 */}
      <div className="space-y-2">
        <Label>
          {isEnglish ? "Active Preset" : "当前预设"}
        </Label>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {config.radius.presets[selectedPreset]?.name || selectedPreset}
          </Badge>
          {config.radius.presets[selectedPreset]?.description && (
            <span className="text-sm text-muted-foreground">
              {config.radius.presets[selectedPreset]?.description}
            </span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCaptureInitial}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {isEnglish ? "Capture Initial" : "捕获初始"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpdateDefault}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEnglish ? "Save as Default" : "保存为默认"}
        </Button>
      </div>

      {/* 成功提示 */}
      {showSuccessMessage && (
        <div className="p-2 bg-green-100 text-green-800 rounded-md text-sm">
          {isEnglish ? "Operation completed successfully!" : "操作成功完成！"}
        </div>
      )}

      <Separator />

      {/* 预设列表 */}
      <div className="space-y-2">
        <Label>
          {isEnglish ? "Available Presets" : "可用预设"}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(config.radius.presets).map(([presetKey, preset]) => (
            <Button
              key={presetKey}
              variant="outline"
              className={`justify-start h-auto p-3 ${getPresetColor(presetKey)}`}
              onClick={() => handlePresetChange(presetKey)}
            >
              <div className="flex items-center gap-2 w-full">
                {getPresetIcon(presetKey)}
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs opacity-70">{preset.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 组件边角预览 */}
      <div className="space-y-2">
        <Label>
          {isEnglish ? "Component Radius Preview" : "组件边角预览"}
        </Label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>{isEnglish ? "Card" : "卡片"}:</span>
            <Badge variant="outline">
              {config.radius.getComponentRadius('card')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>{isEnglish ? "Button" : "按钮"}:</span>
            <Badge variant="outline">
              {config.radius.getComponentRadius('button')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>{isEnglish ? "Input" : "输入框"}:</span>
            <Badge variant="outline">
              {config.radius.getComponentRadius('input')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>{isEnglish ? "Modal" : "模态框"}:</span>
            <Badge variant="outline">
              {config.radius.getComponentRadius('modal')}
            </Badge>
          </div>
        </div>
      </div>

      {/* 初始状态信息 */}
      {config.radius.initialRadiusValues && (
        <div className="space-y-2">
          <Label>
            {isEnglish ? "Initial State Values" : "初始状态值"}
          </Label>
          <div className="p-3 bg-muted rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>Card: {config.radius.initialRadiusValues.card}</div>
              <div>Button: {config.radius.initialRadiusValues.button}</div>
              <div>Input: {config.radius.initialRadiusValues.input}</div>
              <div>Modal: {config.radius.initialRadiusValues.modal}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
