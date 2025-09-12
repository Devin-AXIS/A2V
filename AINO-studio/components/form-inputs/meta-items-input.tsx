"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type MetaFieldDef = { id: string; type: 'text'|'number'|'image'|'select'|'multiselect'; label: string; unit?: string; options?: string[] }
export type MetaItem = {
  id: string
  label: string
  order?: number
  texts?: Array<{ id: string; fieldId: string; label: string; value: string }>
  numbers?: Array<{ id: string; fieldId: string; label: string; value: number; unit?: string }>
  images?: Array<{ id: string; fieldId: string; label: string; url: string }>
  selects?: Array<{ id: string; fieldId: string; label: string; value: string }>
  multiselects?: Array<{ id: string; fieldId: string; label: string; value: string[] }>
}

export function MetaItemsInput({ items, onChange, schema = [], helpEnabled, helpText, allowAddInForm = true }: {
  items: MetaItem[]
  onChange: (items: MetaItem[]) => void
  schema?: MetaFieldDef[]
  helpEnabled?: boolean
  helpText?: string
  allowAddInForm?: boolean
}) {
  // 兼容：schema 为空时，从现有数据的行推断出临时 schema
  const fallbackSchema: MetaFieldDef[] = (schema && schema.length > 0) ? schema : (() => {
    const fds: MetaFieldDef[] = []
    const first = items?.[0]
    if (first?.texts?.length) first.texts.forEach(r => fds.push({ id: r.fieldId || r.id, type: 'text', label: r.label }))
    if (first?.numbers?.length) first.numbers.forEach(r => fds.push({ id: r.fieldId || r.id, type: 'number', label: r.label, unit: r.unit }))
    if (first?.images?.length) first.images.forEach(r => fds.push({ id: r.fieldId || r.id, type: 'image', label: r.label }))
    if ((first as any)?.selects?.length) (first as any).selects.forEach((r: any) => fds.push({ id: r.fieldId || r.id, type: 'select', label: r.label, options: [] }))
    if ((first as any)?.multiselects?.length) (first as any).multiselects.forEach((r: any) => fds.push({ id: r.fieldId || r.id, type: 'multiselect', label: r.label, options: [] }))
    return fds
  })()
  const effSchema = fallbackSchema
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
            <Input className="col-span-12 bg-white" value={it.label} onChange={(e)=>set(idx,{ label: e.target.value })} placeholder="子项名称" />
            <div className="col-span-12 flex items-center gap-2 justify-end">
              {allowAddInForm && (
                <Button type="button" variant="ghost" className="text-red-600" onClick={()=>remove(idx)}>删除子项</Button>
              )}
            </div>
          </div>

          {/* 固定渲染：根据 schema 输出行 */}
          {effSchema.filter(fd=>fd.type==='text').map(fd => {
            const row = (it.texts||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, value: '' }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 text-xs text-gray-600">{fd.label}</div>
                <Input className="col-span-12 bg-white" value={row.value} onChange={(e)=>{ const arr=[...items]; const target=(arr[idx].texts||[]); const i=target.findIndex(x=>x.fieldId===fd.id); if(i>=0){target[i]={...target[i], value:e.target.value}} else { if(!arr[idx].texts) arr[idx].texts=[]; arr[idx].texts!.push({ id: fd.id, fieldId: fd.id, label: fd.label, value: e.target.value }) } onChange(arr) }} placeholder="文本内容" />
              </div>
            )
          })}

          {effSchema.filter(fd=>fd.type==='number').map(fd => {
            const row = (it.numbers||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, value: 0, unit: fd.unit }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 text-xs text-gray-600">{fd.label}{fd.unit?`（${fd.unit}）`:''}</div>
                <Input type="number" className="col-span-12 bg-white" value={row.value} onChange={(e)=>{ const arr=[...items]; const target=(arr[idx].numbers||[]); const i=target.findIndex(x=>x.fieldId===fd.id); const n = e.target.value===''?0:Number(e.target.value); if(i>=0){target[i]={...target[i], value:n}} else { if(!arr[idx].numbers) arr[idx].numbers=[]; arr[idx].numbers!.push({ id: fd.id, fieldId: fd.id, label: fd.label, value: n, unit: fd.unit }) } onChange(arr) }} placeholder="0" />
              </div>
            )
          })}

          {effSchema.filter(fd=>fd.type==='image').map(fd => {
            const row = (it.images||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, url: '' }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 text-xs text-gray-600">{fd.label}</div>
                <Input className="col-span-12 bg-white" value={row.url} onChange={(e)=>{ const arr=[...items]; const target=(arr[idx].images||[]); const i=target.findIndex(x=>x.fieldId===fd.id); if(i>=0){target[i]={...target[i], url:e.target.value}} else { if(!arr[idx].images) arr[idx].images=[]; arr[idx].images!.push({ id: fd.id, fieldId: fd.id, label: fd.label, url: e.target.value }) } onChange(arr) }} placeholder="图片URL" />
              </div>
            )
          })}

          {effSchema.filter(fd=>fd.type==='select').map(fd => {
            const row = (it.selects||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, value: '' }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 text-xs text-gray-600">{fd.label}</div>
                <select className="col-span-12 h-9 rounded border bg-white px-2" value={row.value} onChange={(e)=>{ const arr=[...items]; const target=(arr[idx].selects||[]); const i=target.findIndex(x=>x.fieldId===fd.id); if(i>=0){target[i]={...target[i], value:e.target.value}} else { if(!arr[idx].selects) arr[idx].selects=[]; arr[idx].selects!.push({ id: fd.id, fieldId: fd.id, label: fd.label, value: e.target.value }) } onChange(arr) }}>
                  <option value="">请选择</option>
                  {(fd.options||[]).map(opt=> (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
            )
          })}

          {effSchema.filter(fd=>fd.type==='multiselect').map(fd => {
            const row = (it.multiselects||[]).find(r=>r.fieldId===fd.id) || { id: fd.id, fieldId: fd.id, label: fd.label, value: [] as string[] }
            const selected = new Set(row.value)
            const toggle = (opt: string) => {
              const arr=[...items]; const target=(arr[idx].multiselects||[]); const i=target.findIndex(x=>x.fieldId===fd.id)
              const next = new Set(selected)
              next.has(opt) ? next.delete(opt) : next.add(opt)
              const val = Array.from(next)
              if(i>=0){target[i]={...target[i], value: val}} else { if(!arr[idx].multiselects) arr[idx].multiselects=[]; arr[idx].multiselects!.push({ id: fd.id, fieldId: fd.id, label: fd.label, value: val }) }
              onChange(arr)
            }
            return (
              <div key={fd.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 text-xs text-gray-600 pt-2">{fd.label}</div>
                <div className="col-span-12 flex flex-wrap gap-1">
                  {(fd.options||[]).map(opt => (
                    <button key={opt} type="button" className={`text-xs px-2 py-1 rounded border ${selected.has(opt)?'bg-blue-600 text-white border-blue-600':'bg-white'}`} onClick={()=>toggle(opt)}>{opt}</button>
                  ))}
                </div>
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


