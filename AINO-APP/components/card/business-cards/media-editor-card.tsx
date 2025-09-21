"use client"

import type React from "react"
import { useState } from "react"
import { PillButton } from "@/components/basic/pill-button"
import { AppCard } from "@/components/layout/app-card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Play, Upload, Edit3, Check, ImageIcon, Users } from "lucide-react"

interface MediaEditorData {
  title?: string
  coverImage?: string
  actors?: string[]
  language?: string
  prompt?: string
}

interface MediaEditorCardProps {
  data?: MediaEditorData
  onAction?: (action: string, data: any) => void
  className?: string
  disableLocalTheme?: boolean
}

const MediaEditorCard: React.FC<MediaEditorCardProps> = ({
  data = {
    title: "媒体内容编辑",
    coverImage: "",
    actors: [],
    language: "中文",
    prompt: "",
  },
  onAction,
  className = "",
  disableLocalTheme = true,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(data)

  const handleSave = () => {
    setIsEditing(false)
    onAction?.("save", formData)
  }

  const handleEdit = () => {
    setIsEditing(true)
    onAction?.("edit", formData)
  }

  return (
    <AppCard
      className={`overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-500 h-full w-full ${className}`}
      disableLocalTheme={disableLocalTheme}
    >
      <div className="p-0 flex flex-col h-full">
        <div className="relative">
          <div className="relative bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-t-lg overflow-hidden group cursor-pointer" style={{ minHeight: 120, maxHeight: 240 }}>
            {formData.coverImage ? (
              <img src={formData.coverImage || "/placeholder.svg"} alt="封面" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-pink-600/30">
                <div className="absolute inset-0 bg-[url('/abstract-media-background.png')] bg-cover bg-center opacity-30" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">媒体内容编辑</h3>
              <p className="text-white/80 text-sm drop-shadow">选择模版封面</p>
            </div>

            <div className="absolute top-4 right-4">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-white text-sm font-medium hover:bg-white/30 transition-all duration-300 cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                上传封面
              </div>
            </div>

            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 min-h-0 overflow-auto">
          {/* 主演区域 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-blue-400/50 text-blue-600 dark:text-blue-400 bg-blue-400/10 backdrop-blur-sm"
              >
                <Users className="w-3 h-3 mr-1" />
                主演
              </Badge>
            </div>

            <div className="flex gap-4">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 border-2 border-blue-200 dark:border-blue-700 rounded-2xl flex items-center justify-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <Play className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>

              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border-2 border-purple-200 dark:border-purple-700 rounded-2xl flex items-center justify-center hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <Play className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-t border-black/10 dark:border-white/10">
            <div className="text-center">
              <div className="text-lg font-bold" data-slot="card-title">
                {formData.language || "中文"}
              </div>
              <div className="text-xs opacity-60" data-slot="card-description">
                语言
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" data-slot="card-title">
                {formData.actors?.length || 0}
              </div>
              <div className="text-xs opacity-60" data-slot="card-description">
                演员
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" data-slot="card-title">
                HD
              </div>
              <div className="text-xs opacity-60" data-slot="card-description">
                画质
              </div>
            </div>
          </div>

          {/* 需求提示词 */}
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="border-purple-400/50 text-purple-600 dark:text-purple-400 bg-purple-400/10 backdrop-blur-sm"
            >
              需求提示词
            </Badge>

            <Textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="萨达说的是v v呈现出萨达说的是大叔大叔是大叔东西啊是大叔萨达说大叔 萨达的爱上大是大叔"
              className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 placeholder:opacity-50 focus:border-blue-400/50 dark:focus:border-blue-400/50 resize-none h-20 rounded-xl backdrop-blur-sm"
              disabled={!isEditing}
            />
          </div>

          <div className="flex gap-4 pt-4 justify-center">
            <PillButton
              variant="outline"
              className="px-8 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all duration-300 min-w-[120px] backdrop-blur-sm"
              onClick={isEditing ? handleSave : handleEdit}
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  确认
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  修改
                </>
              )}
            </PillButton>

            {!isEditing && (
              <PillButton
                variant="primary"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 min-w-[120px] border-0 text-white font-medium"
                onClick={() => onAction?.("confirm", formData)}
              >
                <Check className="w-4 h-4 mr-2" />
                确认
              </PillButton>
            )}
          </div>
        </div>
      </div>
    </AppCard>
  )
}

export default MediaEditorCard
