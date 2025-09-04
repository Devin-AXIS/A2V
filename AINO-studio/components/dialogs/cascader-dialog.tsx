"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/hooks/use-locale"

export type CascaderNode = { id: string; name: string; children?: CascaderNode[] }

export function CascaderDialog({
  open,
  onOpenChange,
  initial = [],
  onSave,
  title = "配置级联选项",
  l1 = "第 1 级",
  l2 = "第 2 级",
  l3 = "第 3 级",
}) {
  const { locale } = useLocale()
  const [nodes, setNodes] = useState<CascaderNode[]>([])
  const [sel, setSel] = useState<Array<CascaderNode | null>>([null, null, null])
  const [rootNewName, setRootNewName] = useState("")
  const [childInputId, setChildInputId] = useState<string | null>(null)
  const [childNewName, setChildNewName] = useState("")

  useEffect(() => {
    if (open) {
      setNodes(structuredClone(initial))
      setSel([null, null, null])
      setRootNewName("")
      setChildInputId(null)
      setChildNewName("")
    }
  }, [open, initial])

  function uid() {
    return Math.random().toString(36).slice(2, 10)
  }
  function find(list: CascaderNode[], id: string): CascaderNode | null {
    for (const n of list) {
      if (n.id === id) return n
      const c = n.children && find(n.children, id)
      if (c) return c
    }
    return null
  }
  function del(list: CascaderNode[], id: string): boolean {
    const i = list.findIndex((x) => x.id === id)
    if (i >= 0) {
      list.splice(i, 1)
      return true
    }
    for (const n of list) {
      if (n.children && del(n.children, id)) return true
    }
    return false
  }

  function add(level: 0 | 1 | 2, parent?: CascaderNode, nameArg?: string) {
    const name = (nameArg ?? (prompt("名称") || "")).trim()
    if (!name) return
    const node: CascaderNode = { id: uid(), name, children: [] }
    const next = structuredClone(nodes)
    if (level === 0) next.push(node)
    else if (level === 1 && parent) (find(next, parent.id)!.children ||= []).push(node)
    else if (level === 2 && parent) (find(next, parent.id)!.children ||= []).push(node)
    setNodes(next)
  }
  function rename(node: CascaderNode) {
    const nv = (prompt("名称", node.name) || "").trim()
    if (!nv) return
    const next = structuredClone(nodes)
    find(next, node.id)!.name = nv
    setNodes(next)
  }
  function remove(node: CascaderNode) {
    if (!confirm(locale === "zh" ? "删除该项及其子级？" : "Delete this item and its children?")) return
    const next = structuredClone(nodes)
    del(next, node.id)
    setNodes(next)
  }

  const l1List = nodes
  const l2List = sel[0]?.children || []
  const l3List = sel[1]?.children || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[880px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="cascader-description"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div id="cascader-description" className="sr-only">
          Configure cascading options with up to 3 levels of hierarchy
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Col
            title={l1}
            list={l1List}
            activeId={sel[0]?.id || ""}
            onSelect={(n) => setSel([n, null, null])}
            onRename={rename}
            onDelete={remove}
            onAddName={(name) => add(0, undefined, name)}
            onAddChildName={(n, name) => add(1, n, name)}
          />
          <Col
            title={l2}
            list={l2List}
            activeId={sel[1]?.id || ""}
            onSelect={(n) => setSel([sel[0], n, null])}
            onRename={rename}
            onDelete={remove}
            onAddChildName={(n, name) => add(2, n, name)}
          />
          <Col
            title={l3}
            list={l3List}
            activeId={sel[2]?.id || ""}
            onSelect={(n) => setSel([sel[0], sel[1], n])}
            onRename={rename}
            onDelete={remove}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={() => onSave(nodes)}>{locale === "zh" ? "保存" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Col({
  title,
  list,
  activeId,
  onSelect,
  onRename,
  onDelete,
  onAddName,
  onAddChildName,
}: {
  title: string
  list: CascaderNode[]
  activeId: string
  onSelect: (n: CascaderNode) => void
  onRename: (n: CascaderNode) => void
  onDelete: (n: CascaderNode) => void
  onAddName?: (name: string) => void
  onAddChildName?: (n: CascaderNode, name: string) => void
}) {
  const [rootNewName, setRootNewName] = useState("")
  const [childInputId, setChildInputId] = useState<string | null>(null)
  const [childNewName, setChildNewName] = useState("")

  function submitRootAdd() {
    const name = rootNewName.trim()
    if (!name || !onAddName) return
    onAddName(name)
    setRootNewName("")
  }
  function submitChildAdd(parent: CascaderNode) {
    if (!onAddChildName) return
    const name = childNewName.trim()
    if (!name) return
    onAddChildName(parent, name)
    setChildNewName("")
    setChildInputId(null)
  }

  return (
    <div className="rounded-xl border border-white/60 bg-white/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">{title}</div>
        {onAddName && (
          <div className="flex items-center gap-2">
            <Input
              value={rootNewName}
              onChange={(e) => setRootNewName(e.target.value)}
              placeholder="输入名称后回车添加"
              className="h-8 bg-white/70"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  submitRootAdd()
                }
              }}
            />
            <Button size="sm" onClick={submitRootAdd} disabled={!rootNewName.trim()}>
              + 添加
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {list.map((n) => (
          <div key={n.id} className="rounded-lg border bg-white/70">
            <div
              className={
                "flex items-center justify-between px-3 py-2 " +
                (n.id === activeId ? "outline outline-2 outline-blue-200 rounded-lg" : "border-white/60")
              }
            >
              <button className="text-left flex-1" onClick={() => onSelect(n)}>
                {n.name}
                {Array.isArray(n.children) && n.children.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">{`(${n.children.length})`}</span>
                )}
              </button>
              <div className="flex items-center gap-2">
                {onAddChildName && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setChildInputId((cur) => (cur === n.id ? null : n.id))
                      setChildNewName("")
                    }}
                    title="添加子级"
                  >
                    + 子级
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => onRename(n)}>
                  改
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(n)}>
                  删
                </Button>
              </div>
            </div>

            {onAddChildName && childInputId === n.id && (
              <div className="flex items-center gap-2 border-t border-white/60 px-3 py-2 bg-white/80 rounded-b-lg">
                <Input
                  value={childNewName}
                  onChange={(e) => setChildNewName(e.target.value)}
                  placeholder="输入子级名称后回车"
                  className="h-8 bg-white/70"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      submitChildAdd(n)
                    }
                    if (e.key === "Escape") {
                      setChildInputId(null)
                      setChildNewName("")
                    }
                  }}
                />
                <Button size="sm" onClick={() => submitChildAdd(n)} disabled={!childNewName.trim()}>
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setChildInputId(null)
                    setChildNewName("")
                  }}
                >
                  取消
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
