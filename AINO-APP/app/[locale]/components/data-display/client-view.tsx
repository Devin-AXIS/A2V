"use client"

import { useState } from "react"
import { Tabs } from "@/components/navigation/tabs"
import { AppCard } from "@/components/layout/app-card"

// Import all chart components
import { DonutChartActive } from "@/components/data-display/donut-chart-active"
import { DonutChartWithText } from "@/components/data-display/donut-chart-with-text"
import { DonutChartWithLabels } from "@/components/data-display/donut-chart-with-labels"
import { SemiPieChart } from "@/components/data-display/semi-pie-chart"
import { NestedPieChart } from "@/components/data-display/nested-pie-chart"
import { GradientPieChart } from "@/components/data-display/gradient-pie-chart"
import { LabeledPieChart } from "@/components/data-display/labeled-pie-chart"
import { SimpleBarChart } from "@/components/data-display/simple-bar-chart"
import { ExpenseBubbleChart } from "@/components/data-display/expense-bubble-chart"
import { StackedBarChart } from "@/components/data-display/stacked-bar-chart"
import { HorizontalBarChart } from "@/components/data-display/horizontal-bar-chart"
import { BarChartWithLabel } from "@/components/data-display/bar-chart-with-label"
import { NegativeBarChart } from "@/components/data-display/negative-bar-chart"
import { SimpleLineChart } from "@/components/data-display/simple-line-chart"
import { StackedAreaChart } from "@/components/data-display/stacked-area-chart"
import { SkillsRadarChart } from "@/components/data-display/skills-radar-chart"
import { ProgressRadialBarChart } from "@/components/data-display/progress-radial-bar-chart"
import { ScatterChart } from "@/components/data-display/scatter-chart"
import { FunnelChart } from "@/components/data-display/funnel-chart"
import { GaugeChart } from "@/components/data-display/gauge-chart"
import { HeatmapChart } from "@/components/data-display/heatmap-chart"
import { TreemapChart } from "@/components/data-display/treemap-chart"
import { MultiLineChart } from "@/components/data-display/multi-line-chart"
import type { Locale } from "@/lib/dictionaries"

interface DataDisplayClientViewProps {
  pageDict: {
    pieChart: string
    barChart: string
    abstractCharts: string
    lineChart: string
    areaChart: string
    radarChart: string
    radialBarChart: string
    advancedCharts?: string
    scatterChart?: string
  }
  locale: Locale
}

export function DataDisplayClientView({ pageDict }: DataDisplayClientViewProps) {
  const tabs = [
    pageDict.pieChart,
    pageDict.barChart,
    pageDict.abstractCharts,
    pageDict.lineChart,
    pageDict.areaChart,
    pageDict.radarChart,
    pageDict.radialBarChart,
    pageDict.advancedCharts || "高级图表",
    pageDict.scatterChart || "散点图",
  ]
  const [activeTab, setActiveTab] = useState(tabs[0])

  const renderContent = () => {
    switch (activeTab) {
      case pageDict.pieChart:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppCard className="p-6">
              <DonutChartActive />
            </AppCard>
            <AppCard className="p-6">
              <DonutChartWithText />
            </AppCard>
            <AppCard className="p-6">
              <DonutChartWithLabels />
            </AppCard>
            <AppCard className="p-6">
              <SemiPieChart />
            </AppCard>
            <AppCard className="p-6">
              <NestedPieChart />
            </AppCard>
            <AppCard className="p-6">
              <GradientPieChart />
            </AppCard>
            <AppCard className="p-6">
              <LabeledPieChart />
            </AppCard>
          </div>
        )
      case pageDict.barChart:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppCard className="p-6">
              <SimpleBarChart />
            </AppCard>
            <AppCard className="p-6">
              <HorizontalBarChart />
            </AppCard>
            <AppCard className="p-6">
              <StackedBarChart />
            </AppCard>
            <AppCard className="p-6">
              <BarChartWithLabel />
            </AppCard>
            <AppCard className="p-6">
              <NegativeBarChart />
            </AppCard>
          </div>
        )
      case pageDict.abstractCharts:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AppCard className="p-6">
              <ExpenseBubbleChart />
            </AppCard>
            <AppCard className="p-6">
              <HorizontalBarChart />
            </AppCard>
          </div>
        )
      case pageDict.lineChart:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppCard className="p-6">
              <SimpleLineChart />
            </AppCard>
            <AppCard className="p-6">
              <MultiLineChart />
            </AppCard>
          </div>
        )
      case pageDict.areaChart:
        return (
          <div className="flex justify-center">
            <AppCard className="p-6">
              <StackedAreaChart />
            </AppCard>
          </div>
        )
      case pageDict.radarChart:
        return (
          <div className="flex justify-center">
            <AppCard className="p-6">
              <SkillsRadarChart />
            </AppCard>
          </div>
        )
      case pageDict.radialBarChart:
        return (
          <div className="flex justify-center">
            <AppCard className="p-6">
              <ProgressRadialBarChart />
            </AppCard>
          </div>
        )
      case pageDict.advancedCharts || "高级图表":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppCard className="p-6">
              <FunnelChart />
            </AppCard>
            <AppCard className="p-6">
              <GaugeChart />
            </AppCard>
            <AppCard className="p-6">
              <HeatmapChart />
            </AppCard>
            <AppCard className="p-6">
              <TreemapChart />
            </AppCard>
          </div>
        )
      case pageDict.scatterChart || "散点图":
        return (
          <div className="flex justify-center">
            <AppCard className="p-6">
              <ScatterChart />
            </AppCard>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="w-full">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="animate-in fade-in duration-500">{renderContent()}</div>
    </div>
  )
}
