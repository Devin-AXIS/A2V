"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
}: {
  value?: number
  onChange: (v: number | null) => void
  placeholder?: string
}) {
  // For now, currency selector is visual only and doesn't change the stored value type.
  return (
    <div className="flex items-center">
      <Select defaultValue="CNY">
        <SelectTrigger className="w-[80px] rounded-r-none bg-white/70">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CNY">CNY</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        className="rounded-l-none bg-white/70"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        placeholder={placeholder}
        step="0.01"
      />
    </div>
  )
}
