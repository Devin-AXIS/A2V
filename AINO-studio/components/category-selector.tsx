"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Cat = { id: string; name: string; children?: Cat[] }

export type CategoryI18n = {
  title: string
  l1: string
  l2: string
  l3: string
  selectL1: string
  selectL2: string
  selectL3: string
  none: string
  add: string
  save: string
  cancel: string
  preview: string
}

interface CategorySelectorProps {
  cats: Cat[]
  setCats: (cats: Cat[]) => void
  lvl1: string
  setLvl1: (lvl1: string) => void
  lvl2: string
  setLvl2: (lvl2: string) => void
  lvl3: string
  setLvl3: (lvl3: string) => void
  adding1: boolean
  setAdding1: (adding1: boolean) => void
  adding2: boolean
  setAdding2: (adding2: boolean) => void
  adding3: boolean
  setAdding3: (adding3: boolean) => void
  newL1: string
  setNewL1: (newL1: string) => void
  newL2: string
  setNewL2: (newL2: string) => void
  newL3: string
  setNewL3: (newL3: string) => void
  addL1: (name: string) => void
  addL2: (name: string) => void
  addL3: (name: string) => void
  l2: Cat[]
  l3: Cat[]
  canEdit: boolean
  i18n: CategoryI18n
}

export function CategorySelector({
  cats,
  lvl1,
  setLvl1,
  lvl2,
  setLvl2,
  lvl3,
  setLvl3,
  adding1,
  setAdding1,
  adding2,
  setAdding2,
  adding3,
  setAdding3,
  newL1,
  setNewL1,
  newL2,
  setNewL2,
  newL3,
  setNewL3,
  addL1,
  addL2,
  addL3,
  l2,
  l3,
  canEdit,
  i18n,
}: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      {/* L1 */}
      <div className="space-y-1">
        <div className="grid grid-cols-[92px_1fr_auto] items-center gap-2">
          <div className="text-sm font-medium text-slate-700">{i18n.l1}</div>
          <Select
            value={lvl1 || "none"}
            onValueChange={(v) => {
              setLvl1(v === "none" ? "" : v)
              setLvl2("")
              setLvl3("")
            }}
          >
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder={i18n.selectL1} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{i18n.none}</SelectItem>
              {cats.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            className="px-3"
            onClick={() => {
              setAdding1((v) => !v)
              setNewL1("")
            }}
            disabled={!canEdit}
          >
            +
          </Button>
        </div>
        {adding1 && (
          <div className="grid grid-cols-[92px_1fr_auto_auto] items-center gap-2">
            <div />
            <Input
              placeholder={i18n.l1}
              value={newL1}
              onChange={(e) => setNewL1(e.target.value)}
              className="bg-white/70"
            />
            <Button
              size="sm"
              onClick={() => {
                addL1(newL1)
                setAdding1(false)
                setNewL1("")
              }}
              disabled={!newL1.trim()}
            >
              {i18n.save}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAdding1(false)}>
              {i18n.cancel}
            </Button>
          </div>
        )}
      </div>

      {/* L2 */}
      <div className="space-y-1">
        <div className="grid grid-cols-[92px_1fr_auto] items-center gap-2">
          <div className="text-sm font-medium text-slate-700">{i18n.l2}</div>
          <Select
            value={lvl2 || "none"}
            onValueChange={(v) => {
              setLvl2(v === "none" ? "" : v)
              setLvl3("")
            }}
            disabled={!lvl1}
          >
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder={i18n.selectL2} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{i18n.none}</SelectItem>
              {l2.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            className="px-3"
            onClick={() => {
              if (!lvl1) return
              setAdding2((v) => !v)
              setNewL2("")
            }}
            disabled={!lvl1 || !canEdit}
          >
            +
          </Button>
        </div>
        {adding2 && (
          <div className="grid grid-cols-[92px_1fr_auto_auto] items-center gap-2">
            <div />
            <Input
              placeholder={i18n.l2}
              value={newL2}
              onChange={(e) => setNewL2(e.target.value)}
              className="bg-white/70"
            />
            <Button
              size="sm"
              onClick={() => {
                addL2(newL2)
                setAdding2(false)
                setNewL2("")
              }}
              disabled={!newL2.trim()}
            >
              {i18n.save}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAdding2(false)}>
              {i18n.cancel}
            </Button>
          </div>
        )}
      </div>

      {/* L3 */}
      <div className="space-y-1">
        <div className="grid grid-cols-[92px_1fr_auto] items-center gap-2">
          <div className="text-sm font-medium text-slate-700">{i18n.l3}</div>
          <Select value={lvl3 || "none"} onValueChange={(v) => setLvl3(v === "none" ? "" : v)} disabled={!lvl2}>
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder={i18n.selectL3} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{i18n.none}</SelectItem>
              {l3.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            className="px-3"
            onClick={() => {
              if (!lvl2) return
              setAdding3((v) => !v)
              setNewL3("")
            }}
            disabled={!lvl2 || !canEdit}
          >
            +
          </Button>
        </div>
        {adding3 && (
          <div className="grid grid-cols-[92px_1fr_auto_auto] items-center gap-2">
            <div />
            <Input
              placeholder={i18n.l3}
              value={newL3}
              onChange={(e) => setNewL3(e.target.value)}
              className="bg-white/70"
            />
            <Button
              size="sm"
              onClick={() => {
                addL3(newL3)
                setAdding3(false)
                setNewL3("")
              }}
              disabled={!newL3.trim()}
            >
              {i18n.save}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAdding3(false)}>
              {i18n.cancel}
            </Button>
          </div>
        )}
      </div>

      <div className="px-[92px] text-xs text-muted-foreground">
        {i18n.preview}{" "}
        {[
          cats.find((x) => x.id === lvl1)?.name,
          cats.find((x) => x.id === lvl1)?.children?.find((x) => x.id === lvl2)?.name,
          cats
            .find((x) => x.id === lvl1)
            ?.children?.find((x) => x.id === lvl2)
            ?.children?.find((x) => x.id === lvl3)?.name,
        ]
          .filter(Boolean)
          .join(" · ") || i18n.none}
      </div>
    </div>
  )
}
