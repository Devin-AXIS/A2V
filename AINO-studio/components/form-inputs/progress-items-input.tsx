"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type ProgressItem = {
  id: string
  key: string
  label: string
  value: number
  status?: string
  weight?: number
}

export type ProgressItemsInputProps = {
  items: ProgressItem[]
  onChange: (items: ProgressItem[]) => void
  aggregation?: "weightedAverage" | "max" | "min"
  showProgressBar?: boolean
  showPercentage?: boolean
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 100) return 100
  return Math.round(n)
}

function aggregate(items: ProgressItem[], mode: "weightedAverage"|"max"|"min" = "weightedAverage"): number {
  if (!Array.isArray(items) || items.length === 0) return 0
  if (mode === "max") return clamp01(Math.max(...items.map(i => i.value || 0)))
  if (mode === "min") return clamp01(Math.min(...items.map(i => i.value || 0)))
  const vals = items.map(i => ({ v: Number(i.value||0), w: Number(i.weight ?? 1) }))
  const sw = vals.reduce((a,b)=>a+(Number.isFinite(b.w)?b.w:0),0) || 1
  const sum = vals.reduce((a,b)=>a+((Number.isFinite(b.v)?b.v:0)*(Number.isFinite(b.w)?b.w:0)),0)
  return clamp01(sum / sw)
}

export function ProgressItemsInput({ items, onChange, aggregation = "weightedAverage", showProgressBar = true, showPercentage = true }: ProgressItemsInputProps) {
  const agg = useMemo(() => aggregate(items, aggregation), [items, aggregation])

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Aggregated: {agg}%</div>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={it.id || idx} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-3 bg-white" value={it.label} onChange={(e)=>{
              const arr = [...items]; arr[idx] = { ...it, label: e.target.value, key: e.target.value || it.key }; onChange(arr)
            }} placeholder="Label" />
            <Input className="col-span-2 bg-white" value={it.status || ''} onChange={(e)=>{ const arr=[...items]; arr[idx] = { ...it, status: e.target.value }; onChange(arr) }} placeholder="Status" />
            <Input type="number" className="col-span-2 bg-white" value={it.weight ?? 1} onChange={(e)=>{ const arr=[...items]; arr[idx] = { ...it, weight: e.target.value?Number(e.target.value):1 }; onChange(arr) }} placeholder="Weight" />
            <Input type="number" className="col-span-3 bg-white" value={it.value} onChange={(e)=>{ const arr=[...items]; arr[idx] = { ...it, value: clamp01(Number(e.target.value||0)) }; onChange(arr) }} placeholder="0-100" />
            <Button type="button" variant="ghost" className="col-span-2 text-red-600" onClick={()=>{ const arr=[...items]; arr.splice(idx,1); onChange(arr) }}>删除</Button>
          </div>
        ))}
      </div>
      <div>
        <Button type="button" variant="outline" onClick={()=>{
          const arr = [...items, { id: Math.random().toString(36).slice(2), key: `p${items.length+1}`, label: `子进度 ${items.length+1}`, value: 0, status: 'planned', weight: 1 }]
          onChange(arr)
        }}>新增子进度</Button>
      </div>
    </div>
  )
}


