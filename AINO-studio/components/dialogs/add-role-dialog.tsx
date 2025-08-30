"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface AddRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissions: Permission[]
  onAddRole: (data: { name: string; description: string; permissions: string[] }) => void
}

export function AddRoleDialog({ open, onOpenChange, permissions, onAddRole }: AddRoleDialogProps) {
  const { toast } = useToast()
  const { locale } = useLocale()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ description: locale === "zh" ? "请输入角色名称" : "Please enter role name", variant: "destructive" })
      return
    }

    onAddRole({
      name: name.trim(),
      description: description.trim(),
      permissions: selectedPermissions,
    })

    onOpenChange(false)

    // 重置表单
    setName("")
    setDescription("")
    setSelectedPermissions([])
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = []
      acc[perm.category].push(perm)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="add-role-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            {locale === "zh" ? "添加角色" : "Add Role"}
          </DialogTitle>
          <DialogDescription id="add-role-description">{locale === "zh" ? "创建新的角色并配置权限" : "Create a new role and configure permissions"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{locale === "zh" ? "角色名称 *" : "Role Name *"}</Label>
              <Input placeholder={locale === "zh" ? "输入角色名称" : "Enter role name"} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{locale === "zh" ? "角色描述" : "Role Description"}</Label>
              <Input placeholder={locale === "zh" ? "输入角色描述" : "Enter role description"} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            <Label>{locale === "zh" ? "权限配置" : "Permission Configuration"}</Label>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-slate-700">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={perm.id}
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <Label htmlFor={perm.id} className="text-sm">
                          {perm.name === "查看" ? (locale === "zh" ? "查看" : "View") :
                           perm.name === "创建" ? (locale === "zh" ? "创建" : "Create") :
                           perm.name === "编辑" ? (locale === "zh" ? "编辑" : "Edit") :
                           perm.name === "删除" ? (locale === "zh" ? "删除" : "Delete") :
                           perm.name === "用户管理" ? (locale === "zh" ? "用户管理" : "User Management") :
                           perm.name === "角色管理" ? (locale === "zh" ? "角色管理" : "Role Management") :
                           perm.name === "系统设置" ? (locale === "zh" ? "系统设置" : "System Settings") :
                           perm.name === "数据导出" ? (locale === "zh" ? "数据导出" : "Data Export") :
                           perm.name === "API访问" ? (locale === "zh" ? "API访问" : "API Access") : perm.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit}>{locale === "zh" ? "创建角色" : "Create Role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
