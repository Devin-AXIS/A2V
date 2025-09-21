"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: Array<{ id: string; name: string }>
  departments: Array<{ id: string; name: string }>
}

export function InviteMemberDialog({ open, onOpenChange, roles, departments }: InviteMemberDialogProps) {
  const { toast } = useToast()
  const { locale } = useLocale()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [department, setDepartment] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    if (!email || !role) {
      toast({ description: locale === "zh" ? "请填写必填字段" : "Please fill in required fields", variant: "destructive" })
      return
    }

    // 这里应该调用API发送邀请
    onOpenChange(false)
    toast({ description: locale === "zh" ? "邀请已发送" : "Invitation sent" })

    // 重置表单
    setEmail("")
    setRole("")
    setDepartment("")
    setMessage("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="invite-member-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            {locale === "zh" ? "邀请团队成员" : "Invite Team Member"}
          </DialogTitle>
          <DialogDescription id="invite-member-description">{locale === "zh" ? "邀请新成员加入您的团队" : "Invite new members to join your team"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{locale === "zh" ? "邮箱地址 *" : "Email Address *"}</Label>
            <Input placeholder={locale === "zh" ? "输入邮箱地址" : "Enter email address"} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{locale === "zh" ? "角色 *" : "Role *"}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder={locale === "zh" ? "选择角色" : "Select role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{locale === "zh" ? "部门" : "Department"}</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder={locale === "zh" ? "选择部门" : "Select department"} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{locale === "zh" ? "邀请消息（可选）" : "Invitation Message (Optional)"}</Label>
            <Textarea placeholder={locale === "zh" ? "添加个人消息..." : "Add personal message..."} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit}>{locale === "zh" ? "发送邀请" : "Send Invitation"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
