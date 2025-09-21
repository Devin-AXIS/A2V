"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { skillsData, skillCategories, getSkillsByCategory, getSkillById } from "@/lib/data/skills-data"

interface SkillsSelectProps {
  value: string[] // Array of skill IDs
  onChange: (value: string[]) => void
  allowedCategories?: string[] // 允许的分类
  maxSkills?: number // 最大技能数量
  showLevel?: boolean // 是否显示等级
  customCategories?: { id: string; name: string }[] // 自定义分类
  customSkills?: { id: string; name: string; category: string }[] // 自定义技能
  className?: string
}

export function SkillsSelect({
  value = [],
  onChange,
  allowedCategories,
  maxSkills,
  showLevel = false,
  customCategories = [],
  customSkills = [],
  className,
}: SkillsSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")

  // 合并预定义技能和自定义技能
  const allSkills = useMemo(() => {
    return [...skillsData, ...customSkills]
  }, [customSkills])

  const allCategories = useMemo(() => {
    // 始终使用自定义分类，如果没有则返回空数组
    return customCategories || []
  }, [customCategories])

  const selectedSkills = useMemo(() => {
    return value.map((id) => {
      const predefinedSkill = getSkillById(id)
      if (predefinedSkill) return predefinedSkill
      return customSkills.find(s => s.id === id)
    }).filter(Boolean)
  }, [value, customSkills])

  const availableCategories = useMemo(() => {
    if (allowedCategories && allowedCategories.length > 0) {
      return allCategories.filter((cat) => allowedCategories.includes(cat.name))
    }
    return allCategories
  }, [allowedCategories, allCategories])

  const filteredSkills = useMemo(() => {
    if (activeCategory === "all") {
      // 只显示用户配置的分类中的技能
      if (allowedCategories && allowedCategories.length > 0) {
        return allSkills.filter((skill) => allowedCategories.includes(skill.category))
      }
      return []
    }
    // 只显示当前分类的自定义技能
    const categoryCustomSkills = customSkills.filter(s => s.category === activeCategory)
    return categoryCustomSkills
  }, [activeCategory, allowedCategories, allSkills, customSkills])

  const handleSelect = (skillId: string) => {
    const isSelected = value.includes(skillId)
    if (isSelected) {
      onChange(value.filter((id) => id !== skillId))
    } else {
      if (maxSkills && value.length >= maxSkills) {
        return // 达到最大数量限制
      }
      onChange([...value, skillId])
    }
  }

  const handleRemove = (skillId: string) => {
    onChange(value.filter((id) => id !== skillId))
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 bg-white/70"
          >
            <div className="flex gap-1 flex-wrap">
              {selectedSkills.length > 0 ? (
                selectedSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(skill.id)
                    }}
                  >
                    {skill.name}
                    {showLevel && skill.level && <span className="ml-1 text-xs opacity-70">({skill.level})</span>}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">选择技能...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="all" className="text-xs">
                全部
              </TabsTrigger>
              {availableCategories.slice(0, 3).map((category) => (
                <TabsTrigger key={category.id} value={category.name} className="text-xs">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <Command>
                <CommandInput placeholder="搜索技能..." />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>未找到技能。</CommandEmpty>
                  {availableCategories.map((category) => {
                    // 只显示当前分类的自定义技能
                    const categoryCustomSkills = customSkills.filter(s => s.category === category.name)
                    
                    if (categoryCustomSkills.length === 0) return null

                    return (
                      <CommandGroup key={category.id} heading={category.name}>
                        {categoryCustomSkills.map((skill) => (
                          <CommandItem
                            key={skill.id}
                            value={skill.name}
                            onSelect={() => handleSelect(skill.id)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Check
                                className={cn("mr-2 h-4 w-4", value.includes(skill.id) ? "opacity-100" : "opacity-0")}
                              />
                              <div>
                                <div className="font-medium">{skill.name}</div>
                                {showLevel && skill.level && (
                                  <div className="text-xs text-muted-foreground">{skill.level}</div>
                                )}
                              </div>
                            </div>
                            {skill.description && (
                              <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                                {skill.description}
                              </div>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                  })}
                </CommandList>
              </Command>
            </TabsContent>

            {availableCategories.map((category) => (
              <TabsContent key={category.id} value={category.name} className="mt-0">
                <Command>
                  <CommandInput placeholder={`搜索${category.name}技能...`} />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>未找到技能。</CommandEmpty>
                    <CommandGroup>
                      {customSkills.filter(s => s.category === category.name).map((skill) => (
                        <CommandItem
                          key={skill.id}
                          value={skill.name}
                          onSelect={() => handleSelect(skill.id)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Check
                              className={cn("mr-2 h-4 w-4", value.includes(skill.id) ? "opacity-100" : "opacity-0")}
                            />
                            <div>
                              <div className="font-medium">{skill.name}</div>
                              {showLevel && skill.level && (
                                <div className="text-xs text-muted-foreground">{skill.level}</div>
                              )}
                            </div>
                          </div>
                          {skill.description && (
                            <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                              {skill.description}
                            </div>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </TabsContent>
            ))}
          </Tabs>

          {maxSkills && (
            <div className="p-2 border-t text-xs text-muted-foreground text-center">
              已选择 {selectedSkills.length} / {maxSkills} 个技能
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
