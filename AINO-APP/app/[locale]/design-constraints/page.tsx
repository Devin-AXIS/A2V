"use client"

import React, { Suspense } from 'react'
import { BrowserHeader } from '@/components/layout/browser-header'
import { ComponentConstraintChecker } from '@/components/dev/component-constraint-checker'

interface DesignConstraintsPageProps {
  params: { locale: string }
}

export default async function DesignConstraintsPage({ params }: DesignConstraintsPageProps) {
  const { locale } = await params
  return (
    <div className="min-h-screen pb-32">
      <BrowserHeader title="设计约束系统" />
      <div className="px-4 pt-4">
        <Suspense fallback={<div className="p-4 text-center">加载中...</div>}>
          <ComponentConstraintChecker />
        </Suspense>
      </div>
    </div>
  )
}
