"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Check } from "lucide-react"
import { cityData, type CityNode } from "@/lib/city-data-complete"

function findPathByLabel(tree: CityNode[], label: string): CityNode[] | null {
  if (!label) return null
  const parts = label.split(" / ")
  let currentNodes: CityNode[] | undefined = tree
  const path: CityNode[] = []

  for (const part of parts) {
    const found = currentNodes?.find((n) => n.label === part)
    if (found) {
      path.push(found)
      currentNodes = found.children
    } else {
      return null // Path broken
    }
  }
  return path.length > 0 ? path : null
}

export function CitySelect({
  value,
  onChange,
  placeholder = "请选择省/市/区",
}: {
  value?: string // "广东省 / 深圳市 / 南山区"
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [l1, setL1] = useState<string>("") // province value
  const [l2, setL2] = useState<string>("") // city value
  const [l3, setL3] = useState<string>("") // district value

  useEffect(() => {
    if (value) {
      const path = findPathByLabel(cityData, value)
      if (path) {
        setL1(path[0]?.value || "")
        setL2(path[1]?.value || "")
        setL3(path[2]?.value || "")
      }
    } else {
      setL1("")
      setL2("")
      setL3("")
    }
  }, [value])

  const listL2 = useMemo(() => cityData.find((p) => p.value === l1)?.children || [], [l1])
  const listL3 = useMemo(() => listL2.find((c) => c.value === l2)?.children || [], [l1, l2])

  const displayText = value || placeholder

  function handleSelect(level: 1 | 2 | 3, node: CityNode) {
    let path: CityNode[] = []
    if (level === 1) {
      setL1(node.value)
      setL2("")
      setL3("")
      path = [node]
    } else if (level === 2) {
      setL2(node.value)
      setL3("")
      const l1Node = cityData.find((p) => p.value === l1)!
      path = [l1Node, node]
    } else if (level === 3) {
      setL3(node.value)
      const l1Node = cityData.find((p) => p.value === l1)!
      const l2Node = l1Node.children!.find((c) => c.value === l2)!
      path = [l1Node, l2Node, node]
      setOpen(false) // Close on final selection
    }
    onChange(path.map((p) => p.label).join(" / "))
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
        className="w-[680px] p-0 overflow-hidden bg-white/80 backdrop-blur border-white/60 rounded-2xl"
      >
        <div className="grid grid-cols-3 divide-x divide-white/60">
          <ScrollArea className="h-72">
            <ul className="py-1">
              {cityData.map((n) => (
                <li key={n.value}>
                  <button
                    className={
                      "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                      (l1 === n.value ? "bg-sky-50" : "")
                    }
                    onClick={() => handleSelect(1, n)}
                  >
                    <span className={l1 === n.value ? "text-sky-600 font-medium" : ""}>{n.label}</span>
                    {l1 === n.value && <Check className="h-4 w-4 text-sky-600" />}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <ScrollArea className="h-72">
            <ul className="py-1">
              {listL2.length === 0 && <li className="px-3 py-2 text-xs text-muted-foreground">请选择省份</li>}
              {listL2.map((n) => (
                <li key={n.value}>
                  <button
                    className={
                      "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                      (l2 === n.value ? "bg-sky-50" : "")
                    }
                    onClick={() => handleSelect(2, n)}
                  >
                    <span className={l2 === n.value ? "text-sky-600 font-medium" : ""}>{n.label}</span>
                    {l2 === n.value && <Check className="h-4 w-4 text-sky-600" />}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <ScrollArea className="h-72">
            <ul className="py-1">
              {listL3.length === 0 && <li className="px-3 py-2 text-xs text-muted-foreground">请选择城市</li>}
              {listL3.map((n) => (
                <li key={n.value}>
                  <button
                    className={
                      "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                      (l3 === n.value ? "bg-sky-50" : "")
                    }
                    onClick={() => handleSelect(3, n)}
                  >
                    <span className={l3 === n.value ? "text-sky-600 font-medium" : ""}>{n.label}</span>
                    {l3 === n.value && <Check className="h-4 w-4 text-sky-600" />}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
