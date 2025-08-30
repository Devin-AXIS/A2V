"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Check, Search } from "lucide-react"
import { countryData, type CountryNode } from "@/lib/country-data"
import { Input } from "@/components/ui/input"

export function CountrySelect({
  value,
  onChange,
  placeholder = "请选择国家/地区",
}: {
  value?: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // 过滤国家数据
  const filteredCountries = countryData.filter(country =>
    country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayText = value || placeholder

  function handleSelect(country: CountryNode) {
    onChange(country.label)
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between bg-white/70">
          <span className={!value ? "text-muted-foreground" : ""}>{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[400px] p-0 overflow-hidden bg-white/80 backdrop-blur border-white/60 rounded-2xl"
      >
        <div className="p-3 border-b border-white/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索国家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-white/60"
            />
          </div>
        </div>
        <ScrollArea className="h-72">
          <ul className="py-1">
            {filteredCountries.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                未找到匹配的国家
              </li>
            )}
            {filteredCountries.map((country) => (
              <li key={country.value}>
                <button
                  className={
                    "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                    (value === country.label ? "bg-sky-50" : "")
                  }
                  onClick={() => handleSelect(country)}
                >
                  <div className="flex flex-col">
                    <span className={value === country.label ? "text-sky-600 font-medium" : ""}>
                      {country.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {country.code}
                    </span>
                  </div>
                  {value === country.label && <Check className="h-4 w-4 text-sky-600" />}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
