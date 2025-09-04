"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CategorySelector, type CategoryI18n } from "@/components/category-selector"
import { uid as genId } from "@/lib/store"

type Cat = { id: string; name: string; children?: Cat[] }

export function CategoryDialog({
  open,
  onOpenChange,
  initialCats = [],
  canEdit = true,
  onSave,
  i18n,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialCats?: Cat[]
  canEdit?: boolean
  onSave: (cats: Cat[]) => void
  i18n: CategoryI18n
}) {
  const [cats, setCats] = useState<Cat[]>([])
  const [lvl1, setLvl1] = useState("")
  const [lvl2, setLvl2] = useState("")
  const [lvl3, setLvl3] = useState("")

  const [adding1, setAdding1] = useState(false)
  const [adding2, setAdding2] = useState(false)
  const [adding3, setAdding3] = useState(false)
  const [newL1, setNewL1] = useState("")
  const [newL2, setNewL2] = useState("")
  const [newL3, setNewL3] = useState("")

  useEffect(() => {
    if (open) {
      setCats(structuredClone(initialCats))
      setLvl1("")
      setLvl2("")
      setLvl3("")
      setAdding1(false)
      setAdding2(false)
      setAdding3(false)
      setNewL1("")
      setNewL2("")
      setNewL3("")
    }
  }, [open, initialCats])

  function addL1(name: string) {
    const n = name.trim()
    if (!n) return
    const node: Cat = { id: genId(), name: n, children: [] }
    setCats((arr) => [...arr, node])
    setLvl1(node.id)
    setLvl2("")
    setLvl3("")
  }
  function addL2(name: string) {
    if (!lvl1) return
    const n = name.trim()
    if (!n) return
    setCats((arr) => {
      const next = structuredClone(arr)
      const p = next.find((x: Cat) => x.id === lvl1)
      if (!p) return next
      p.children = p.children || []
      p.children.push({ id: genId(), name: n, children: [] })
      return next
    })
  }
  function addL3(name: string) {
    if (!lvl2 || !lvl1) return
    const n = name.trim()
    if (!n) return
    setCats((arr) => {
      const next = structuredClone(arr)
      const p1 = next.find((x: Cat) => x.id === lvl1)
      const p2 = p1?.children?.find((x: Cat) => x.id === lvl2)
      if (!p2) return next
      p2.children = p2.children || []
      p2.children.push({ id: genId(), name: n, children: [] })
      return next
    })
  }

  function deleteL1(id: string) {
    setCats((arr) => arr.filter((x: Cat) => x.id !== id))
  }

  function deleteL2(id: string) {
    setCats((arr) => {
      const next = structuredClone(arr)
      const p1 = next.find((x: Cat) => x.id === lvl1)
      if (!p1) return next
      p1.children = p1.children?.filter((x: Cat) => x.id !== id) || []
      return next
    })
  }

  function deleteL3(id: string) {
    setCats((arr) => {
      const next = structuredClone(arr)
      const p1 = next.find((x: Cat) => x.id === lvl1)
      const p2 = p1?.children?.find((x: Cat) => x.id === lvl2)
      if (!p2) return next
      p2.children = p2.children?.filter((x: Cat) => x.id !== id) || []
      return next
    })
  }

  const l2 = useMemo(() => cats.find((x) => x.id === lvl1)?.children || [], [cats, lvl1])
  const l3 = useMemo(
    () => cats.find((x) => x.id === lvl1)?.children?.find((x) => x.id === lvl2)?.children || [],
    [cats, lvl1, lvl2],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[720px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="category-description"
      >
        <DialogHeader>
          <DialogTitle>{i18n.title}</DialogTitle>
        </DialogHeader>
        <div id="category-description" className="sr-only">
          Configure up to 3 levels of categories for organizing content
        </div>

        <CategorySelector
          cats={cats}
          setCats={setCats}
          lvl1={lvl1}
          setLvl1={setLvl1}
          lvl2={lvl2}
          setLvl2={setLvl2}
          lvl3={lvl3}
          setLvl3={setLvl3}
          adding1={adding1}
          setAdding1={setAdding1}
          adding2={adding2}
          setAdding2={setAdding2}
          adding3={adding3}
          setAdding3={setAdding3}
          newL1={newL1}
          setNewL1={setNewL1}
          newL2={newL2}
          setNewL2={setNewL2}
          newL3={newL3}
          setNewL3={setNewL3}
          addL1={addL1}
          addL2={addL2}
          addL3={addL3}
          deleteL1={deleteL1}
          deleteL2={deleteL2}
          deleteL3={deleteL3}
          l2={l2}
          l3={l3}
          canEdit={canEdit}
          i18n={i18n}
        />

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {i18n.cancel}
          </Button>
          <Button onClick={() => onSave(cats)} disabled={!canEdit}>
            {i18n.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
