"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/hooks/use-locale"

interface SimpleModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: any
  type: "config" | "uninstall"
  onConfirm: (data?: any) => void
}

export function SimpleModuleDialog({
  open,
  onOpenChange,
  module,
  type,
  onConfirm
}: SimpleModuleDialogProps) {
  const { locale } = useLocale()
  const [isLoading, setIsLoading] = useState(false)
  
  // 根据模块类型初始化配置
  const [config, setConfig] = useState({
    // 用户模块配置
    allowRegistration: true,
    requireEmailVerification: false,
    defaultRole: 'user',
    passwordPolicy: {
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    }
  })

  useEffect(() => {
    if (module && type === "config") {
      // 根据模块类型设置不同的默认配置
      if (module.name === "用户管理" || module.name === "User Management") {
        setConfig({
          allowRegistration: true,
          requireEmailVerification: false,
          defaultRole: 'user',
          passwordPolicy: {
            minLength: 6,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false,
          }
        })
      }
    }
  }, [module, type])

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      if (type === "config") {
        await onConfirm(config)
      } else {
        await onConfirm()
      }
      onOpenChange(false)
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!module) return null

  const isUserModule = module.name === "用户管理" || module.name === "User Management"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[480px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="module-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>
            {type === "config" 
              ? (locale === "zh" ? "配置模块" : "Configure Module")
              : (locale === "zh" ? "卸载模块" : "Uninstall Module")
            }
          </DialogTitle>
        </DialogHeader>
        
        <div id="module-dialog-description" className="sr-only">
          {type === "config" 
            ? "Configure module settings and parameters"
            : "Confirm module uninstallation"
          }
        </div>

        {type === "config" ? (
          <div className="space-y-4">
            {isUserModule ? (
              // 用户模块配置
              <>
                <div className="space-y-2">
                  <Label>{locale === "zh" ? "模块名称" : "Module Name"}</Label>
                  <Input value={module.name} disabled className="bg-gray-50" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{locale === "zh" ? "允许用户注册" : "Allow Registration"}</Label>
                    <p className="text-sm text-gray-500">
                      {locale === "zh" ? "是否允许新用户注册" : "Allow new users to register"}
                    </p>
                  </div>
                  <Switch
                    checked={config.allowRegistration}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, allowRegistration: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{locale === "zh" ? "需要邮箱验证" : "Require Email Verification"}</Label>
                    <p className="text-sm text-gray-500">
                      {locale === "zh" ? "注册时是否需要验证邮箱" : "Require email verification on registration"}
                    </p>
                  </div>
                  <Switch
                    checked={config.requireEmailVerification}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, requireEmailVerification: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{locale === "zh" ? "默认角色" : "Default Role"}</Label>
                  <Select 
                    value={config.defaultRole} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, defaultRole: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{locale === "zh" ? "普通用户" : "User"}</SelectItem>
                      <SelectItem value="admin">{locale === "zh" ? "管理员" : "Admin"}</SelectItem>
                      <SelectItem value="guest">{locale === "zh" ? "访客" : "Guest"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>{locale === "zh" ? "密码策略" : "Password Policy"}</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">{locale === "zh" ? "最小长度" : "Minimum Length"}</Label>
                    <Input
                      type="number"
                      value={config.passwordPolicy.minLength}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) || 6 }
                      }))}
                      min="4"
                      max="20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{locale === "zh" ? "需要大写字母" : "Require Uppercase"}</Label>
                    <Switch
                      checked={config.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{locale === "zh" ? "需要小写字母" : "Require Lowercase"}</Label>
                    <Switch
                      checked={config.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireLowercase: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{locale === "zh" ? "需要数字" : "Require Numbers"}</Label>
                    <Switch
                      checked={config.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{locale === "zh" ? "需要特殊字符" : "Require Special Characters"}</Label>
                    <Switch
                      checked={config.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: checked }
                      }))}
                    />
                  </div>
                </div>
              </>
            ) : (
              // 其他模块的通用配置
              <>
                <div className="space-y-2">
                  <Label>{locale === "zh" ? "模块名称" : "Module Name"}</Label>
                  <Input value={module.name} disabled className="bg-gray-50" />
                </div>
                <div className="text-center py-8 text-gray-500">
                  {locale === "zh" ? "该模块暂无特殊配置项" : "No special configuration options for this module"}
                </div>
              </>
            )}
          </div>
        ) : (
          // 卸载确认 - 使用简化的确认信息
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {locale === "zh" ? "确认卸载模块" : "Confirm Module Uninstall"}
              </h3>
              <p className="text-gray-500">
                {locale === "zh" 
                  ? `确定要卸载模块 "${module.name}" 吗？此操作不可撤销，相关数据将被删除。`
                  : `Are you sure you want to uninstall module "${module.name}"? This action cannot be undone and related data will be deleted.`
                }
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            variant={type === "uninstall" ? "destructive" : "default"}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {locale === "zh" ? "处理中..." : "Processing..."}
              </>
            ) : (
              <>
                {type === "config" ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {locale === "zh" ? "保存" : "Save"}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {locale === "zh" ? "确认卸载" : "Confirm Uninstall"}
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
