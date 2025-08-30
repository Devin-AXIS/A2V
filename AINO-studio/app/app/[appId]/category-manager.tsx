"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { DirectoryModel } from "@/lib/store"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"
import { api } from "@/lib/api"

type Props = {
  dir: DirectoryModel
  onChange: (dir: DirectoryModel) => void
}

type Cat = { id: string; name: string; children?: Cat[] }

export function CategoryManager({ dir, onChange }: Props) {
  const { locale } = useLocale()
  const [cats, setCats] = useState<Cat[]>(dir.categories || [])
  const [sel, setSel] = useState<Array<Cat | null>>([null, null, null])
  const [l1Page, setL1Page] = useState(1)
  const [l2Page, setL2Page] = useState(1)
  const [l3Page, setL3Page] = useState(1)
  const pageSize = 8

  useEffect(() => {
    setCats(dir.categories || [])
    setSel([null, null, null])
    setL1Page(1)
    setL2Page(1)
    setL3Page(1)
  }, [dir.id])

  useEffect(() => {
    setL2Page(1)
    setL3Page(1)
  }, [sel[0]])

  useEffect(() => {
    setL3Page(1)
  }, [sel[1]])

  function commit(next: Cat[]) {
    setCats(next)
    const copy = structuredClone(dir)
    copy.categories = next
    onChange(copy)
  }

  function add(level: 0 | 1 | 2, parent?: Cat, nameArg?: string) {
    const name = (nameArg ?? (prompt(locale === "zh" ? "分类名称" : "Category Name") || "")).trim()
    if (!name) return
    const node: Cat = { id: uid(), name, children: [] }
    const next = structuredClone(cats)
    if (level === 0) next.push(node)
    else if (level === 1 && parent) (find(next, parent.id)!.children ||= []).push(node)
    else if (level === 2 && parent) (find(next, parent.id)!.children ||= []).push(node)
    commit(next)
  }
  function rename(node: Cat) {
    const nv = (prompt(locale === "zh" ? "分类名称" : "Category Name", node.name) || "").trim()
    if (!nv) return
    const next = structuredClone(cats)
    find(next, node.id)!.name = nv
    commit(next)
  }
  function remove(node: Cat) {
    if (!confirm(locale === "zh" ? "删除该分类及其子级？" : "Delete this category and all its subcategories?")) return
    const next = structuredClone(cats)
    del(next, node.id)
    commit(next)
  }

  const l1 = cats
  const l2 = sel[0]?.children || []
  const l3 = sel[1]?.children || []

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            {locale === "zh" ? "分类管理（最多 3 级）" : "Category Management (Max 3 Levels)"}
          </div>
          <div className="text-xs text-muted-foreground">
            {locale === "zh" ? "路径：" : "Path: "}L1 {sel[0]?.name || (locale === "zh" ? "未选" : "None")} {" / "} L2 {sel[1]?.name || (locale === "zh" ? "未选" : "None")}
          </div>
          <div className="text-xs text-muted-foreground">
            {locale === "zh" ? "数量：" : "Count: "}L1 {l1.length} {"·"} L2 {(l2 || []).length} {"·"} L3 {(l3 || []).length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => add(0)} title={locale === "zh" ? "添加一级分类" : "Add Level 1 Category"}>
            + {locale === "zh" ? "一级" : "L1"}
          </Button>
          <Button
            variant="secondary"
            disabled={!sel[0]}
            onClick={() => sel[0] && add(1, sel[0])}
            title={locale === "zh" ? "在选中的一级下添加二级" : "Add Level 2 under selected Level 1"}
          >
            + {locale === "zh" ? "二级" : "L2"}
          </Button>
          <Button
            variant="secondary"
            disabled={!sel[1]}
            onClick={() => sel[1] && add(2, sel[1])}
            title={locale === "zh" ? "在选中的二级下添加三级" : "Add Level 3 under selected Level 2"}
          >
            + {locale === "zh" ? "三级" : "L3"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Col
          title={locale === "zh" ? "第 1 级" : "Level 1"}
          list={l1}
          activeId={sel[0]?.id || ""}
          onSelect={(n) => setSel([n, null, null])}
          onRename={rename}
          onDelete={remove}
          onAddName={(name) => add(0, undefined, name)}
          onAddChildName={(n, name) => add(1, n, name)}
          currentPage={l1Page}
          onPageChange={setL1Page}
          pageSize={pageSize}
        />
        <Col
          title={locale === "zh" ? "第 2 级" : "Level 2"}
          list={l2}
          activeId={sel[1]?.id || ""}
          onSelect={(n) => setSel([sel[0], n, null])}
          onRename={rename}
          onDelete={remove}
          onAddChildName={(n, name) => add(2, n, name)}
          currentPage={l2Page}
          onPageChange={setL2Page}
          pageSize={pageSize}
        />
        <Col
          title={locale === "zh" ? "第 3 级" : "Level 3"}
          list={l3}
          activeId={sel[2]?.id || ""}
          onSelect={(n) => setSel([sel[0], sel[1], n])}
          onRename={rename}
          onDelete={remove}
          currentPage={l3Page}
          onPageChange={setL3Page}
          pageSize={pageSize}
        />
      </div>
    </div>
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
  currentPage,
  onPageChange,
  pageSize,
}: {
  title: string
  list: Cat[]
  activeId: string
  onSelect: (n: Cat) => void
  onRename: (n: Cat) => void
  onDelete: (n: Cat) => void
  onAddName?: (name: string) => void
  onAddChildName?: (n: Cat, name: string) => void
  currentPage: number
  onPageChange: (page: number) => void
  pageSize: number
}) {
  const [rootNewName, setRootNewName] = useState("")
  const [childInputId, setChildInputId] = useState<string | null>(null)
  const [childNewName, setChildNewName] = useState("")

  const totalPages = Math.ceil(list.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedList = useMemo(() => list.slice(startIndex, endIndex), [list, startIndex, endIndex])

  const goToPage = (page: number) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)))
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center mt-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
                className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => goToPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
                className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  function submitRootAdd() {
    const name = rootNewName.trim()
    if (!name || !onAddName) return
    onAddName(name)
    setRootNewName("")
  }

  function submitChildAdd(parent: Cat) {
    if (!onAddChildName) return
    const name = childNewName.trim()
    if (!name) return
    onAddChildName(parent, name)
    setChildNewName("")
    setChildInputId(null)
  }

  const { locale } = useLocale()
  
  return (
    <Card className="p-3 bg-white/60 border-white/60 backdrop-blur">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">{title}</div>
          {list.length > 0 && <span className="text-xs text-muted-foreground">({list.length})</span>}
        </div>
        {/* Root-level quick add (only for L1 when onAddName provided) */}
        {onAddName && (
          <div className="flex items-center gap-2">
            <Input
              value={rootNewName}
              onChange={(e) => setRootNewName(e.target.value)}
              placeholder={locale === "zh" ? "输入名称后回车添加" : "Enter name and press Enter"}
              className="h-8 bg-white/70"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  submitRootAdd()
                }
              }}
            />
            <Button size="sm" onClick={submitRootAdd} disabled={!rootNewName.trim()}>
              + {locale === "zh" ? "添加" : "Add"}
            </Button>
          </div>
        )}
      </div>

      {list.length > pageSize && (
        <div className="text-xs text-muted-foreground mb-2 text-center">
          {locale === "zh" 
            ? `显示第 ${startIndex + 1}-${Math.min(endIndex, list.length)} 条，共 ${list.length} 条`
            : `Showing ${startIndex + 1}-${Math.min(endIndex, list.length)} of ${list.length} items`
          }
        </div>
      )}

      <div className="space-y-2">
        {paginatedList.map((n) => (
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
                {/* Add child inline only if handler provided (L1 -> add L2, L2 -> add L3) */}
                {onAddChildName && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setChildInputId((cur) => (cur === n.id ? null : n.id))
                      setChildNewName("")
                    }}
                    title={locale === "zh" ? "添加子级" : "Add Subcategory"}
                  >
                    + {locale === "zh" ? "子级" : "Sub"}
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => onRename(n)}>
                  {locale === "zh" ? "改" : "Edit"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(n)}>
                  {locale === "zh" ? "删" : "Del"}
                </Button>
              </div>
            </div>

            {/* Inline child add row */}
            {onAddChildName && childInputId === n.id && (
              <div className="flex items-center gap-2 border-t border-white/60 px-3 py-2 bg-white/80 rounded-b-lg">
                <Input
                  value={childNewName}
                  onChange={(e) => setChildNewName(e.target.value)}
                  placeholder={locale === "zh" ? "输入子级名称后回车" : "Enter subcategory name and press Enter"}
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
                  {locale === "zh" ? "保存" : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setChildInputId(null)
                    setChildNewName("")
                  }}
                >
                  {locale === "zh" ? "取消" : "Cancel"}
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Keep a fallback add button only when no root input is present */}
        {!onAddName && list.length === 0 && (
          <div className="pt-1">
            <Button size="sm" variant="secondary" disabled>
              {locale === "zh" 
                ? "请在上一级的条目上使用「+ 子级」添加"
                : "Please use '+ Sub' on the previous level item to add"
              }
            </Button>
          </div>
        )}
      </div>

      {renderPagination()}
    </Card>
  )
}

function find(list: Cat[], id: string): Cat | null {
  for (const n of list) {
    if (n.id === id) return n
    const c = n.children && find(n.children, id)
    if (c) return c
  }
  return null
}
function del(list: Cat[], id: string): boolean {
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
function uid() {
  return Math.random().toString(36).slice(2, 10)
}
