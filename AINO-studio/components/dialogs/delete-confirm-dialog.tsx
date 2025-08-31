"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/hooks/use-locale"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  itemName: string
  itemType: string
  onConfirm: () => Promise<void> | void
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  itemName,
  itemType,
  onConfirm,
  isLoading = false
}: DeleteConfirmDialogProps) {
  const { locale } = useLocale()
  const [internalLoading, setInternalLoading] = useState(false)

  const handleConfirm = async () => {
    setInternalLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('删除操作失败:', error)
    } finally {
      setInternalLoading(false)
    }
  }

  const isProcessing = isLoading || internalLoading

  const getItemTypeText = (type: string) => {
    const typeMap: Record<string, { zh: string; en: string }> = {
      'application': { zh: '应用', en: 'Application' },
      'module': { zh: '模块', en: 'Module' },
      'directory': { zh: '目录', en: 'Directory' },
      'field': { zh: '字段', en: 'Field' },
      'category': { zh: '分类', en: 'Category' },
      'record': { zh: '记录', en: 'Record' },
      'user': { zh: '用户', en: 'User' },
      'default': { zh: '项目', en: 'Item' }
    }
    
    const typeInfo = typeMap[type] || typeMap['default']
    return locale === "zh" ? typeInfo.zh : typeInfo.en
  }

  const getTitle = () => {
    if (title) return title
    
    const itemTypeText = getItemTypeText(itemType)
    return locale === "zh" 
      ? `确认删除${itemTypeText}` 
      : `Confirm Delete ${itemTypeText}`
  }

  const getDescription = () => {
    const itemTypeText = getItemTypeText(itemType)
    return locale === "zh" 
      ? `确定要删除${itemTypeText} "${itemName}" 吗？此操作不可撤销，相关数据将被删除。`
      : `Are you sure you want to delete ${itemTypeText} "${itemName}"? This action cannot be undone and related data will be deleted.`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[480px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="delete-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div id="delete-dialog-description" className="sr-only">
          {getDescription()}
        </div>

        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getTitle()}
            </h3>
            <p className="text-gray-500">
              {getDescription()}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)} 
            disabled={isProcessing}
          >
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing}
            variant="destructive"
          >
            {isProcessing ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {locale === "zh" ? "删除中..." : "Deleting..."}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {locale === "zh" ? "确认删除" : "Confirm Delete"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
