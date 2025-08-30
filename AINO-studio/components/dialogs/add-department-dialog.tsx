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
import { Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"

interface Member {
  id: string
  name: string
}

interface AddDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  onAddDepartment: (data: { name: string; description: string; leaderId?: string }) => void
}

export function AddDepartmentDialog({ open, onOpenChange, members, onAddDepartment }: AddDepartmentDialogProps) {
  const { toast } = useToast()
  const { locale } = useLocale()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [leaderId, setLeaderId] = useState("")

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ description: locale === "zh" ? "请输入部门名称" : "Please enter department name", variant: "destructive" })
      return
    }

    onAddDepartment({
      name: name.trim(),
      description: description.trim(),
      leaderId: leaderId || undefined,
    })

    onOpenChange(false)

    // 重置表单
    setName("")
    setDescription("")
    setLeaderId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="add-department-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="size-5" />
            {locale === "zh" ? "添加部门" : "Add Department"}
          </DialogTitle>
          <DialogDescription id="add-department-description">{locale === "zh" ? "创建新的部门" : "Create a new department"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{locale === "zh" ? "部门名称 *" : "Department Name *"}</Label>
            <Input placeholder={locale === "zh" ? "输入部门名称" : "Enter department name"} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{locale === "zh" ? "部门描述" : "Department Description"}</Label>
            <Textarea placeholder={locale === "zh" ? "输入部门描述" : "Enter department description"} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{locale === "zh" ? "部门负责人（可选）" : "Department Leader (Optional)"}</Label>
                          <Select value={leaderId} onValueChange={setLeaderId}>
                <SelectTrigger>
                  <SelectValue placeholder={locale === "zh" ? "选择负责人" : "Select leader"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{locale === "zh" ? "无负责人" : "No leader"}</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit}>{locale === "zh" ? "创建部门" : "Create Department"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
