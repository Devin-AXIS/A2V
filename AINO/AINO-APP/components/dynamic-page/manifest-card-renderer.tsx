"use client"

import React, { useMemo } from "react"
import { AppCard } from "@/components/layout/app-card"
import { usePageData } from "@/components/providers/page-data-context"

type AnyRecord = Record<string, any>

function applySelectPath<T = any>(data: any, selectPath?: string): T {
    if (!selectPath) return data as T
    const path = selectPath.startsWith("$.")
        ? selectPath.slice(2)
        : selectPath.startsWith("$")
            ? selectPath.slice(1)
            : selectPath
    if (!path) return data as T
    return path.split(".").reduce<any>((acc, key) => (acc && key in acc ? acc[key] : undefined), data) as T
}

function renderListCard(card: AnyRecord, contextData: AnyRecord) {
    const sourceKey = card?.bind?.context
    const selectPath = card?.bind?.select
    const raw = sourceKey ? contextData?.[sourceKey] : undefined
    const items: any[] = Array.isArray(applySelectPath(raw, selectPath))
        ? applySelectPath<any[]>(raw, selectPath)
        : (Array.isArray(raw) ? raw : [])

    return (
        <AppCard className="p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">{card.title || card.id || "列表"}</h3>
                {/* 占位的操作区，可后续注入 actions */}
            </div>
            {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无数据</div>
            ) : (
                <ul className="space-y-2">
                    {items.map((it: any, idx: number) => (
                        <li key={it?.id || idx} className="rounded-lg border border-gray-200/60 px-3 py-2">
                            <div className="text-sm font-medium truncate">{String(it?.name ?? it?.title ?? it?.id ?? `#${idx + 1}`)}</div>
                            <div className="text-xs text-muted-foreground truncate">{typeof it === "object" ? JSON.stringify(it) : String(it)}</div>
                        </li>
                    ))}
                </ul>
            )}
        </AppCard>
    )
}

function renderTextCard(card: AnyRecord, contextData: AnyRecord) {
    const sourceKey = card?.bind?.context
    const selectPath = card?.bind?.select
    const raw = sourceKey ? contextData?.[sourceKey] : card?.text
    const value = applySelectPath<any>(raw, selectPath)
    return (
        <AppCard className="p-4">
            <div className="text-sm text-muted-foreground">{card.title || "文本"}</div>
            <div className="mt-1 text-base">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "")}</div>
        </AppCard>
    )
}

export function ManifestCardRenderer() {
    const { pageConfig, data } = usePageData()

    const cards = useMemo(() => {
        const list = (pageConfig as AnyRecord)?.cards
        return Array.isArray(list) ? list : []
    }, [pageConfig])

    if (cards.length === 0) return null

    return (
        <div className="p-4 space-y-3">
            {cards.map((card: AnyRecord) => {
                const type = (card?.type || "").toLowerCase()
                if (type === "list") return <div key={card.id || card.type}>{renderListCard(card, data)}</div>
                if (type === "text") return <div key={card.id || card.type}>{renderTextCard(card, data)}</div>
                // 默认回退：原样展示配置，便于调试
                return (
                    <AppCard key={card.id || card.type} className="p-4">
                        <div className="text-sm text-muted-foreground">未支持的卡片类型：{String(card?.type || "unknown")}</div>
                        <pre className="mt-2 text-xs whitespace-pre-wrap break-all">{JSON.stringify(card, null, 2)}</pre>
                    </AppCard>
                )
            })}
        </div>
    )
}

export default ManifestCardRenderer


