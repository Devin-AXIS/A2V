"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface ModuleUninstallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName: string
  onConfirm: () => void
}

export function ModuleUninstallDialog({
  open,
  onOpenChange,
  moduleName,
  onConfirm
}: ModuleUninstallDialogProps) {
  const { locale } = useLocale()

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            {locale === "zh" ? "确认卸载模块" : "Confirm Module Uninstall"}
          </DialogTitle>
          <DialogDescription className="pt-4">
            {locale === "zh" ? (
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
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            <Trash2 className="size-4 mr-2" />
            {locale === "zh" ? "确认卸载" : "Confirm Uninstall"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
