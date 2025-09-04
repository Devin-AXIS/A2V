"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { AppModel } from "@/lib/store"

// Helper to find the user directory and records
const findUsers = (app: AppModel) => {
  for (const mod of app.modules) {
    const userDir = mod.directories.find((d) => d.name === "用户列表" || d.name === "Users")
    if (userDir) {
      return userDir.records.map((r) => ({
        id: r.id,
        name: (r.username as string) || (r.name as string) || r.id,
        avatar: (r.avatar as string) || `/placeholder.svg?width=32&height=32&query=${(r.username as string) || r.id}`,
      }))
    }
  }
  return []
}

type User = {
  id: string
  name: string
  avatar: string
}

export function UserSelect({
  app,
  value,
  onChange,
  isMulti = false,
}: {
  app: AppModel
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  isMulti?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const users = React.useMemo(() => findUsers(app), [app])

  const selectedUsers = React.useMemo(() => {
    if (!value) return []
    const selectedIds = new Set(Array.isArray(value) ? value : [value])
    return users.filter((u) => selectedIds.has(u.id))
  }, [value, users])

  const handleSelect = (user: User) => {
    if (isMulti) {
      const currentIds = Array.isArray(value) ? value : value ? [value] : []
      const newIds = currentIds.includes(user.id) ? currentIds.filter((id) => id !== user.id) : [...currentIds, user.id]
      onChange(newIds)
    } else {
      onChange(user.id)
      setOpen(false)
    }
  }

  const handleUnselect = (userId: string) => {
    if (isMulti) {
      const currentIds = Array.isArray(value) ? value : []
      onChange(currentIds.filter((id) => id !== userId))
    } else {
      onChange(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 bg-white/70"
        >
          {selectedUsers.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 bg-slate-100 rounded-md pl-1 pr-2 py-0.5 border border-slate-200"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnselect(user.id)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">选择用户...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="搜索用户..."
              className="h-10 border-0 pl-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>未找到用户。</CommandEmpty>
            <CommandGroup heading="最近">
              {users.map((user) => {
                const isSelected = selectedUsers.some((su) => su.id === user.id)
                return (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={() => handleSelect(user)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                    <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
