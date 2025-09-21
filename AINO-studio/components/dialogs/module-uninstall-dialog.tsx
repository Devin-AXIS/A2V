"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface ModuleUninstallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName: string
  moduleType?: string
  onConfirm: () => Promise<void>
}

export function ModuleUninstallDialog({
  open,
  onOpenChange,
  moduleName,
  moduleType = 'local',
  onConfirm
}: ModuleUninstallDialogProps) {
  const { locale } = useLocale()
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('卸载模块失败:', error)
      // 错误处理会在父组件中显示toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            {moduleType === 'system'
              ? (locale === "zh" ? "确认删除系统模块" : "Confirm System Module Deletion")
              : (locale === "zh" ? "确认卸载模块" : "Confirm Module Uninstall")
            }
          </DialogTitle>
          <DialogDescription className="pt-4">
            {moduleType === 'system' ? (
              locale === "zh" ? (
                <>
                  <p className="mb-4">
                    您即将删除系统模块 <strong>"{moduleName}"</strong>。此操作将：
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-4">
                    <li>永久删除系统核心功能</li>
                    <li>删除所有相关数据和配置</li>
                    <li>可能影响其他模块的正常运行</li>
                    <li>导致系统功能缺失</li>
                  </ul>
                  <p className="text-red-600 font-medium">
                    <strong>警告：</strong>删除系统模块可能导致系统不稳定，此操作不可撤销！
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    You are about to delete the system module <strong>"{moduleName}"</strong>. This action will:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-4">
                    <li>Permanently delete core system functionality</li>
                    <li>Delete all related data and configuration</li>
                    <li>May affect other modules' normal operation</li>
                    <li>Cause system functionality loss</li>
                  </ul>
                  <p className="text-red-600 font-medium">
                    <strong>Warning:</strong> Deleting system modules may cause system instability. This action cannot be undone!
                  </p>
                </>
              )
            ) : (
              locale === "zh" ? (
                <>
                  <p className="mb-4">
                    您即将卸载模块 <strong>"{moduleName}"</strong>。此操作将：
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-4">
                    <li>停止模块的所有功能</li>
                    <li>删除模块的所有数据</li>
                    <li>移除模块的配置设置</li>
                    <li>断开与其他模块的关联</li>
                  </ul>
                  <p className="text-red-600 font-medium">
                    此操作不可撤销，请确认您要卸载此模块。
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    You are about to uninstall the module <strong>"{moduleName}"</strong>. This action will:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-4">
                    <li>Stop all module functionality</li>
                    <li>Delete all module data</li>
                    <li>Remove module configuration settings</li>
                    <li>Disconnect from other modules</li>
                  </ul>
                  <p className="text-red-600 font-medium">
                    This action cannot be undone. Please confirm that you want to uninstall this module.
                  </p>
                </>
              )
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="size-4 mr-2" />
            )}
            {isLoading
              ? (locale === "zh" ? "处理中..." : "Processing...")
              : (moduleType === 'system'
                ? (locale === "zh" ? "确认删除" : "Confirm Delete")
                : (locale === "zh" ? "确认卸载" : "Confirm Uninstall")
              )
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
