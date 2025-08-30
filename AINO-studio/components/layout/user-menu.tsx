"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, Bell } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useNotifications } from "@/components/notifications/notification-provider"
import { useLocale } from "@/hooks/use-locale"

export function UserMenu() {
  const { locale } = useLocale()
  const { user, logout } = useAuth()
  const { addNotification } = useNotifications()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  const handleLogout = () => {
    logout()
    addNotification({
      type: "success",
      title: locale === "zh" ? "已退出登录" : "Logged Out",
      message: locale === "zh" ? "您已成功退出账户" : "You have successfully logged out",
    })
  }

  const handleAuthSuccess = (userData: any) => {
    addNotification({
      type: "success",
      title: locale === "zh" ? "登录成功" : "Login Successful",
      message: locale === "zh" ? `欢迎回来，${userData.name}！` : `Welcome back, ${userData.name}!`,
    })
  }

  if (!user) {
    return (
      <>
        <Button
          onClick={() => setAuthDialogOpen(true)}
          variant="outline"
          className="bg-white/70 backdrop-blur border-white/60 hover:bg-white/80"
        >
          {locale === "zh" ? "登录" : "Sign In"}
        </Button>

        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} onAuthSuccess={handleAuthSuccess} />
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="relative bg-white/70 backdrop-blur border-white/60 hover:bg-white/80"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-white/70 backdrop-blur">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 bg-white/90 backdrop-blur-xl border-white/60" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>{locale === "zh" ? "个人资料" : "Profile"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>{locale === "zh" ? "设置" : "Settings"}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{locale === "zh" ? "退出登录" : "Log Out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
