import { BaseType } from '../../../lib/cards-datetypes'

export const RecruitmentMainCard = [
    { key: "id", type: "text", label: "id" },
    { key: "title", type: "text", label: "职位名称" },
    { key: "salary", type: "text", label: "薪资" },
    { key: "location", type: "city", label: "工作地点" },
    { key: "demandGrowth", type: "text", label: "需求增长" },
    { key: "salaryGrowth", type: "tags", label: "薪资增长" },
]

export const RecruitmentSubCards = [
    // 职业数据类子卡片
    {
        cardId: "job-salary-overview",
        dataConfig: [],
        displayName: "薪资概览",
        type: "chart",
        category: "data"
    },
    {
        cardId: "education-salary-requirements",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "description", type: "text", label: "描述" },
            {
                key: "data", type: "meta_items", label: "数据", child: [
                    { key: "label", type: "text", label: "标签" },
                    { key: "value", type: "text", label: "值" },
                    { key: "percentage", type: "number", label: "占比" },
                ]
            },
        ],
        displayName: "学历收入要求",
        type: "list",
        category: "data"
    },
    {
        cardId: "job-experience-ratio",
        dataConfig: [],
        displayName: "工作年限占比分析",
        type: "chart",
        category: "data"
    },
    {
        cardId: "job-prospect-trend",
        dataConfig: [],
        displayName: "就业前景趋势",
        type: "chart",
        category: "data"
    },
    {
        cardId: "monthly-job-growth",
        dataConfig: [],
        displayName: "月度职位增长",
        type: "chart",
        category: "data"
    },
    {
        cardId: "job-city-ranking",
        dataConfig: [],
        displayName: "城市排名",
        type: "chart",
        category: "data"
    },
    {
        cardId: "company-ranking",
        dataConfig: [],
        displayName: "公司排名",
        type: "chart",
        category: "data"
    },

    // 具备能力类子卡片
    {
        cardId: "ability-requirements-radar",
        dataConfig: [],
        displayName: "能力要求雷达图",
        type: "chart",
        category: "ability"
    },
    {
        cardId: "core-skills-mastery",
        dataConfig: [],
        displayName: "核心技能掌握",
        type: "chart",
        category: "ability"
    },
    {
        cardId: "basic-ability-requirements",
        dataConfig: [],
        displayName: "基础能力要求",
        type: "list",
        category: "ability"
    },
    {
        cardId: "education-background",
        dataConfig: [],
        displayName: "教育背景分布",
        type: "chart",
        category: "ability"
    },

    // 相关岗位类子卡片
    {
        cardId: "related-jobs-list",
        dataConfig: [],
        displayName: "相关岗位列表",
        type: "list",
        category: "related"
    },

    // 其他功能子卡片
    {
        cardId: "job-detail-intro",
        dataConfig: [],
        displayName: "职位详情介绍",
        type: "display",
        category: "info"
    },
    {
        cardId: "job-posting",
        dataConfig: [],
        displayName: "职位发布",
        type: "form",
        category: "action"
    },
    {
        cardId: "job-header",
        dataConfig: [],
        displayName: "职位头部",
        type: "display"
    },
    {
        cardId: "job-requirements",
        dataConfig: [],
        displayName: "职位要求",
        type: "display"
    },
    {
        cardId: "job-benefits",
        dataConfig: [],
        displayName: "职位福利",
        type: "display"
    },
    {
        cardId: "company-info",
        dataConfig: [],
        displayName: "公司信息",
        type: "display"
    },
    {
        cardId: "apply-resume",
        dataConfig: [],
        displayName: "投递简历",
        type: "form"
    }
]