"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type MetaFieldDef = { id: string; type: 'text'|'number'|'image'; label: string; unit?: string }
export type MetaItem = {
  id: string
  label: string
  order?: number
  texts?: Array<{ id: string; fieldId: string; label: string; value: string }>
  numbers?: Array<{ id: string; fieldId: string; label: string; value: number; unit?: string }>
  images?: Array<{ id: string; fieldId: string; label: string; url: string }>
}

export function MetaItemsInput({ items, onChange, schema = [], helpEnabled, helpText, allowAddInForm = true }: {
  items: MetaItem[]
  onChange: (items: MetaItem[]) => void
  schema?: MetaFieldDef[]
  helpEnabled?: boolean
  helpText?: string
  allowAddInForm?: boolean
}) {
  const set = (idx: number, patch: Partial<MetaItem>) => {
    const arr = [...items]
    arr[idx] = { ...arr[idx], ...patch }
    onChange(arr)
  }
  const remove = (idx: number) => {
    const arr = [...items]
    arr.splice(idx,1)
    onChange(arr)
  }

  // 子项结构由 schema 决定，输入层不增删字段行

  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div key={it.id || idx} className="space-y-2 border border-white/60 rounded-md p-2 bg-white/60">
          <div className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-6 bg-white" value={it.label} onChange={(e)=>set(idx,{ label: e.target.value })} placeholder="子项名称" />
            <div className="col-span-6 flex items-center gap-2 justify-end">
              {allowAddInForm && (
                <Button type="button" variant="ghost" className="text-red-600" onClick={()=>remove(idx)}>删除子项</Button>
              )}
            </div>
          </div>

          {/* 固定渲染：根据 schema 输出行 */}
          {schema.filter(fd=>fd.type==='text').map(fd => {
            const row = (it.texts||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, value: '' }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 text-xs text-gray-600">{fd.label}</div>
                <Input className="col-span-9 bg-white" value={row.value} onChange={(e)=>{ const arr=[...items]; const target=(arr[idx].texts||[]); const i=target.findIndex(x=>x.fieldId===fd.id); if(i>=0){target[i]={...target[i], value:e.target.value}} else { if(!arr[idx].texts) arr[idx].texts=[]; arr[idx].texts!.push({ id: fd.id, fieldId: fd.id, label: fd.label, value: e.target.value }) } onChange(arr) }} placeholder="文本内容" />
              </div>
            )
          })}

          {schema.filter(fd=>fd.type==='number').map(fd => {
            const row = (it.numbers||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, value: 0, unit: fd.unit }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 text-xs text-gray-600">{fd.label}</div>
                <Input type="number" className="col-span-7 bg-white" value={row.value} onChange={(e)=>{ const arr=[...items]; const target=(arr[idx].numbers||[]); const i=target.findIndex(x=>x.fieldId===fd.id); const n = e.target.value===''?0:Number(e.target.value); if(i>=0){target[i]={...target[i], value:n}} else { if(!arr[idx].numbers) arr[idx].numbers=[]; arr[idx].numbers!.push({ id: fd.id, fieldId: fd.id, label: fd.label, value: n, unit: fd.unit }) } onChange(arr) }} placeholder="0" />
                <div className="col-span-2 text-xs text-gray-500">{fd.unit||''}</div>
              </div>
            )
          })}

          {schema.filter(fd=>fd.type==='image').map(fd => {
            const row = (it.images||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, url: '' }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 text-xs text-gray-600">{fd.label}</div>
                <Input className="col-span-9 bg-white" value={row.url} onChange={(e)=>{ const arr=[...items]; const target=(arr[idx].images||[]); const i=target.findIndex(x=>x.fieldId===fd.id); if(i>=0){target[i]={...target[i], url:e.target.value}} else { if(!arr[idx].images) arr[idx].images=[]; arr[idx].images!.push({ id: fd.id, fieldId: fd.id, label: fd.label, url: e.target.value }) } onChange(arr) }} placeholder="图片URL" />
              </div>
            )
          })}
        </div>
      ))}
      {allowAddInForm && (
        <div>
          <Button type="button" variant="outline" onClick={()=>{
            onChange([...(items||[]), { id: Math.random().toString(36).slice(2), label: `项 ${items.length+1}`, texts: [], numbers: [], images: [] }])
          }}>新增项</Button>
        </div>
      )}
      {helpEnabled && (
        <div className="text-xs text-gray-500 pt-1">{helpText || ''}</div>
      )}
    </div>
  )
}


