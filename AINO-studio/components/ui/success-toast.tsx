"use client"

import { useState, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface SuccessToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function SuccessToast({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: SuccessToastProps) {
  const { locale } = useLocale()

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
