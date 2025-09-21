"use client"

import { useMemo } from "react"
import { Sheet } from "@/components/ui/sheet"
import { ApiRecordDrawerContent } from "@/components/builder/api-record-drawer-content"

interface DirectoryModel {
  id: string
  name: string
  fields: any[]
  categories?: any[]
}

interface RecordData {
  id: string
  [key: string]: any
}

type DrawerState = {
  open: boolean
  dirId: string | null
  recordId: string | null
  tab: string
}

type Props = {
  currentDir: DirectoryModel | null
  records: RecordData[]
  app?: any
  open: boolean
  state: DrawerState
  onClose: () => void
  onSave: (dirId: string, recordId: string, props: Record<string, any>) => Promise<void>
}

export function ApiRecordDrawer({ currentDir, records, app, open, state, onClose, onSave }: Props) {
  const rec = useMemo(() => {
    if (!state.recordId || !records) return null
    return records.find((r) => r.id === state.recordId) || null
  }, [records, state.recordId])

  return (
    <Sheet open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      {currentDir && rec ? (
        <ApiRecordDrawerContent 
          dir={currentDir} 
          rec={rec} 
          app={app}
          onClose={onClose} 
          onSave={onSave} 
        />
      ) : null}
    </Sheet>
  )
}
