"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type EventConfig = {
  trigger: "click"
  action: "navigate" | "switchTab"
  pageType?: "internal" | "external"
  page?: string
  url?: string
  tabKey?: string
  tabIndex?: number
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
  const [action, setAction] = useState<"navigate" | "switchTab">("navigate")
  const [pageType, setPageType] = useState<"internal" | "external">("internal")
  const [page, setPage] = useState<string>(pages[0] || "home")
  const [url, setUrl] = useState<string>("")
  const [tabKey, setTabKey] = useState<string>("")
  const [tabIndex, setTabIndex] = useState<number | undefined>(undefined)
  const [params, setParams] = useState<string>("")

  useEffect(() => {
    if (!open) return
    if (value) {
      setAction(value.action || "navigate")
      setPageType(value.pageType || "internal")
      setPage(value.page || (pages[0] || "home"))
      setUrl(value.url || "")
      setTabKey(value.tabKey || "")
      setTabIndex(typeof value.tabIndex === 'number' ? value.tabIndex : undefined)
      setParams(value.params || "")
    } else {
      setAction("navigate")
      setPageType("internal")
      setPage(pages[0] || "home")
      setUrl("")
      setTabKey("")
      setTabIndex(undefined)
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
              <div className="flex items-center gap-2">
                <Button size="sm" variant={action === "navigate" ? "default" : "outline"} onClick={() => setAction("navigate")}>{lang === "zh" ? "跳转新页面" : "Navigate"}</Button>
                <Button size="sm" variant={action === "switchTab" ? "default" : "outline"} onClick={() => setAction("switchTab")}>{lang === "zh" ? "当前页面切换" : "Switch Tab"}</Button>
              </div>
            </div>
          </div>

          {action === "navigate" ? (
            <>
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
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{lang === "zh" ? "标签标识(可选)" : "Tab Key (optional)"}</Label>
                <Input placeholder={lang === "zh" ? "例如: overview" : "e.g. overview"} value={tabKey} onChange={(e) => setTabKey(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{lang === "zh" ? "标签索引(可选)" : "Tab Index (optional)"}</Label>
                <Input type="number" placeholder="0" value={typeof tabIndex === 'number' ? String(tabIndex) : ''} onChange={(e) => setTabIndex(e.target.value === '' ? undefined : Number(e.target.value))} />
              </div>
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
            const v: EventConfig = action === "navigate"
              ? { trigger, action, pageType, page: pageType === "internal" ? page : undefined, url: pageType === "external" ? url : undefined, params: params?.trim() || undefined }
              : { trigger, action, tabKey: tabKey || undefined, tabIndex: typeof tabIndex === 'number' ? tabIndex : undefined, params: params?.trim() || undefined }
            onSave(v)
            onOpenChange(false)
          }}>{lang === "zh" ? "确定" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EventConfigDialog


