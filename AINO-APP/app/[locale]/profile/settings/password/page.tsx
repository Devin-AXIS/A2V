"use client"

import React, { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { AppCard } from "@/components/layout/app-card"
import { AppHeader } from "@/components/navigation/app-header"

export default function PasswordChangePage() {
  const { locale } = useParams()
  const router = useRouter()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const applicationId = useMemo(() => {
    try {
      const appConfigStr = typeof window !== 'undefined' ? window.localStorage.getItem('APPLICATION_CONFIG') : null
      const appConfig = appConfigStr ? JSON.parse(appConfigStr) : null
      return appConfig?.id || ""
    } catch {
      return ""
    }
  }, [])

  const phoneNumber = useMemo(() => {
    try {
      const userStr = typeof window !== 'undefined' ? window.localStorage.getItem('aino_user') : null
      const user = userStr ? JSON.parse(userStr) : null
      return user?.phone || ""
    } catch {
      return ""
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("请完整填写所有字段")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("新密码与确认密码不一致")
      return
    }
    if (!phoneNumber) {
      setError("未获取到当前用户手机号，请重新登录后再试")
      return
    }
    if (!applicationId) {
      setError("未获取到应用ID，请检查应用配置")
      return
    }

    try {
      setSubmitting(true)
      // 优先读取标准键名，其次读取带 appId 的作用域键，最后兜底旧键名
      const scopedKey = applicationId ? `aino_auth_token:${applicationId}` : null
      const token =
        (scopedKey ? window.localStorage.getItem(scopedKey) : null)
        || window.localStorage.getItem('aino_auth_token')
        || window.localStorage.getItem('aino_token')
        || ''

      const res = await axios.post(`http://localhost:3007/api/application-users/change-password?applicationId=${applicationId}`,
        {
          phone_number: phoneNumber,
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      )
      const ok = res?.data?.success
      if (ok) {
        setSuccess("密码修改成功")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        // 返回设置页
        setTimeout(() => {
          router.push(`/${locale}/profile/settings`)
        }, 800)
      } else {
        setError(res?.data?.error || "修改密码失败")
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "修改密码失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--background-secondary, #f8fafc)" }}
    >
      <AppHeader
        title="修改密码"
        showBackButton={true}
      />

      <div className="p-4 space-y-4 pt-20">
        <AppCard>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--card-title-color)" }}>原密码</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white/70"
                placeholder="请输入原密码"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--card-title-color)" }}>新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white/70"
                placeholder="请输入新密码（至少6位）"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--card-title-color)" }}>确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white/70"
                placeholder="请再次输入新密码"
              />
            </div>

            {error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : null}
            {success ? (
              <p className="text-xs text-green-600">{success}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full bg-black text-white text-sm disabled:opacity-60"
            >
              {submitting ? "提交中..." : "确认修改"}
            </button>
          </form>
        </AppCard>
      </div>
    </main>
  )
}