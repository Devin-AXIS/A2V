"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { BrowserHeader } from "@/components/layout/browser-header"

type Props = { title: string }

export function MaybeHeader({ title }: Props) {
  const pathname = usePathname()
  const [config, setConfig] = useState<any>(null)

  // read config from query/localStorage and persist per-route
  useEffect(() => {
    try {
      const route = "/" + (pathname?.split("/").slice(2).join("/") || "")
      const sp = new URLSearchParams(window.location.search)
      const p = sp.get("pageCfg")
      const cfgId = sp.get("cfgId")
      if (p) {
        const parsed = JSON.parse(p)
        window.localStorage.setItem(`APP_PAGE_ROUTE_${route}`, JSON.stringify(parsed))
        setConfig(parsed)
        return
      }
      if (cfgId) {
        fetch(`http://localhost:3007/api/page-configs/${encodeURIComponent(cfgId)}`)
          .then((r) => r.json().catch(() => null))
          .then((j) => {
            const data = j && (j.data ?? j)
            if (!data) return
            window.localStorage.setItem(`APP_PAGE_ROUTE_${route}`, JSON.stringify(data))
            setConfig(data)
          })
          .catch(() => { })
        return
      }
      const raw = window.localStorage.getItem(`APP_PAGE_ROUTE_${route}`)
      if (raw) setConfig(JSON.parse(raw))
    } catch { }
  }, [pathname])

  const locale = useMemo(() => (pathname?.startsWith("/en") ? "en" : "zh"), [pathname])

  if (!config) return null
  const showHeader = config?.options?.showHeader !== false
  const pageTitle = (config?.title?.[locale]) || title
  if (!showHeader) return null
  return <BrowserHeader title={pageTitle} />
}


