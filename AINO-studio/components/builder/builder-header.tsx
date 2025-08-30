"use client"

import { Button } from "@/components/ui/button"
import { Languages, Home, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/hooks/use-permissions"
import { UserMenu } from "@/components/layout/user-menu"
import { useLocale } from "@/hooks/use-locale"

export function BuilderHeader({
  appName,
  moduleName,
  dirName,
  role,
  onRole,
  locale,
  onToggleLocale,
  onSave,
  onHome,
  tSave = "保存",
}: {
  appName: string
  moduleName?: string
  dirName?: string
  role: Role
  onRole: (r: Role) => void
  locale: string
  onToggleLocale: () => void
  onSave: () => void
  onHome: () => void
  tSave?: string
}) {
  const { t } = useLocale()
  
  const roleLabels = {
    admin: locale === "zh" ? "管理员" : "Admin",
    operator: locale === "zh" ? "运营" : "Operator", 
    viewer: locale === "zh" ? "只读" : "Viewer"
  }
  
  const roleDescriptions = {
    admin: locale === "zh" ? "管理员（全部权限）" : "Admin (Full permissions)",
    operator: locale === "zh" ? "运营（编辑/删除）" : "Operator (Edit/Delete)",
    viewer: locale === "zh" ? "只读（查看）" : "Viewer (Read only)"
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/40 backdrop-blur-lg">
      <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          className="rounded-2xl px-3 h-9 shadow-sm bg-black/80 text-white hover:bg-black/70"
          onClick={onHome}
        >
          <Home className="size-4" />
        </Button>
        <div className="font-semibold">{appName}</div>
        <span className="text-muted-foreground">/</span>
        <div className="text-muted-foreground">{moduleName || "-"}</div>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{dirName || "-"}</span>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-2xl">
                <Shield className="size-4" />
                <span>{roleLabels[role]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur rounded-2xl">
              <DropdownMenuLabel>{locale === "zh" ? "切换角色" : "Switch Role"}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onRole("admin")}>{roleDescriptions.admin}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRole("operator")}>{roleDescriptions.operator}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRole("viewer")}>{roleDescriptions.viewer}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" className="gap-2 rounded-2xl" onClick={onToggleLocale} aria-label={t("toggleLang")}>
            <Languages className="size-4" />
            <span>{locale === "zh" ? "中/EN" : "EN/中"}</span>
          </Button>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
