"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Check } from "lucide-react"

export type CatNode = { id: string; name: string; children?: CatNode[] }

function findNodeById(tree: CatNode[], id: string): CatNode | null {
  for (const n of tree) {
    if (n.id === id) return n
    if (n.children?.length) {
      const f = findNodeById(n.children, id)
      if (f) return f
    }
  }
  return null
}

function findPathByName(tree: CatNode[], name: string): string[] | null {
  for (const n of tree) {
    if (n.name === name) return [n.id]
    if (n.children?.length) {
      const p = findPathByName(n.children, name)
      if (p) return [n.id, ...p]
    }
  }
  return null
}

export function CascaderSelect({
  tree = [],
  value = "all",
  onChange,
  placeholder = "请选择",
  clearText = "全部",
  l1Label = "一级分类",
  l2Label = "二级分类",
  l3Label = "三级分类",
}: {
  tree: CatNode[]
  value?: string // "all" or selected name
  onChange: (v: string) => void // emits "all" or selected name (at any level)
  placeholder?: string
  clearText?: string
  l1Label?: string
  l2Label?: string
  l3Label?: string
}) {
  // 调试日志
  console.log("🔍 CascaderSelect - Tree data:", tree);
  console.log("🔍 CascaderSelect - Tree length:", tree.length);
  console.log("🔍 CascaderSelect - Value:", value);
  const [open, setOpen] = useState(false)
  const [l1, setL1] = useState<string>("")
  const [l2, setL2] = useState<string>("")
  const [l3, setL3] = useState<string>("")

  // Sync internal ids from external name
  useEffect(() => {
    if (!open) {
      // preselect when closed or about to open
      if (!value || value === "all") {
        setL1("")
        setL2("")
        setL3("")
        return
      }
      const path = findPathByName(tree, value)
      if (path) {
        setL1(path[0] || "")
        setL2(path[1] || "")
        setL3(path[2] || "")
      }
    }
  }, [value, tree, open])

  const listL2 = useMemo(() => (l1 ? findNodeById(tree, l1)?.children || [] : []), [tree, l1])
  const listL3 = useMemo(() => (l2 ? findNodeById(tree, l2)?.children || [] : []), [tree, l2])

  const displayText = useMemo(() => {
    if (!value || value === "all") return placeholder
    return value
  }, [value, placeholder])

  function emit(level: 1 | 2 | 3, id: string | "") {
    if (!id) {
      if (level === 1) onChange("all")
      if (level === 2) {
        const n1 = findNodeById(tree, l1)
        onChange(n1?.name || "all")
      }
      if (level === 3) {
        const n2 = findNodeById(tree, l2)
        onChange(n2?.name || "all")
      }
      return
    }
    if (level === 1) {
      const n = findNodeById(tree, id)
      if (n) onChange(n.name)
    } else if (level === 2) {
      const n = findNodeById(tree, id)
      if (n) onChange(n.name)
    } else if (level === 3) {
      const n = findNodeById(tree, id)
      if (n) onChange(n.name)
    }
  }

  function isSelectedName(name: string) {
    return value && value !== "all" && value === name
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[220px] justify-between bg-white/60 backdrop-blur rounded-xl"
          title="选择分类"
        >
          <span className={value === "all" ? "text-muted-foreground" : ""}>{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[680px] p-0 overflow-hidden bg-white/80 backdrop-blur border-white/60 rounded-2xl"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/60 bg-white/70">
          <div className="text-sm font-medium">分类</div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              onChange("all")
              setL1("")
              setL2("")
              setL3("")
              setOpen(false)
            }}
          >
            {clearText}
          </Button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/60">
          {/* L1 */}
          <div className="min-h-[280px]">
            <div className="px-3 py-2 text-xs text-muted-foreground">{l1Label}</div>
            <ScrollArea className="h-[260px]">
              <ul className="py-1">
                {tree.map((n) => {
                  const active = l1 === n.id
                  return (
                    <li key={n.id}>
                      <button
                        className={
                          "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                          (active ? "bg-sky-50" : "")
                        }
                        onClick={() => {
                          const id = n.id
                          setL1(id)
                          setL2("")
                          setL3("")
                          emit(1, id)
                        }}
                      >
                        <span className={isSelectedName(n.name) ? "text-sky-600 font-medium" : ""}>{n.name}</span>
                        {isSelectedName(n.name) && <Check className="h-4 w-4 text-sky-600" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </div>
          {/* L2 */}
          <div className="min-h-[280px]">
            <div className="px-3 py-2 text-xs text-muted-foreground">{l2Label}</div>
            <ScrollArea className="h-[260px]">
              <ul className="py-1">
                {listL2.length === 0 && <li className="px-3 py-2 text-xs text-muted-foreground">请选择上一级</li>}
                {listL2.map((n) => {
                  const active = l2 === n.id
                  return (
                    <li key={n.id}>
                      <button
                        className={
                          "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                          (active ? "bg-sky-50" : "")
                        }
                        onClick={() => {
                          const id = n.id
                          setL2(id)
                          setL3("")
                          emit(2, id)
                        }}
                        disabled={!l1}
                        title={!l1 ? "请先选择一级分类" : undefined}
                      >
                        <span className={isSelectedName(n.name) ? "text-sky-600 font-medium" : ""}>{n.name}</span>
                        {isSelectedName(n.name) && <Check className="h-4 w-4 text-sky-600" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </div>
          {/* L3 */}
          <div className="min-h-[280px]">
            <div className="px-3 py-2 text-xs text-muted-foreground">{l3Label}</div>
            <ScrollArea className="h-[260px]">
              <ul className="py-1">
                {listL3.length === 0 && (
                  <li className="px-3 py-2 text-xs text-muted-foreground">
                    {l2 ? "该分支暂无子级，可直接选择上一级" : "请选择上一级"}
                  </li>
                )}
                {listL3.map((n) => {
                  const active = l3 === n.id
                  return (
                    <li key={n.id}>
                      <button
                        className={
                          "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                          (active ? "bg-sky-50" : "")
                        }
                        onClick={() => {
                          const id = n.id
                          setL3(id)
                          emit(3, id)
                          setOpen(false) // leaf chosen, close
                        }}
                        disabled={!l2}
                        title={!l2 ? "请先选择二级分类" : undefined}
                      >
                        <span className={isSelectedName(n.name) ? "text-sky-600 font-medium" : ""}>{n.name}</span>
                        {isSelectedName(n.name) && <Check className="h-4 w-4 text-sky-600" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
