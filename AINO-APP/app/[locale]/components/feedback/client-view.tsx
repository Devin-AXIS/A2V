"use client"

import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { PillButton } from "@/components/basic/pill-button"
import { useState } from "react"

export function FeedbackClientView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="space-y-8 p-4">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">底部抽屉 Bottom Drawer</h2>
        <p className="text-muted-foreground">
          通用的底部抽屉组件，从底部滑出占据屏幕一半高度，支持主题配置和最高层级显示。
        </p>

        <PillButton onClick={() => setIsDrawerOpen(true)}>打开底部抽屉</PillButton>

        <BottomDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="示例抽屉">
          <div className="p-4 space-y-4">
            <p>这是一个通用的底部抽屉组件示例。</p>
            <p>它会从底部滑出，占据屏幕的一半高度。</p>
            <p>背景颜色会跟随卡片主题配置，并且永远显示在最上层。</p>
            <div className="space-y-2">
              <div className="h-20 bg-muted rounded-lg flex items-center justify-center">示例内容区域 1</div>
              <div className="h-20 bg-muted rounded-lg flex items-center justify-center">示例内容区域 2</div>
              <div className="h-20 bg-muted rounded-lg flex items-center justify-center">示例内容区域 3</div>
            </div>
          </div>
        </BottomDrawer>
      </div>
    </div>
  )
}
