"use client"

import { FrostPanel } from "@/components/frost"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, Clock, MessageSquare, AlertCircle, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"

export function NotificationsSettings() {
  const { toast } = useToast()
  const { locale } = useLocale()

  const notifications = [
    {
      id: "1",
      type: "system",
      title: locale === "zh" ? "系统维护通知" : "System Maintenance Notice",
      message: locale === "zh" ? "系统将于今晚 23:00-01:00 进行维护升级，期间服务可能暂时中断。" : "System will undergo maintenance upgrade tonight from 23:00-01:00, services may be temporarily interrupted.",
      time: "2024-01-15 14:30",
      read: false,
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      id: "2",
      type: "team",
      title: locale === "zh" ? "新成员加入" : "New Member Joined",
      message: locale === "zh" ? "Alice 已加入您的团队，角色为编辑者。" : "Alice has joined your team as an editor.",
      time: "2024-01-15 12:15",
      read: true,
      icon: UserPlus,
      color: "text-blue-600",
    },
    {
      id: "3",
      type: "security",
      title: locale === "zh" ? "登录异常提醒" : "Login Alert",
      message: locale === "zh" ? "检测到来自新设备的登录，如非本人操作请及时修改密码。" : "Login detected from a new device. If this wasn't you, please change your password immediately.",
      time: "2024-01-15 10:45",
      read: false,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ]

  const markAllAsRead = () => {
    toast({ description: locale === "zh" ? "所有通知已标记为已读" : "All notifications marked as read" })
  }

  const markAsRead = (notificationId: string) => {
    toast({ description: locale === "zh" ? "已标记为已读" : "Marked as read" })
  }

  return (
    <FrostPanel>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{locale === "zh" ? "通知" : "Notifications"}</h1>
          <p className="text-sm text-slate-600 mt-1">{locale === "zh" ? "查看您的所有通知消息" : "View all your notification messages"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          <Check className="size-4 mr-2" />
          {locale === "zh" ? "全部标记为已读" : "Mark All as Read"}
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <Card
              key={notification.id}
              className={`transition-all bg-white/60 ${notification.read ? "opacity-75" : "border-blue-200"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg bg-slate-100 ${notification.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium text-sm ${notification.read ? "text-slate-600" : "text-slate-900"}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="size-3" />
                          {notification.time}
                        </span>
                        {!notification.read && <div className="size-2 bg-blue-600 rounded-full"></div>}
                      </div>
                    </div>
                    <p className={`text-xs ${notification.read ? "text-slate-500" : "text-slate-700"}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs h-6 px-2"
                        >
                          {locale === "zh" ? "标记为已读" : "Mark as Read"}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-red-600">
                        <X className="size-3 mr-1" />
                        {locale === "zh" ? "删除" : "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-8">
          <div className="size-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="size-6 text-slate-400" />
          </div>
          <h3 className="text-base font-medium text-slate-900 mb-1">{locale === "zh" ? "暂无通知" : "No Notifications"}</h3>
          <p className="text-sm text-slate-600">{locale === "zh" ? "您的所有通知都会显示在这里" : "All your notifications will appear here"}</p>
        </div>
      )}
    </FrostPanel>
  )
}
