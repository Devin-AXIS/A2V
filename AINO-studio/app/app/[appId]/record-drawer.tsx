"use client"

import { useMemo } from "react"
import { Sheet } from "@/components/ui/sheet"
import type { AppModel } from "@/lib/store"
import { findDirByIdAcrossModules } from "@/lib/store"
import { RecordDrawerContent } from "@/components/builder/record-drawer-content"

type DrawerState = {
  open: boolean
  dirId: string | null
  recordId: string | null
  tab: string
}

type Props = {
  app: AppModel
  open: boolean
  state: DrawerState
  onClose: () => void
  onChange: (nextApp: AppModel) => void
}

export function RecordDrawer({ app, open, state, onClose, onChange }: Props) {
  const dir = useMemo(() => (state.dirId ? findDirByIdAcrossModules(app, state.dirId) : null), [app, state.dirId])
  const rec = useMemo(() => dir?.records.find((r) => r.id === state.recordId) || null, [dir, state.recordId])

  return (
    <Sheet open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      {dir && rec ? <RecordDrawerContent app={app} dir={dir} rec={rec} onClose={onClose} onChange={onChange} /> : null}
    </Sheet>
  )
}
