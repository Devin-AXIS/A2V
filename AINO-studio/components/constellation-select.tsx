"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { constellationData, getConstellationById } from "@/lib/data/constellation-data"

interface ConstellationSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ConstellationSelect({ value, onChange, placeholder = "请选择星座" }: ConstellationSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedConstellation = value ? getConstellationById(value) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between bg-white/70">
          {selectedConstellation ? (
            <div className="flex items-center gap-2">
              <span>{selectedConstellation.symbol}</span>
              <span>{selectedConstellation.name}</span>
              <span className="text-xs text-muted-foreground">({selectedConstellation.dateRange})</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="搜索星座..." />
          <CommandList>
            <CommandEmpty>未找到星座。</CommandEmpty>
            <CommandGroup>
              {constellationData.map((constellation) => (
                <CommandItem
                  key={constellation.id}
                  value={constellation.name}
                  onSelect={() => {
                    onChange(constellation.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === constellation.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{constellation.symbol}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{constellation.name}</span>
                        <span className="text-xs text-muted-foreground">({constellation.englishName})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{constellation.dateRange}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{constellation.element}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
