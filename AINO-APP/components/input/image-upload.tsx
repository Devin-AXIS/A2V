"use client"

import type React from "react"
import { useState, useRef, useMemo, useCallback } from "react"
import { Camera, Upload, X, Image as ImageIcon, RotateCw, ZoomIn, ZoomOut, Crop, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { PillButton } from "@/components/basic/pill-button"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  accept?: string
  maxSize?: number // MB
  shape?: 'square' | 'circle' | 'rectangle'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  showPreview?: boolean
  enableCrop?: boolean // 是否启用裁剪功能
  cropAspectRatio?: number // 裁剪比例 (width/height)
}

interface CropState {
  x: number
  y: number
  width: number
  height: number
  scale: number
  rotation: number
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "#000000"
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "#000000" : "#ffffff"
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "点击上传图片",
  className,
  accept = "image/*",
  maxSize = 5, // 5MB
  shape = 'square',
  size = 'md',
  disabled = false,
  showPreview = true,
  enableCrop = true,
  cropAspectRatio
}: ImageUploadProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#000000"
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCropEditor, setShowCropEditor] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: 200
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropState, setCropState] = useState<CropState>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    scale: 1,
    rotation: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // 尺寸配置
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      text: "text-xs",
      icon: "w-4 h-4"
    },
    md: {
      container: "w-24 h-24",
      text: "text-sm",
      icon: "w-6 h-6"
    },
    lg: {
      container: "w-32 h-32",
      text: "text-base",
      icon: "w-8 h-8"
    }
  }

  // 形状配置
  const shapeConfig = {
    square: "rounded-xl",
    circle: "rounded-full",
    rectangle: "rounded-xl aspect-[4/3]"
  }

  const currentSizeConfig = sizeConfig[size]
  const currentShapeConfig = shapeConfig[shape]

  // 图片裁剪函数
  const cropImage = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      const img = imageRef.current
      if (!canvas || !img || !originalImage) return resolve('')

      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve('')

      // 计算实际的裁剪区域（相对于原图的比例）
      const scaleX = img.naturalWidth / imageSize.width
      const scaleY = img.naturalHeight / imageSize.height

      const actualCropX = cropArea.x * scaleX
      const actualCropY = cropArea.y * scaleY
      const actualCropWidth = cropArea.width * scaleX
      const actualCropHeight = cropArea.height * scaleY

      // 设置输出画布尺寸
      const outputSize = shape === 'circle' ? Math.min(cropArea.width, cropArea.height) : cropArea.width
      canvas.width = outputSize
      canvas.height = shape === 'rectangle' ? cropArea.height : outputSize

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保存上下文状态
      ctx.save()

      // 如果是圆形，创建圆形裁剪路径
      if (shape === 'circle') {
        ctx.beginPath()
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
        ctx.clip()
      }

      // 应用旋转
      if (cropState.rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((cropState.rotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
      }

      // 绘制裁剪后的图片
      ctx.drawImage(
        img,
        actualCropX,
        actualCropY,
        actualCropWidth,
        actualCropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )

      // 恢复上下文状态
      ctx.restore()

      // 转换为base64
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
      resolve(croppedImageUrl)
    })
  }, [shape, originalImage, imageSize, cropArea, cropState])

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    setError(null)

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`)
      return
    }

    setIsUploading(true)

    try {
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file)

      if (enableCrop) {
        // 如果启用裁剪，先设置原始图片，然后打开裁剪编辑器
        setOriginalImage(previewUrl)

        // 加载图片获取尺寸信息
        const img = new window.Image()
        img.onload = () => {
          // 设置图片尺寸
          setImageSize({ width: img.width, height: img.height })

          // 计算初始裁剪区域
          const aspectRatio = cropAspectRatio || (shape === 'circle' ? 1 : shape === 'square' ? 1 : 4 / 3)
          const maxSize = Math.min(img.width, img.height) * 0.8 // 80%的图片大小作为初始裁剪区域
          const cropWidth = shape === 'circle' || shape === 'square' ? maxSize : maxSize
          const cropHeight = shape === 'circle' || shape === 'square' ? maxSize : maxSize / aspectRatio

          setCropArea({
            x: (img.width - cropWidth) / 2,
            y: (img.height - cropHeight) / 2,
            width: cropWidth,
            height: cropHeight
          })

          setCropState({
            x: 0,
            y: 0,
            width: cropWidth,
            height: cropHeight,
            scale: 1,
            rotation: 0
          })

          setShowCropEditor(true)
          setIsUploading(false)
        }
        img.src = previewUrl
      } else {
        // 直接使用图片
        // 模拟上传延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        onChange?.(previewUrl)
        setIsUploading(false)
      }
    } catch (err) {
      setError('上传失败，请重试')
      setIsUploading(false)
    }
  }

  // 处理拖放
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  // 处理点击上传
  const handleClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  // 处理文件输入变化
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  // 删除图片
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.('')
    setError(null)
    setOriginalImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 裁剪控制函数
  const handleRotate = () => {
    setCropState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
  }

  const handleZoomIn = () => {
    setCropState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) }))
  }

  const handleZoomOut = () => {
    setCropState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.5) }))
  }

  const handleCropConfirm = async () => {
    if (!originalImage) return

    setIsUploading(true)
    try {
      const croppedUrl = await cropImage()
      onChange?.(croppedUrl)
      setShowCropEditor(false)
      setOriginalImage(null)
    } catch (err) {
      setError('图片处理失败')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropEditor(false)
    setOriginalImage(null)
    setIsUploading(false)
  }

  // 裁剪区域拖拽处理
  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y
    })
  }

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imageSize.width - cropArea.width))
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imageSize.height - cropArea.height))

    setCropArea(prev => ({
      ...prev,
      x: newX,
      y: newY
    }))
  }

  const handleCropMouseUp = () => {
    setIsDragging(false)
  }

  // 调整裁剪区域大小
  const handleResizeCrop = (direction: 'increase' | 'decrease') => {
    const factor = direction === 'increase' ? 1.1 : 0.9
    const aspectRatio = cropAspectRatio || (shape === 'circle' ? 1 : shape === 'square' ? 1 : 4 / 3)

    const newWidth = Math.min(Math.max(cropArea.width * factor, 50), imageSize.width)
    const newHeight = newWidth / aspectRatio

    if (newHeight > imageSize.height) return

    setCropArea(prev => ({
      x: Math.max(0, prev.x - (newWidth - prev.width) / 2),
      y: Math.max(0, prev.y - (newHeight - prev.height) / 2),
      width: newWidth,
      height: newHeight
    }))
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
          currentSizeConfig.container,
          currentShapeConfig,
          dragActive
            ? "border-blue-400 bg-blue-50"
            : value
              ? "border-transparent"
              : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          "bg-white/70 backdrop-blur-lg shadow-sm"
        )}
        onClick={handleClick}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {value && showPreview ? (
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt="上传的图片"
              fill
              className={cn("object-cover", currentShapeConfig)}
            />

            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                style={{
                  backgroundColor: primaryColor,
                  color: textColorForPrimary
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* 悬停遮罩 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
                />
                <span className={cn(currentSizeConfig.text, "text-gray-600")}>
                  上传中...
                </span>
              </div>
            ) : (
              <>
                {dragActive ? (
                  <Upload className={cn(currentSizeConfig.icon, "text-blue-500")} />
                ) : (
                  <ImageIcon className={cn(currentSizeConfig.icon, "text-gray-400")} />
                )}
                <span className={cn(currentSizeConfig.text, "text-gray-600 text-center leading-tight")}>
                  {placeholder}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {maxSize && (
        <p className="mt-1 text-xs text-gray-400">
          支持 JPG、PNG 格式，最大 {maxSize}MB{enableCrop && '，支持裁剪编辑'}
        </p>
      )}

      {/* 隐藏的canvas用于图片处理 */}
      <canvas ref={canvasRef} className="hidden" />
      <img ref={imageRef} className="hidden" alt="" />

      {/* 裁剪编辑器 */}
      <BottomDrawer
        isOpen={showCropEditor}
        onClose={handleCropCancel}
        title="编辑图片"
      >
        <div className="p-4 space-y-4">
          {/* 图片预览和裁剪区域 */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
            {originalImage && (
              <div
                className="relative w-full h-full select-none"
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                {/* 背景图片 */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    ref={imageRef}
                    src={originalImage}
                    alt="原图"
                    width={300}
                    height={300}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${cropState.scale}) rotate(${cropState.rotation}deg)`,
                    }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement
                      const displayWidth = img.offsetWidth
                      const displayHeight = img.offsetHeight
                      setImageSize({ width: displayWidth, height: displayHeight })

                      // 重新计算裁剪区域
                      const aspectRatio = cropAspectRatio || 1
                      const cropSize = Math.min(displayWidth, displayHeight) * 0.6
                      const cropWidth = cropSize
                      const cropHeight = cropSize / aspectRatio

                      setCropArea({
                        x: (displayWidth - cropWidth) / 2,
                        y: (displayHeight - cropHeight) / 2,
                        width: cropWidth,
                        height: cropHeight
                      })
                    }}
                  />

                  {/* 裁剪区域遮罩 */}
                  <div className="absolute inset-0 bg-black/40">
                    {/* 裁剪框 */}
                    <div
                      className="absolute border-2 border-white shadow-lg cursor-move"
                      style={{
                        left: `${cropArea.x}px`,
                        top: `${cropArea.y}px`,
                        width: `${cropArea.width}px`,
                        height: `${cropArea.height}px`,
                        borderRadius: shape === 'circle' ? '50%' : '8px'
                      }}
                      onMouseDown={handleCropMouseDown}
                    >
                      {/* 裁剪区域内的图片预览 */}
                      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: shape === 'circle' ? '50%' : '8px' }}>
                        <Image
                          src={originalImage}
                          alt="裁剪预览"
                          width={300}
                          height={300}
                          className="object-contain"
                          style={{
                            transform: `translate(${-cropArea.x}px, ${-cropArea.y}px) scale(${cropState.scale}) rotate(${cropState.rotation}deg)`,
                            transformOrigin: `${cropArea.x + cropArea.width / 2}px ${cropArea.y + cropArea.height / 2}px`
                          }}
                        />
                      </div>

                      {/* 裁剪框角落控制点 */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 控制按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-center" style={{ color: "var(--card-title-color)" }}>
                图片操作
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleRotate}
                  className="p-2 rounded-lg bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm hover:shadow-md transition-all"
                  title="旋转90度"
                >
                  <RotateCw className="w-4 h-4" style={{ color: "var(--card-text-color)" }} />
                </button>

                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm hover:shadow-md transition-all"
                  title="缩小图片"
                >
                  <ZoomOut className="w-4 h-4" style={{ color: "var(--card-text-color)" }} />
                </button>

                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm hover:shadow-md transition-all"
                  title="放大图片"
                >
                  <ZoomIn className="w-4 h-4" style={{ color: "var(--card-text-color)" }} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-center" style={{ color: "var(--card-title-color)" }}>
                裁剪区域
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleResizeCrop('decrease')}
                  className="p-2 rounded-lg bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm hover:shadow-md transition-all"
                  title="缩小裁剪区域"
                >
                  <Crop className="w-4 h-4" style={{ color: "var(--card-text-color)" }} />
                  <span className="text-xs ml-1">-</span>
                </button>

                <button
                  onClick={() => handleResizeCrop('increase')}
                  className="p-2 rounded-lg bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm hover:shadow-md transition-all"
                  title="放大裁剪区域"
                >
                  <Crop className="w-4 h-4" style={{ color: "var(--card-text-color)" }} />
                  <span className="text-xs ml-1">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* 状态信息 */}
          <div className="text-center space-y-1">
            <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
              缩放: {Math.round(cropState.scale * 100)}% | 旋转: {cropState.rotation}°
            </p>
            <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
              裁剪: {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px
            </p>
            <p className="text-xs text-blue-600">
              💡 拖拽白色框调整裁剪区域
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <PillButton
              variant="default"
              onClick={handleCropCancel}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </PillButton>
            <PillButton
              onClick={handleCropConfirm}
              className="flex-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isUploading ? '处理中...' : '确认'}
            </PillButton>
          </div>
        </div>
      </BottomDrawer>
    </div>
  )
}
