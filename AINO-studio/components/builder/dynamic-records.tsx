"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Clock, User, ComputerIcon as System, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"

interface DynamicRecord {
  id: string
  type: "user" | "system" | "behavior"
  content: string
  timestamp: string
  createdBy?: string
}

interface DynamicRecordsProps {
  recordId: string
}

export function DynamicRecords({ recordId }: DynamicRecordsProps) {
  const { toast } = useToast()
  const { t, locale } = useLocale()

  const [dynamicRecords, setDynamicRecords] = useState<DynamicRecord[]>([
    {
      id: "1",
      type: "system",
      content: "记录已创建",
      timestamp: "2024-01-15 10:30:00",
      createdBy: "系统",
    },
    {
      id: "2",
      type: "user",
      content: "客户首次联系，表达了对产品的兴趣",
      timestamp: "2024-01-15 14:20:00",
      createdBy: "张三",
    },
  ])
  const [newRecordContent, setNewRecordContent] = useState("")

  const handleAddDynamicRecord = () => {
    if (!newRecordContent.trim()) {
      toast({ description: t("pleaseEnterDynamicContent"), variant: "destructive" as any })
      return
    }

    const newRecord: DynamicRecord = {
      id: Date.now().toString(),
      type: "user",
      content: newRecordContent.trim(),
      timestamp: new Date().toLocaleString("zh-CN"),
      createdBy: "当前用户",
    }

    setDynamicRecords((prev) => [newRecord, ...prev])
    setNewRecordContent("")
    toast({ description: t("dynamicRecordAdded") })
  }

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "user":
        return { icon: User, label: t("userRecord"), color: "text-blue-600 bg-blue-50" }
      case "system":
        return { icon: System, label: t("systemInfo"), color: "text-gray-600 bg-gray-50" }
      case "behavior":
        return { icon: Activity, label: t("behaviorDynamic"), color: "text-green-600 bg-green-50" }
      default:
        return { icon: Clock, label: t("other"), color: "text-gray-600 bg-gray-50" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">{t("addUserRecord")}</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("recordContent")}</label>
            <Textarea
              value={newRecordContent}
              onChange={(e) => setNewRecordContent(e.target.value)}
              placeholder={t("enterUserRecordContent")}
              rows={3}
              className="resize-none"
            />
          </div>
          <Button onClick={handleAddDynamicRecord} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {t("addRecord")}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">{t("historyRecord")}</h3>
        <div className="space-y-3">
          {dynamicRecords.map((record) => {
            const typeInfo = getTypeInfo(record.type)
            const IconComponent = typeInfo.icon
            return (
              <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{typeInfo.label}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-500">{record.timestamp}</span>
                      {record.createdBy && (
                        <>
                          <span className="text-xs text-gray-500">·</span>
                          <span className="text-xs text-gray-500">{record.createdBy}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{record.content}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
