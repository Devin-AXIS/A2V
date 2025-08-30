"use client"

import { Button } from "@/components/ui/button"
import { CheckSquareIcon, Trash2 } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

export function BulkToolbar({
  count,
  canBulkDelete = true,
  onBulkDelete,
  onClear,
}: {
  count: number
  canBulkDelete?: boolean
  onBulkDelete: () => void
  onClear: () => void
}) {
  const { t } = useLocale()
  if (count <= 0) return null
  return (
    <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <CheckSquareIcon className="size-4" />
        {t("selected")} {count} {t("items")}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={!canBulkDelete}
          title={!canBulkDelete ? t("noPermissionToBulkDelete") : t("bulkDeleteSelected")}
          className="rounded-xl"
        >
          <Trash2 className="mr-1 size-4" />
          {t("bulkDelete")}
        </Button>
        <Button variant="secondary" size="sm" onClick={onClear} className="rounded-xl">
          {t("clearSelection")}
        </Button>
      </div>
    </div>
  )
}
