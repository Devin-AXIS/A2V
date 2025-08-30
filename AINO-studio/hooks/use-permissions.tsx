"use client"

import { useEffect, useMemo, useState } from "react"

export type Role = "admin" | "operator" | "viewer"
export type Action = "view" | "edit" | "delete" | "bulkDelete" | "managePermissions"

const LS_KEY = "nocode_role"

export function usePermissions() {
  const [role, setRole] = useState<Role>("admin")

  useEffect(() => {
    try {
      const saved = (localStorage.getItem(LS_KEY) as Role) || "admin"
      setRole(saved)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, role)
    } catch {}
  }, [role])

  const can = useMemo(() => {
    return (action: Action) => {
      if (action === "view") return true
      if (action === "edit") return role === "admin" || role === "operator"
      if (action === "delete") return role === "admin" || role === "operator"
      if (action === "bulkDelete") return role === "admin"
      if (action === "managePermissions") return role === "admin"
      return false
    }
  }, [role])

  return { role, setRole, can }
}
