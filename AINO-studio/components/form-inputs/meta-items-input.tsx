"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type MetaItem = {
  id: string
  label: string
  type: 'text' | 'number' | 'image'
  value: any
  unit?: string
  order?: number
}

export function MetaItemsInput({ items, onChange, helpEnabled, helpText, allowedTypes = ['text','number','image'] }: {
  items: MetaItem[]
  onChange: (items: MetaItem[]) => void
  helpEnabled?: boolean
  helpText?: string
  allowedTypes?: Array<'text'|'number'|'image'>
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

  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div key={it.id || idx} className="grid grid-cols-12 gap-2 items-center">
          <Input className="col-span-3 bg-white" value={it.label} onChange={(e)=>set(idx,{ label: e.target.value })} placeholder="名称" />
          <select className="col-span-2 h-8 rounded border px-2 bg-white" value={it.type} onChange={(e)=>set(idx,{ type: e.target.value as any })}>
            {allowedTypes.includes('text') && <option value="text">文本</option>}
            {allowedTypes.includes('number') && <option value="number">数字</option>}
            {allowedTypes.includes('image') && <option value="image">图片</option>}
          </select>
          {it.type === 'text' && (
            <Input className="col-span-5 bg-white" value={it.value || ''} onChange={(e)=>set(idx,{ value: e.target.value })} placeholder="请输入文本" />
          )}
          {it.type === 'number' && (
            <div className="col-span-5 flex items-center gap-2">
              <Input type="number" className="flex-1 bg-white" value={typeof it.value === 'number' ? it.value : ''} onChange={(e)=>set(idx,{ value: e.target.value === '' ? null : Number(e.target.value) })} placeholder="0" />
              <Input className="w-20 bg-white" value={it.unit || ''} onChange={(e)=>set(idx,{ unit: e.target.value })} placeholder="单位" />
            </div>
          )}
          {it.type === 'image' && (
            <Input className="col-span-5 bg-white" value={it.value || ''} onChange={(e)=>set(idx,{ value: e.target.value })} placeholder="图片URL" />
          )}
          <Button type="button" variant="ghost" className="col-span-2 text-red-600" onClick={()=>remove(idx)}>删除</Button>
        </div>
      ))}
      <div>
        <Button type="button" variant="outline" onClick={()=>{
          onChange([...(items||[]), { id: Math.random().toString(36).slice(2), label: `项 ${items.length+1}`, type: 'text', value: '' }])
        }}>新增项</Button>
      </div>
      {helpEnabled && (
        <div className="text-xs text-gray-500 pt-1">{helpText || ''}</div>
      )}
    </div>
  )
}


