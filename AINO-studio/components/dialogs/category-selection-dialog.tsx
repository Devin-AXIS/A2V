"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/hooks/use-locale"

type Category = { id: string; name: string; children?: Category[] }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onConfirm: (categoryPath: string) => void
  title?: string
}

export function CategorySelectionDialog({ open, onOpenChange, categories, onConfirm, title }: Props) {
  const { locale } = useLocale()
  const [level1, setLevel1] = useState("")
  const [level2, setLevel2] = useState("")
  const [level3, setLevel3] = useState("")

  // 重置选择状态
  useEffect(() => {
    if (open) {
      setLevel1("")
      setLevel2("")
      setLevel3("")
    }
  }, [open])

  // 获取二级分类
  const level2Categories = level1 ? categories.find(c => c.id === level1)?.children || [] : []
  
  // 获取三级分类
  const level3Categories = level2 ? level2Categories.find(c => c.id === level2)?.children || [] : []

  // 当选择一级分类时，清空下级选择
  const handleLevel1Change = (value: string) => {
    setLevel1(value)
    setLevel2("")
    setLevel3("")
  }

  // 当选择二级分类时，清空三级选择
  const handleLevel2Change = (value: string) => {
    setLevel2(value)
    setLevel3("")
  }

  // 构建分类路径
  const buildCategoryPath = () => {
    const parts = []
    
    if (level1) {
      const cat1 = categories.find(c => c.id === level1)
      if (cat1) parts.push(cat1.name)
    }
    
    if (level2) {
      const cat2 = level2Categories.find(c => c.id === level2)
      if (cat2) parts.push(cat2.name)
    }
    
    if (level3) {
      const cat3 = level3Categories.find(c => c.id === level3)
      if (cat3) parts.push(cat3.name)
    }
    
    return parts.join(" / ")
  }

  // 检查是否可以确认
  const canConfirm = () => {
    // 至少需要选择一级分类
    if (!level1) return false
    
    // 如果有二级分类但没选择，不能确认
    if (level2Categories.length > 0 && !level2) return false
    
    // 如果有三级分类但没选择，不能确认
    if (level3Categories.length > 0 && !level3) return false
    
    return true
  }

  const handleConfirm = () => {
    if (!canConfirm()) return
    const categoryPath = buildCategoryPath()
    onConfirm(categoryPath)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/80 backdrop-blur">
        <DialogHeader>
          <DialogTitle>
            {title || (locale === "zh" ? "选择分类" : "Select Category")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 一级分类 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {locale === "zh" ? "一级分类" : "Level 1 Category"}
            </label>
            <Select value={level1} onValueChange={handleLevel1Change}>
              <SelectTrigger className="bg-white/70">
                <SelectValue placeholder={locale === "zh" ? "请选择一级分类" : "Select level 1 category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 二级分类 */}
          {level2Categories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {locale === "zh" ? "二级分类" : "Level 2 Category"}
              </label>
              <Select value={level2} onValueChange={handleLevel2Change} disabled={!level1}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder={locale === "zh" ? "请选择二级分类" : "Select level 2 category"} />
                </SelectTrigger>
                <SelectContent>
                  {level2Categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 三级分类 */}
          {level3Categories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {locale === "zh" ? "三级分类" : "Level 3 Category"}
              </label>
              <Select value={level3} onValueChange={setLevel3} disabled={!level2}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder={locale === "zh" ? "请选择三级分类" : "Select level 3 category"} />
                </SelectTrigger>
                <SelectContent>
                  {level3Categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 预览选择的分类路径 */}
          {level1 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>{locale === "zh" ? "已选择：" : "Selected: "}</strong>
                {buildCategoryPath()}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm()}>
            {locale === "zh" ? "确认" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
