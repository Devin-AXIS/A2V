"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications, type Notification } from "./notification-provider"
import { Glass } from "@/components/glass"

interface NotificationItemProps {
  notification: Notification
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { removeNotification } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const Icon = iconMap[notification.type]

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeNotification(notification.id)
    }, 200)
  }

  return (
    <div
      className={`transform transition-all duration-200 ease-out ${
        isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Glass className="p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${colorMap[notification.type]}`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 leading-tight">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
                )}
              </div>

              <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {notification.action && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notification.action?.onClick()
                    handleClose()
                  }}
                  className="bg-white/70 backdrop-blur border-white/60 text-xs"
                >
                  {notification.action.label}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Glass>
    </div>
  )
}
