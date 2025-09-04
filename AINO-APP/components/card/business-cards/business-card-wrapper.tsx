"use client"

import type React from "react"

import { useState } from "react"
import { AppCard } from "@/components/layout/app-card"
import { CardRegistry } from "../registry"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { BusinessCardProps } from "@/types"

interface BusinessCardWrapperProps extends BusinessCardProps {
  cardName: string
  className?: string
  disableLocalTheme?: boolean
}

export function BusinessCardWrapper({
  cardName,
  onAction,
  className,
  disableLocalTheme = true,
  ...props
}: BusinessCardWrapperProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)
  const [modalTitle, setModalTitle] = useState<string>("")
  const router = useRouter()

  const CardComponent = CardRegistry.get(cardName)?.component
  const cardConfig = CardRegistry.getConfig(cardName)

  if (!CardComponent) {
    return (
      <AppCard className={className} disableLocalTheme={disableLocalTheme}>
        <div className="p-4 text-center" style={{ color: "var(--card-text-color)" }}>
          卡片 "{cardName}" 未找到
        </div>
      </AppCard>
    )
  }

  const handleCardAction = (action: string, data: any) => {
    // 处理内置业务流动作
    switch (action) {
      case "openDetail":
        if (cardConfig?.businessFlow?.hasDetailPage) {
          router.push(`/cards/${cardName}/detail/${data.id}`)
        }
        break
      case "openModal":
        if (cardConfig?.businessFlow?.hasModal) {
          setModalContent(data.content)
          setModalTitle(data.title || `${cardName} 详情`)
          setModalOpen(true)
        }
        break
      default:
        // 执行注册的自定义动作处理器
        CardRegistry.executeAction(cardName, { type: "custom", target: action, data })
        // 调用外部处理器
        onAction?.(action, data)
    }
  }

  return (
    <>
      <CardComponent
        {...props}
        onAction={handleCardAction}
        className={className ? `${className} h-full w-full` : "h-full w-full"}
        disableLocalTheme={disableLocalTheme}
      />

      {/* 内置弹窗系统 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">{modalContent}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
