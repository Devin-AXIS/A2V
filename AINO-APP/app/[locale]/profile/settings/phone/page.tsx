"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { Smartphone, Shield, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { AppHeader } from "@/components/navigation/app-header"
import { PillButton } from "@/components/basic/pill-button"
import {
  GenericFormCard,
  phoneBindingFields,
  phoneBindingDisplay,
  type PhoneBindingData,
  defaultPhoneBindingData
} from "@/components/card/profile-cards"

export default function PhoneBindingPage() {
  const { locale } = useParams()

  // 模拟当前绑定状态
  const [currentPhone, setCurrentPhone] = useState("138****8888") // 模拟已绑定手机号
  const [phoneData, setPhoneData] = useState<PhoneBindingData[]>([])
  const [countdown, setCountdown] = useState(0)

  // 发送验证码
  const handleSendCode = () => {
    if (countdown > 0) return

    // 模拟发送验证码
    alert("验证码已发送到您的手机")
    setCountdown(60)

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handlePhoneUpdate = (newData: any[]) => {
    // 验证码验证逻辑
    const processedData = newData.map(item => {
      if (!item.newPhone || !item.verificationCode) {
        alert("请填写完整信息")
        return null
      }

      // 模拟验证码验证
      if (item.verificationCode !== "123456") {
        alert("验证码错误")
        return null
      }

      return {
        ...item,
        currentPhone: currentPhone,
        bindingTime: new Date().toLocaleString('zh-CN'),
        bindingStatus: "bound" as const
      }
    }).filter(Boolean)

    if (processedData.length > 0) {
      setPhoneData(processedData)
      setCurrentPhone(processedData[0].newPhone)
      alert("手机绑定成功！")
    }
  }

  // 获取绑定状态信息
  const getBindingStatusInfo = () => {
    if (!currentPhone || currentPhone.includes("*")) {
      return {
        status: 'unbound',
        title: '未绑定手机',
        description: '绑定手机号码，提升账号安全性',
        icon: <Smartphone className="w-6 h-6 text-gray-400" />,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600'
      }
    }

    return {
      status: 'bound',
      title: '已绑定手机',
      description: `当前绑定手机：${currentPhone}`,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  }

  const statusInfo = getBindingStatusInfo()

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--background-secondary, #f8fafc)" }}
    >
      {/* 统一Header组件 */}
      <AppHeader
        title="手机绑定"
        showBackButton={true}
      />

      <div className="p-4 space-y-4 pt-20">
        {/* 绑定状态卡片 */}
        <AppCard>
          <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
            <div className="flex items-start space-x-3">
              {statusInfo.icon}
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${statusInfo.textColor}`}>
                  {statusInfo.title}
                </h3>
                <p className={`text-xs mt-1 ${statusInfo.textColor}`}>
                  {statusInfo.description}
                </p>
                {phoneData.length > 0 && phoneData[0].bindingTime && (
                  <p className="text-xs mt-2 text-gray-500">
                    绑定时间：{phoneData[0].bindingTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        </AppCard>

        {/* 手机号用途说明 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
                  手机号用途
                </h3>
                <ul className="space-y-1 text-xs" style={{ color: "var(--card-text-color)" }}>
                  <li>• 账号登录验证</li>
                  <li>• 密码找回验证</li>
                  <li>• 重要操作二次确认</li>
                  <li>• 安全状态变更通知</li>
                  <li>• 账号异常登录提醒</li>
                </ul>
              </div>
            </div>
          </div>
        </AppCard>

        {/* 验证码发送 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--card-title-color)" }}>
                    获取验证码
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--card-text-color)" }}>
                    点击发送验证码到您的手机
                  </p>
                </div>
              </div>
              <PillButton
                onClick={handleSendCode}
                disabled={countdown > 0}
                variant="default"
              >
                {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
              </PillButton>
            </div>
          </div>
        </AppCard>

        {/* 安全提示 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
                  安全提示
                </h3>
                <ul className="space-y-1 text-xs" style={{ color: "var(--card-text-color)" }}>
                  <li>• 请确保手机号码真实有效，能够正常接收短信</li>
                  <li>• 更换手机号需要验证原手机号和新手机号</li>
                  <li>• 解绑手机号会影响账号安全，请谨慎操作</li>
                  <li>• 如手机号已停用，请及时更新绑定信息</li>
                </ul>
              </div>
            </div>
          </div>
        </AppCard>

        {/* 手机绑定表单 */}
        <GenericFormCard
          title="手机绑定管理"
          data={phoneData}
          onUpdate={handlePhoneUpdate}
          fields={phoneBindingFields.map(field =>
            field.key === 'currentPhone'
              ? { ...field, placeholder: currentPhone || "暂无绑定手机" }
              : field
          )}
          displayConfig={{
            ...phoneBindingDisplay,
            emptyTitle: statusInfo.status === 'bound' ? '更换手机号' : '绑定手机号',
            emptySubtitle: statusInfo.status === 'bound'
              ? '更换绑定的手机号码'
              : '绑定手机号码，提升账号安全性',
            addButtonText: statusInfo.status === 'bound' ? '更换手机' : '绑定手机'
          }}
          allowMultiple={false}
          emptyText={statusInfo.status === 'bound' ? '当前已绑定手机号' : '尚未绑定手机号'}
        />
      </div>
    </main>
  )
}