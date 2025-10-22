"use client"

import { http } from "@/lib/request"
import { useState, use, useEffect } from "react"
import { SecondaryPillBottomNav, type SecondaryPillBottomNavAction } from "@/components/navigation/secondary-pill-bottom-nav"
import { Bot } from "lucide-react"
import { usePageActions } from "@/hooks/use-page-actions"
import { AppCard } from "@/components/layout/app-card"
import { PillNavigation } from "@/components/navigation/pill-navigation"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import type { Locale } from "@/lib/dictionaries"
import { CardPackageManager } from "@/components/card/package/runtime/card-package-manager"
import { CardRegistry } from "@/components/card/core/registry"
import { LocalThemeKeyProvider } from "@/components/providers/local-theme-key"
import { getInsidePageDatas, insidePageCardDataHandles, insidePageArrayCardDatas } from "@/components/card/core/insidePageHandles"

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; cardName: string; id: string }>
}) {
  const { locale, cardName, id } = use(params)
  const [activeTab, setActiveTab] = useState("职业数据")
  const tabs = ["职业数据", "具备能力", "相关岗位"]
  const [dirs, setDirs] = useState<any>([]);
  const [cardDatas, setCardDatas] = useState<any>({});
  const [currentDir, setCurrentDir] = useState<any>(null);
  const [allJobs, setAllJobs] = useState<any>([]);
  const qs = new URLSearchParams(window.location.search)
  const jobType = qs.get('jobType')

  const getDirData = async () => {
    const currentDir = await http.get(`/api/directories/${id}`)
    const { data } = await http.get(`/api/directories?moduleId=${currentDir.data.moduleId}`)
    let relatedJobsListDir = data.directories.find(dir => dir.config?.moduleKey === "recSub-related-jobs-list");
    if (relatedJobsListDir) {
      const { data: records } = await http.get(`/api/records/${relatedJobsListDir.id}?limit=100`)
      const titleKey = relatedJobsListDir.config?.fields?.find(field => field.label === "标题");
      const eduKey = relatedJobsListDir.config?.fields?.find(field => field.label === "教育");
      const expKey = relatedJobsListDir.config?.fields?.find(field => field.label === "经验");
      const hrefKey = relatedJobsListDir.config?.fields?.find(field => field.label === "链接");
      const localKey = relatedJobsListDir.config?.fields?.find(field => field.label === "工作地点");
      const typeKey = relatedJobsListDir.config?.fields?.find(field => field.label === "职位类型");
      const salaryKey = relatedJobsListDir.config?.fields?.find(field => field.label === "薪资");
      const companyKey = relatedJobsListDir.config?.fields?.find(field => field.label === "公司名");
      const companySizeKey = relatedJobsListDir.config?.fields?.find(field => field.label === "公司规模");
      const datas = [];
      records.forEach(record => {
        datas.push({
          title: record[titleKey?.key],
          edu: record[eduKey?.key] === '未指定' ? "不限" : record[eduKey?.key],
          exp: record[expKey?.key] === '未指定' ? "不限" : record[expKey?.key],
          href: record[hrefKey?.key] || "",
          local: record[localKey?.key] === '未指定' ? "全国" : record[localKey?.key],
          type: record[typeKey?.key] === '未指定' ? "其它" : record[typeKey?.key],
          salary: record[salaryKey?.key] === '未指定' ? "面谈" : record[salaryKey?.key],
          company: (record[companyKey?.key] === "未指定" || record[companyKey?.key] === "不限") ? "未知" : record[companyKey?.key],
          companySize: (record[companySizeKey?.key] === "未指定" || record[companySizeKey?.key] === "不限") ? "未知" : record[companySizeKey?.key],
        });
      });
      setAllJobs(datas)
    }
    setDirs(data.directories);
    setCurrentDir(currentDir.data);
  }

  const getCardDatas = async (dirs) => {
    if (!dirs || !dirs.length) return;
    const rid = qs.get('rid')
    const newCardDatas = {};
    const currentField = currentDir?.config?.fields?.find(field => field.label === "内页卡片数据");
    const titleField = currentDir?.config?.fields?.find(field => field.label === "标题");
    const { data: records } = await http.get(`/api/records/${id}?limit=100`)
    const insideData = await getInsidePageDatas(currentField?.key, id, rid, records, titleField?.key);
    setCardDatas(insideData);
  }

  const [isTesting, setIsTesting] = useState(false)

  // 使用通用页面操作Hook
  const { actions } = usePageActions({
    title: "人工智能训练师",
    customActions: [
      {
        label: "测试匹配度",
        onClick: () => {
          setIsTesting(true)
          setTimeout(() => {
            setIsTesting(false)
            alert("AI匹配度分析完成！匹配度：85%")
          }, 2000)
        },
        icon: <Bot className="w-4 h-4" />,
        variant: "primary",
        loading: isTesting
      }
    ]
  })

  // 获取卡片包信息
  const packageConfig = CardPackageManager.getPackageByMainCard(cardName)
  const subCards = CardPackageManager.getSubCardsByMainCard(cardName)

  useEffect(() => {
    getDirData();
  }, [id])

  useEffect(() => {
    getCardDatas(dirs)
  }, [dirs])

  // useEffect(() => {
  //   getInsideData();
  // }, [])

  // 根据卡片包系统动态渲染子卡片
  const renderTabContent = () => {
    switch (activeTab) {
      case "职业数据":
        return (
          <>
            {subCards
              .filter(card => card.category === 'data')
              .map(card => {
                const CardComponent = card.component
                let insideData = null;
                if (cardDatas[card.id] && insidePageCardDataHandles[card.id]) {
                  insideData = insidePageCardDataHandles[card.id](cardDatas[card.id])
                }
                return CardComponent ? (
                  <CardComponent insideData={insideData} key={card.id} data={{ id }} />
                ) : null
              })
            }
          </>
        )
      case "具备能力":
        return (
          <>
            {subCards
              .filter(card => card.category === 'ability')
              .map(card => {
                const CardComponent = card.component
                let insideData = null;
                if (cardDatas[card.id] && insidePageCardDataHandles[card.id]) {
                  insideData = insidePageCardDataHandles[card.id](cardDatas[card.id])
                }
                return CardComponent ? (
                  <CardComponent insideData={insideData} key={card.id} data={{ id }} />
                ) : null
              })
            }
          </>
        )
      case "相关岗位":
        return (
          <>
            {subCards
              .filter(card => card.category === 'related')
              .map(card => {
                if (card.id !== "related-jobs-list") return null
                const CardComponent = card.component
                const insideData = allJobs.filter(job => job.type === jobType);
                return CardComponent ? (
                  <CardComponent insideData={insideData} isRelatedJobsList={true} key={card.id} data={{ id }} />
                ) : null
              })
            }
          </>
        )
      default:
        return null
    }
  }

  // 获取主卡片组件（职位详情介绍）
  const MainCardComponent = CardRegistry.get('job-detail-intro')?.component

  const jobDetailIntroData = insidePageCardDataHandles['job-detail-intro'](cardDatas['job-detail-intro'])

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackground />
      <AppHeader title="职位详情" showBackButton={true} />
      <div className="pt-16 p-4 space-y-6">
        {/* 主卡片：职位详情介绍 */}
        {MainCardComponent && (
          <MainCardComponent insideData={jobDetailIntroData} className="p-6" data={{ id }} />
        )}

        <div className="px-4">
          <PillNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="justify-start" />
        </div>

        {/* 子卡片内容 */}
        {renderTabContent()}
      </div>

      {/* 辅助功能胶囊型底部导航 */}
      <SecondaryPillBottomNav
        actions={actions}
        position="center"
      />
    </div>
  )
}
