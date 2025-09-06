"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type EventConfig = {
  trigger: "click"
  action: "navigate"
  pageType: "internal" | "external"
  page?: string
  url?: string
  params?: string
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  lang: "zh" | "en"
  pages: string[]
  value?: EventConfig
  onSave: (val: EventConfig) => void
}

export function EventConfigDialog({ open, onOpenChange, lang, pages, value, onSave }: Props) {
  const [trigger] = useState<"click">("click")
  const [action] = useState<"navigate">("navigate")
  const [pageType, setPageType] = useState<"internal" | "external">("internal")
  const [page, setPage] = useState<string>(pages[0] || "home")
  const [url, setUrl] = useState<string>("")
  const [params, setParams] = useState<string>("")

  useEffect(() => {
    if (!open) return
    if (value) {
      setPageType(value.pageType || "internal")
      setPage(value.page || (pages[0] || "home"))
      setUrl(value.url || "")
      setParams(value.params || "")
    } else {
      setPageType("internal")
      setPage(pages[0] || "home")
      setUrl("")
      setParams("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] w-[92vw] bg-white">
        <DialogHeader>
          <DialogTitle>{lang === "zh" ? "事件配置" : "Event Settings"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{lang === "zh" ? "事件类型" : "Trigger"}</Label>
              <Input value={lang === "zh" ? "点击时" : "On Click"} readOnly />
            </div>
            <div className="space-y-1">
              <Label>{lang === "zh" ? "执行动作" : "Action"}</Label>
              <Input value={lang === "zh" ? "页面跳转" : "Navigate"} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{lang === "zh" ? "页面类型" : "Destination"}</Label>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={pageType === "internal" ? "default" : "outline"} onClick={() => setPageType("internal")}>{lang === "zh" ? "内部页面" : "Internal"}</Button>
              <Button size="sm" variant={pageType === "external" ? "default" : "outline"} onClick={() => setPageType("external")}>{lang === "zh" ? "外部链接" : "External"}</Button>
            </div>
          </div>
          {pageType === "internal" ? (
            <div className="space-y-1">
              <Label>{lang === "zh" ? "选择页面" : "Select Page"}</Label>
              <select className="border rounded-md h-9 px-2" value={page} onChange={(e) => setPage(e.target.value)}>
                {pages.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <Label>{lang === "zh" ? "外部链接" : "External URL"}</Label>
              <Input placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          )}
          <div className="space-y-1">
            <Label>{lang === "zh" ? "页面入参 (JSON)" : "Params (JSON)"}</Label>
            <Textarea rows={3} value={params} onChange={(e) => setParams(e.target.value)} placeholder={lang === "zh" ? "例如: {\"tab\":1}" : "e.g. {\"tab\":1}"} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
          <Button onClick={() => {
            const v: EventConfig = { trigger, action, pageType, page: pageType === "internal" ? page : undefined, url: pageType === "external" ? url : undefined, params: params?.trim() || undefined }
            onSave(v)
            onOpenChange(false)
          }}>{lang === "zh" ? "确定" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EventConfigDialog


