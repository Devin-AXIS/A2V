"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { Lock, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { AppHeader } from "@/components/navigation/app-header"
import { 
  GenericFormCard,
  passwordChangeFields,
  passwordChangeDisplay,
  type PasswordChangeData,
  defaultPasswordChangeData
} from "@/components/card/profile-cards"

export default function PasswordChangePage() {
  const { locale } = useParams()

  // 模拟用户密码数据
  const [passwordData, setPasswordData] = useState<PasswordChangeData[]>([])

  const handlePasswordUpdate = (newData: any[]) => {
    // 验证确认密码
    const processedData = newData.map(item => {
      if (item.newPassword !== item.confirmPassword) {
        alert("新密码和确认密码不一致")
        return null
      }
      
      // 处理密码更新逻辑
      return {
        ...item,
        lastChangeTime: new Date().toLocaleString('zh-CN'),
        // 实际应用中这里会调用API更新密码
      }
    }).filter(Boolean)
    
    if (processedData.length > 0) {
      setPasswordData(processedData)
      alert("密码修改成功！")
    }
  }

  return (
    <main 
      className="min-h-screen"
      style={{ backgroundColor: "var(--background-secondary, #f8fafc)" }}
    >
      {/* 统一Header组件 */}
      <AppHeader 
        title="修改密码"
        showBackButton={true}
      />

      <div className="p-4 space-y-4 pt-20">
        {/* 密码安全提示 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
                  密码安全提示
                </h3>
                <ul className="space-y-1 text-xs" style={{ color: "var(--card-text-color)" }}>
                  <li>• 新密码长度应为8-20位</li>
                  <li>• 必须包含大写字母、小写字母和数字</li>
                  <li>• 不要使用生日、手机号等个人信息作为密码</li>
                  <li>• 建议定期更换密码，提升账号安全性</li>
                  <li>• 请妥善保管新密码，避免泄露</li>
                </ul>
              </div>
            </div>
          </div>
        </AppCard>

        {/* 最近密码修改记录 */}
        {passwordData.length > 0 && (
          <AppCard>
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
                    密码修改成功
                  </h3>
                  <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
                    上次修改时间：{passwordData[0]?.lastChangeTime}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--card-text-color)" }}>
                    修改原因：{passwordData[0]?.changeReason === 'security' ? '安全考虑' : 
                             passwordData[0]?.changeReason === 'regular' ? '定期更换' : 
                             passwordData[0]?.changeReason || '未指定'}
                  </p>
                </div>
              </div>
            </div>
          </AppCard>
        )}

        {/* 密码安全等级提示 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
                  密码强度要求
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span className="text-xs" style={{ color: "var(--card-text-color)" }}>弱：仅数字或字母</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-xs" style={{ color: "var(--card-text-color)" }}>中：数字+字母</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-xs" style={{ color: "var(--card-text-color)" }}>强：大小写字母+数字+特殊字符</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        {/* 修改密码表单 */}
        <GenericFormCard
          title="修改密码"
          data={passwordData}
          onUpdate={handlePasswordUpdate}
          fields={passwordChangeFields}
          displayConfig={passwordChangeDisplay}
          allowMultiple={false}
          emptyText="点击下方按钮开始修改密码"
        />
      </div>
    </main>
  )
}
