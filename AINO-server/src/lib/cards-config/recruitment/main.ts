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
        dataConfig: [
            {
                key: "rankingData", type: "meta_items", label: "数据排名趋势图", child: [
                    { key: "name", type: "text", label: "职位名" },
                    { key: "ranl", type: "number", label: "排名" },
                ]
            },
            {
                key: "salaryDistribution", type: "meta_items", label: "职位类型标签", child: [
                    { key: "range", type: "text", label: "薪资范围" },
                    { key: "percentage", type: "number", label: "占比" },
                ]
            },
        ],
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
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "description", type: "text", label: "描述" },
            {
                key: "list", type: "meta_items", label: "数据", child: [
                    { key: "name", type: "text", label: "工作年限" },
                    { key: "value", type: "number", label: "占比" },
                    { key: "jobs", type: "number", label: "职位数" },
                ]
            },
        ],
        displayName: "工作年限占比分析",
        type: "chart",
        category: "data"
    },
    // {
    //     cardId: "job-prospect-trend",
    //     dataConfig: [],
    //     displayName: "就业前景趋势",
    //     type: "chart",
    //     category: "data"
    // },
    // {
    //     cardId: "monthly-job-growth",
    //     dataConfig: [],
    //     displayName: "月度职位增长",
    //     type: "chart",
    //     category: "data"
    // },
    {
        cardId: "job-city-ranking",
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
        displayName: "城市排名",
        type: "chart",
        category: "data"
    },
    // {
    //     cardId: "company-ranking",
    //     dataConfig: [
    //         { key: "title", type: "text", label: "标题" },
    //         { key: "description", type: "text", label: "描述" },
    //         {
    //             key: "data", type: "meta_items", label: "数据", child: [
    //                 { key: "label", type: "text", label: "标签" },
    //                 { key: "value", type: "text", label: "值" },
    //                 { key: "percentage", type: "number", label: "占比" },
    //             ]
    //         },
    //     ],
    //     displayName: "公司排名",
    //     type: "chart",
    //     category: "data"
    // },

    // 具备能力类子卡片
    {
        cardId: "ability-requirements-radar",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            {
                key: "chartData", type: "meta_items", label: "数据", child: [
                    { key: "subject", type: "text", label: "主题" },
                    { key: "value", type: "number", label: "值" },
                    { key: "fullMark", type: "number", label: "满分" },
                ]
            },
        ],
        displayName: "能力要求雷达图",
        type: "chart",
        category: "ability"
    },
    // {
    //     cardId: "core-skills-mastery",
    //     dataConfig: [],
    //     displayName: "核心技能掌握",
    //     type: "chart",
    //     category: "ability"
    // },
    // {
    //     cardId: "basic-ability-requirements",
    //     dataConfig: [],
    //     displayName: "基础能力要求",
    //     type: "list",
    //     category: "ability"
    // },
    // {
    //     cardId: "education-background",
    //     dataConfig: [],
    //     displayName: "教育背景分布",
    //     type: "chart",
    //     category: "ability"
    // },

    // 职业列表子卡片
    {
        cardId: "occupation-list",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "avgSalary", type: "text", label: "平均薪资" },
            { key: "location", type: "text", label: "工作地点" },
            { key: "education", type: "text", label: "教育" },
            { key: "experience", type: "text", label: "经验" },
            { key: "jobType", type: "text", label: "职位类型" },
            { key: "insideData", type: "text", label: "内页卡片数据" },
        ],
        displayName: "职业列表",
        type: "list",
        category: "related"
    },

    // 相关岗位类子卡片
    {
        cardId: "related-jobs-list",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "salary", type: "text", label: "薪资" },
            { key: "location", type: "text", label: "工作地点" },
            { key: "education", type: "text", label: "教育" },
            { key: "experience", type: "text", label: "经验" },
            { key: "jobType", type: "text", label: "职位类型" },
            { key: "href", type: "text", label: "链接" },
            { key: "company", type: "text", label: "公司名" },
            { key: "companySize", type: "text", label: "公司规模" },
        ],
        displayName: "相关岗位列表",
        type: "list",
        category: "related"
    },

    // 其他功能子卡片
    {
        cardId: "job-detail-intro",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "description", type: "text", label: "描述" },
            { key: "avgMonthlySalary", type: "text", label: "平均月薪" },
            { key: "dataSource", type: "text", label: "数据源" },
            { key: "link", type: "relation", label: "关联职位" },
            {
                key: "salaryDistribution", type: "meta_items", label: "薪资分布", child: [
                    { key: "range", type: "text", label: "薪资范围" },
                    { key: "percentage", type: "number", label: "占比" },
                ]
            },
        ],
        displayName: "职位详情介绍",
        type: "display",
        category: "info"
    },
    {
        cardId: "job-posting",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "company", type: "text", label: "公司" },
            { key: "location", type: "text", label: "工作地点" },
            { key: "salary", type: "text", label: "薪资" },
            { key: "experience", type: "text", label: "经验" },
            { key: "education", type: "text", label: "教育" },
            { key: "tags", type: "tags", label: "标签" },
            { key: "link", type: "relation", label: "关联职位" },
        ],
        displayName: "职位发布",
        type: "form",
        category: "action"
    },
    {
        cardId: "job-header",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "salary", type: "text", label: "薪资" },
            { key: "location_province", type: "text", label: "工作地点（省）" },
            { key: "location_city", type: "text", label: "工作地点（市）" },
            { key: "location_district", type: "text", label: "工作地点（区）" },
            { key: "education", type: "text", label: "教育" },
            { key: "experience", type: "text", label: "经验" },
            { key: "employmentType", type: "text", label: "就业类型" },
            { key: "link", type: "relation", label: "关联职位" },
        ],
        displayName: "职位头部",
        type: "display"
    },
    {
        cardId: "job-requirements",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "requirements", type: "tags", label: "要求" },
            { key: "link", type: "relation", label: "关联职位" },
        ],
        displayName: "职位要求",
        type: "display"
    },
    {
        cardId: "job-benefits",
        dataConfig: [
            { key: "title", type: "text", label: "标题" },
            { key: "benefits", type: "tags", label: "福利" },
            { key: "link", type: "relation", label: "关联职位" },
        ],
        displayName: "职位福利",
        type: "display"
    },
    {
        cardId: "company-info",
        dataConfig: [
            { key: "name", type: "text", label: "公司" },
            { key: "logo", type: "file", label: "logo" },
            { key: "description", type: "text", label: "描述" },
        ],
        displayName: "公司信息",
        type: "display"
    },
    {
        cardId: "apply-resume",
        dataConfig: [
            { key: "buttonText", type: "text", label: "按钮文本" },
            { key: "href", type: "text", label: "链接" },
            { key: "link", type: "relation", label: "关联职位" },
        ],
        displayName: "投递简历",
        type: "form"
    }
]