"use client"

import { useEffect, useState } from "react"
import { FrostPanel } from "@/components/frost"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Upload, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"
import { useAuth } from "@/hooks/use-auth"

export function PersonalSettings() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [avatarImage, setAvatarImage] = useState<string>(user?.avatar || "/generic-user-avatar.png")
  const [name, setName] = useState<string>(user?.name || "")
  const [email, setEmail] = useState<string>(user?.email || "")

  const departments = [
    { id: "1", name: locale === "zh" ? "技术部" : "Technology" },
    { id: "2", name: locale === "zh" ? "产品部" : "Product" },
    { id: "3", name: locale === "zh" ? "设计部" : "Design" },
  ]

  useEffect(() => {
    setAvatarImage(user?.avatar || "/generic-user-avatar.png")
    setName(user?.name || "")
    setEmail(user?.email || "")
  }, [user])

  const handleAvatarUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const file = files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setAvatarImage(result)
          toast({ description: locale === "zh" ? "头像上传成功" : "Avatar uploaded successfully" })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <FrostPanel>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{locale === "zh" ? "个人信息" : "Personal Information"}</h1>
          <p className="text-sm text-slate-600 mt-1">{locale === "zh" ? "管理您的个人资料和账户设置" : "Manage your profile and account settings"}</p>
        </div>
        <Button size="sm" onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          {isEditing ? (locale === "zh" ? "取消编辑" : "Cancel Edit") : (locale === "zh" ? "编辑资料" : "Edit Profile")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Avatar Section */}
        <Card className="bg-white/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{locale === "zh" ? "头像" : "Avatar"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-3 pt-0">
            <Avatar className="size-20">
              <AvatarImage src={avatarImage} />
              <AvatarFallback>{name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button size="sm" variant="outline" className="h-8 bg-transparent" onClick={handleAvatarUpload}>
                <Upload className="size-3 mr-2" />
                {locale === "zh" ? "上传新头像" : "Upload New Avatar"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="lg:col-span-2 bg-white/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{locale === "zh" ? "基本信息" : "Basic Information"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs">
                  {locale === "zh" ? "用户名" : "Username"}
                </Label>
                <Input id="username" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} className="h-8" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  {locale === "zh" ? "邮箱" : "Email"}
                </Label>
                <Input id="email" type="email" value={email} disabled className="h-8" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">
                  {locale === "zh" ? "手机号" : "Phone"}
                </Label>
                <Input id="phone" defaultValue="+86 138 0013 8000" disabled={!isEditing} className="h-8" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs">
                  {locale === "zh" ? "部门" : "Department"}
                </Label>
                <Select disabled={!isEditing}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder={locale === "zh" ? "选择部门" : "Select Department"} />
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs">
                {locale === "zh" ? "个人简介" : "Bio"}
              </Label>
              <Textarea
                id="bio"
                placeholder={locale === "zh" ? "介绍一下自己..." : "Tell us about yourself..."}
                disabled={!isEditing}
                defaultValue={locale === "zh" ? "全栈开发工程师，专注于 React 和 Node.js 开发" : "Full-stack developer, focused on React and Node.js development"}
                className="min-h-[60px] resize-none"
              />
            </div>
            {isEditing && (
              <Button
                size="sm"
                onClick={async () => {
                  await updateUser({ name, avatar: avatarImage })
                  setIsEditing(false)
                  toast({ description: locale === "zh" ? "个人信息已更新" : "Personal information updated" })
                }}
              >
                {locale === "zh" ? "保存更改" : "Save Changes"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card className="bg-white/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="size-4" />
            {locale === "zh" ? "安全设置" : "Security Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">{locale === "zh" ? "修改密码" : "Change Password"}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{locale === "zh" ? "定期更新密码以保护账户安全" : "Regularly update your password to protect your account"}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {locale === "zh" ? "修改密码" : "Change Password"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{locale === "zh" ? "修改密码" : "Change Password"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">{locale === "zh" ? "当前密码" : "Current Password"}</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} className="h-9" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{locale === "zh" ? "新密码" : "New Password"}</Label>
                    <Input type="password" className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{locale === "zh" ? "确认新密码" : "Confirm New Password"}</Label>
                    <Input type="password" className="h-9" />
                  </div>
                  <Button className="w-full">{locale === "zh" ? "更新密码" : "Update Password"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </FrostPanel>
  )
}
