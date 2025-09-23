"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { Shield, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { AppHeader } from "@/components/navigation/app-header"
import {
  GenericFormCard,
  identityVerificationFields,
  identityVerificationDisplay,
  type IdentityVerificationData,
  defaultIdentityVerificationData
} from "@/components/card/cards/user/profile-cards"

export default function IdentityVerificationPage() {
  const { locale } = useParams()

  // 模拟用户数据 - 在实际应用中应该从API获取
  const [identityData, setIdentityData] = useState<IdentityVerificationData[]>([
    // 示例：已提交但待审核的数据
    // {
    //   id: 1,
    //   realName: "张三",
    //   idNumber: "110101199001011234",
    //   idCardFront: "/uploads/id-front.jpg",
    //   idCardBack: "/uploads/id-back.jpg",
    //   verificationStatus: "pending",
    //   submitTime: "2024-01-15 10:30:00"
    // }
  ])

  const handleDataUpdate = (newData: any[]) => {
    // 处理数据更新
    const processedData = newData.map(item => ({
      ...item,
      submitTime: item.submitTime || new Date().toLocaleString('zh-CN'),
      verificationStatus: item.verificationStatus || 'pending'
    }))
    setIdentityData(processedData)
  }

  // 获取认证状态信息
  const getVerificationStatusInfo = () => {
    if (identityData.length === 0) {
      return {
        status: 'not_submitted',
        title: '未提交认证',
        description: '完成实名认证，提升账号安全性',
        icon: <Shield className="w-6 h-6 text-gray-400" />,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600'
      }
    }

    const currentData = identityData[0]
    switch (currentData.verificationStatus) {
      case 'pending':
        return {
          status: 'pending',
          title: '审核中',
          description: '您的实名认证信息正在审核中，请耐心等待',
          icon: <Clock className="w-6 h-6 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600'
        }
      case 'approved':
        return {
          status: 'approved',
          title: '认证通过',
          description: '恭喜！您的实名认证已通过',
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-600'
        }
      case 'rejected':
        return {
          status: 'rejected',
          title: '认证失败',
          description: '您的实名认证未通过，请重新提交',
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-600'
        }
      default:
        return {
          status: 'not_submitted',
          title: '未提交认证',
          description: '完成实名认证，提升账号安全性',
          icon: <Shield className="w-6 h-6 text-gray-400" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600'
        }
    }
  }

  const statusInfo = getVerificationStatusInfo()

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--background-secondary, #f8fafc)" }}
    >
      {/* 统一Header组件 */}
      <AppHeader
        title="实名认证"
        showBackButton={true}
      />

      <div className="p-4 space-y-4 pt-20">
        {/* 认证状态卡片 */}
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
                {identityData.length > 0 && identityData[0].submitTime && (
                  <p className="text-xs mt-2 text-gray-500">
                    提交时间：{identityData[0].submitTime}
                  </p>
                )}
                {identityData.length > 0 && identityData[0].reviewTime && (
                  <p className="text-xs mt-1 text-gray-500">
                    审核时间：{identityData[0].reviewTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        </AppCard>

        {/* 认证须知 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
                  认证须知
                </h3>
                <ul className="space-y-1 text-xs" style={{ color: "var(--card-text-color)" }}>
                  <li>• 请确保身份证照片清晰完整，四角完整可见</li>
                  <li>• 身份证信息必须真实有效，与本人一致</li>
                  <li>• 认证信息提交后1-3个工作日内完成审核</li>
                  <li>• 认证通过后将无法修改，请仔细核对信息</li>
                  <li>• 我们承诺严格保护您的个人信息安全</li>
                </ul>
              </div>
            </div>
          </div>
        </AppCard>

        {/* 实名认证表单 */}
        <GenericFormCard
          title="实名认证信息"
          data={identityData}
          onUpdate={handleDataUpdate}
          fields={identityVerificationFields}
          displayConfig={{
            ...identityVerificationDisplay,
            emptyTitle: statusInfo.status === 'rejected' ? '重新提交认证' : '开始认证',
            emptySubtitle: statusInfo.status === 'rejected'
              ? '请根据拒绝原因重新提交认证信息'
              : '请填写真实有效的身份信息',
            addButtonText: statusInfo.status === 'rejected' ? '重新提交' : '开始认证',
            editButtonText: statusInfo.status === 'pending' ? '查看详情' : '修改信息'
          }}
          allowMultiple={false}
          emptyText={statusInfo.status === 'rejected' ? '认证被拒绝，请重新提交' : '尚未提交认证信息'}
        />
      </div>
    </main>
  )
}