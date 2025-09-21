"use client"

import { useState } from "react"
import Image from "next/image"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Input } from "@/components/ui/input"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { CitySelectMobile } from "@/components/input/city-select-mobile"
import { DatePickerWithValue } from "@/components/input/date-picker-with-value"
import { BottomDrawerSelect } from "@/components/input/bottom-drawer-select"
import { ImageUpload } from "@/components/input/image-upload"
import { User, Camera, Edit, MapPin, Globe } from "lucide-react"

// 基础资料类型定义
export interface BasicInfo {
  name: string
  avatar: string
  gender: string
  country: string
  city: string
  birthday: string
  bio: string
  profession: string
}

interface BasicInfoCardProps {
  basicInfo: BasicInfo
  onUpdate: (basicInfo: BasicInfo) => void
  title?: string
}

// 国家列表（实际使用时从API获取）
const countries = [
  { code: "CN", name: "中国", flag: "🇨🇳" },
  { code: "US", name: "美国", flag: "🇺🇸" },
  { code: "JP", name: "日本", flag: "🇯🇵" },
  { code: "KR", name: "韩国", flag: "🇰🇷" },
  { code: "UK", name: "英国", flag: "🇬🇧" },
  { code: "CA", name: "加拿大", flag: "🇨🇦" },
  { code: "AU", name: "澳大利亚", flag: "🇦🇺" },
  { code: "DE", name: "德国", flag: "🇩🇪" },
  { code: "FR", name: "法国", flag: "🇫🇷" },
  { code: "SG", name: "新加坡", flag: "🇸🇬" },
]

export function BasicInfoCard({ 
  basicInfo, 
  onUpdate, 
  title = "基础资料" 
}: BasicInfoCardProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState(basicInfo)

  // 打开编辑表单
  const handleEdit = () => {
    setFormData(basicInfo)
    setShowEditForm(true)
  }


  // 保存基础资料
  const handleSave = () => {
    if (!formData.name) {
      alert("请填写姓名")
      return
    }

    onUpdate(formData)
    setShowEditForm(false)
  }

  // 获取国家显示名称
  const getCountryDisplay = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    return country ? `${country.flag} ${country.name}` : countryCode
  }

  return (
    <>
      <AppCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: "var(--card-title-color)" }}>{title}</h3>
            <button onClick={handleEdit}>
              <Edit className="w-4 h-4" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* 头像展示 */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "var(--card-accent-color, linear-gradient(135deg, #3b82f6, #8b5cf6))" }}
              >
                {basicInfo.avatar ? (
                  <Image
                    src={basicInfo.avatar}
                    alt="头像"
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            {/* 基础信息展示 - 简洁版 */}
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1" style={{ color: "var(--card-title-color)" }}>
                {basicInfo.name || "未设置姓名"}
              </h2>
              <div className="space-y-1 text-sm" style={{ color: "var(--card-text-color)" }}>
                {basicInfo.profession && (
                  <p>{basicInfo.profession}</p>
                )}
                <div className="flex items-center gap-4">
                  {basicInfo.gender && (
                    <span>性别：{basicInfo.gender}</span>
                  )}
                  {basicInfo.country && (
                    <span>{getCountryDisplay(basicInfo.country)}</span>
                  )}
                </div>
                {basicInfo.city && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {basicInfo.city}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      {/* 基础资料编辑弹窗 */}
      <BottomDrawer
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false)
          setFormData(basicInfo)
        }}
        title="编辑基础资料"
      >
        <div className="p-4 space-y-4">
          {/* 头像编辑 */}
          <div className="text-center">
            <label className="text-sm font-medium mb-3 block" style={{ color: "var(--card-title-color)" }}>
              头像
            </label>
            <div className="flex justify-center">
              <ImageUpload
                value={formData.avatar}
                onChange={(value) => setFormData(prev => ({ ...prev, avatar: value }))}
                placeholder="点击上传头像"
                shape="circle"
                size="lg"
                accept="image/*"
                maxSize={2}
                enableCrop={true}
                cropAspectRatio={1}
              />
            </div>
          </div>

          {/* 姓名和性别 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                姓名 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入真实姓名"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                性别
              </label>
              <BottomDrawerSelect
                placeholder="请选择性别"
                value={formData.gender}
                onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                options={[
                  { value: "男", label: "男" },
                  { value: "女", label: "女" },
                  { value: "其他", label: "其他" }
                ]}
                title="选择性别"
              />
            </div>
          </div>

          {/* 国家和地区 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                国家地区
              </label>
              <BottomDrawerSelect
                placeholder="请选择国家"
                value={formData.country}
                onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                options={countries.map(country => ({
                  value: country.code,
                  label: `${country.flag} ${country.name}`
                }))}
                title="选择国家地区"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                居住城市
              </label>
              <CitySelectMobile
                value={formData.city}
                onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                placeholder="请选择城市"
              />
            </div>
          </div>

          {/* 生日和职业 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                生日
              </label>
              <DatePickerWithValue 
                placeholder="请选择生日"
                value={formData.birthday}
                onChange={(value) => setFormData(prev => ({ ...prev, birthday: value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                职业
              </label>
              <Input
                value={formData.profession}
                onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="请输入职业"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* 个人介绍 */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
              个人介绍
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="请简单介绍一下自己..."
              className="w-full px-3.5 py-2.5 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 resize-none"
              rows={3}
              style={{ color: "var(--card-text-color)" }}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <PillButton
              variant="default"
              onClick={() => {
                setShowEditForm(false)
                setFormData(basicInfo)
              }}
              className="flex-1"
            >
              取消
            </PillButton>
            <PillButton
              onClick={handleSave}
              className="flex-1"
            >
              保存
            </PillButton>
          </div>
        </div>
      </BottomDrawer>
    </>
  )
}
