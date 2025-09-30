"use client"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthYearPicker } from "@/components/input/month-year-picker"
import { X } from "lucide-react"

export interface ExperienceItem {
  id: string
  [key: string]: any
}

export interface ExperienceField {
  key: string
  label: string
  type: "input" | "textarea" | "select" | "date" | "dateRange"
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  span?: 1 | 2 // Grid column span
}

export interface ExperienceCardProps {
  items: ExperienceItem[]
  fields: ExperienceField[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: string, value: string) => void
  title?: string
  emptyText?: string
  addButtonText?: string
}

export function ExperienceCard({
  items = [], // Added default empty array
  fields = [], // Added default empty array
  onAdd,
  onRemove,
  onUpdate,
  title = "经历",
  emptyText = "暂无经历",
  addButtonText = "添加经历",
}: ExperienceCardProps) {
  if (!onAdd || !onRemove || !onUpdate) {
    return (
      <AppCard>
        <div className="p-4 text-center text-muted-foreground">
          <h3 className="text-base font-semibold mb-2">{title}</h3>
          <p>{emptyText}</p>
        </div>
      </AppCard>
    )
  }

  const renderField = (item: ExperienceItem, field: ExperienceField) => {
    const value = item[field.key] || ""

    switch (field.type) {
      case "input":
        return (
          <Input
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
          />
        )

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
            rows={3}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(val) => onUpdate(item.id, field.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return (
          <MonthYearPicker
            placeholder={field.placeholder}
            value={value}
            onChange={(val) => onUpdate(item.id, field.key, val)}
          />
        )

      case "dateRange":
        const [startKey, endKey] = field.key.split(",")
        return (
          <div className="grid grid-cols-2 gap-2">
            <MonthYearPicker
              placeholder="开始时间"
              value={item[startKey] || ""}
              onChange={(val) => onUpdate(item.id, startKey, val)}
            />
            <MonthYearPicker
              placeholder="结束时间"
              value={item[endKey] || ""}
              onChange={(val) => onUpdate(item.id, endKey, val)}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <AppCard>
          <div className="p-4 text-center text-muted-foreground">
            <h3 className="text-base font-semibold mb-2">{title}</h3>
            <p>{emptyText}</p>
          </div>
        </AppCard>
      ) : (
        items.map((item) => (
          <AppCard key={item.id}>
            <div className="p-4 relative">
              <PillButton
                onClick={() => onRemove(item.id)}
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </PillButton>

              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.key} className={field.span === 2 ? "col-span-2" : ""}>
                    <label className="text-sm font-medium mb-1 block">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {field.type === "dateRange" || field.span === 2 ? (
                      renderField(item, field)
                    ) : (
                      <div
                        className={
                          fields.filter((f) => f.span !== 2 && f.type !== "dateRange").length > 1
                            ? "grid grid-cols-2 gap-3"
                            : ""
                        }
                      >
                        {renderField(item, field)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AppCard>
        ))
      )}
    </div>
  )
}

export default ExperienceCard
