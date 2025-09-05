"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { DynamicPageComponent } from "@/components/dynamic-page/dynamic-page-component"
import { Button } from "@/components/ui/button"

export default function PreviewPage() {
  const params = useParams<{ locale: string; id: string }>()
  const sp = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manifest, setManifest] = useState<any>(null)

  const device = sp.get("device") === "pc" ? "pc" : "mobile"
  const locale = params.locale || "zh"
  const id = params.id

  useEffect(() => {
    let canceled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:3001/api/preview-manifests/${id}`)
        const data = await res.json()
        if (!res.ok || !data?.success) throw new Error(data?.message || "failed")
        if (!canceled) setManifest(data.data?.manifest || {})
      } catch (e: any) {
        if (!canceled) setError(e?.message || "error")
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    run()
    return () => { canceled = true }
  }, [id])

  const pageCategory = useMemo(() => {
    const cat = manifest?.pages?.home?.category || "workspace"
    return typeof cat === "string" ? cat : "workspace"
  }, [manifest])

  if (loading) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center text-muted-foreground">
        Loading...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-3">
        <div className="text-sm text-red-600">{error}</div>
        <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-transparent">
      <DynamicPageComponent category={pageCategory} locale={locale} layout={device === "pc" ? "pc" : "mobile"} />
    </main>
  )
}
