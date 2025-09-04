"use client"

const companyData = [
  { name: "百度", count: 222, type: "搜索引擎" },
  { name: "腾讯", count: 33, type: "社交媒体" },
  { name: "阿里", count: 28, type: "电商平台" },
]

export function CompanyRankingList() {
  return (
    <div className="space-y-4">
      {companyData.map((company, index) => (
        <div key={company.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">{company.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="font-medium">{company.name}</div>
            <div className="text-xs text-muted-foreground">{company.type}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-primary">{company.count}</div>
            <div className="text-xs text-muted-foreground">个职位</div>
          </div>
        </div>
      ))}
    </div>
  )
}
