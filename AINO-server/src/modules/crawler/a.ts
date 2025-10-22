function generateZhipinJobData(): any[] {
    const jobCategories = [
        // 互联网/AI类
        {
            category: '技术', jobs: [
                { title: 'Java开发工程师', avgSalary: 15000, education: '本科', experience: 3, city: '北京市' },
                { title: '前端开发工程师', avgSalary: 12000, education: '本科', experience: 2, city: '北京市' },
                { title: '算法工程师', avgSalary: 25000, education: '硕士', experience: 5, city: '北京市' },
                { title: '测试工程师', avgSalary: 10000, education: '本科', experience: 2, city: '北京市' },
                { title: '运维工程师', avgSalary: 13000, education: '本科', experience: 3, city: '北京市' },
                { title: '网络工程师', avgSalary: 11000, education: '本科', experience: 2, city: '北京市' },
                { title: 'IT技术支持', avgSalary: 8000, education: '大专', experience: 1, city: '北京市' },
                { title: '实施工程师', avgSalary: 9000, education: '本科', experience: 2, city: '北京市' },
                { title: '技术合伙人', avgSalary: 35000, education: '硕士', experience: 8, city: '北京市' },
                { title: '硬件工程师', avgSalary: 14000, education: '本科', experience: 3, city: '北京市' },
                { title: '嵌入式软件工程师', avgSalary: 16000, education: '本科', experience: 4, city: '北京市' }
            ]
        },
        // 产品类
        {
            category: '产品', jobs: [
                { title: '产品经理', avgSalary: 18000, education: '本科', experience: 4, city: '北京市' },
                { title: '产品专员', avgSalary: 10000, education: '本科', experience: 2, city: '北京市' },
                { title: '高级产品管理岗', avgSalary: 25000, education: '硕士', experience: 6, city: '北京市' },
                { title: '用户研究', avgSalary: 12000, education: '本科', experience: 3, city: '北京市' },
                { title: 'AI产品经理', avgSalary: 22000, education: '硕士', experience: 5, city: '北京市' }
            ]
        },
        // 运营类
        {
            category: '运营', jobs: [
                { title: '客服专员', avgSalary: 6000, education: '大专', experience: 1, city: '北京市' },
                { title: '客服主管', avgSalary: 8000, education: '本科', experience: 3, city: '北京市' },
                { title: '客服经理', avgSalary: 12000, education: '本科', experience: 5, city: '北京市' },
                { title: '新媒体运营', avgSalary: 8000, education: '本科', experience: 2, city: '北京市' },
                { title: '直播运营', avgSalary: 9000, education: '本科', experience: 2, city: '北京市' },
                { title: '内容运营', avgSalary: 8500, education: '本科', experience: 2, city: '北京市' },
                { title: '电商运营', avgSalary: 10000, education: '本科', experience: 3, city: '北京市' },
                { title: '产品运营', avgSalary: 11000, education: '本科', experience: 3, city: '北京市' },
                { title: '用户运营', avgSalary: 12000, education: '本科', experience: 4, city: '北京市' }
            ]
        },
        // 设计类
        {
            category: '设计', jobs: [
                { title: 'UI设计师', avgSalary: 12000, education: '本科', experience: 3, city: '北京市' },
                { title: 'UX设计师', avgSalary: 15000, education: '本科', experience: 4, city: '北京市' },
                { title: '平面设计师', avgSalary: 8000, education: '大专', experience: 2, city: '北京市' },
                { title: '交互设计师', avgSalary: 14000, education: '本科', experience: 3, city: '北京市' }
            ]
        },
        // 销售类
        {
            category: '销售', jobs: [
                { title: '销售经理', avgSalary: 15000, education: '本科', experience: 4, city: '北京市' },
                { title: '商务经理', avgSalary: 13000, education: '本科', experience: 3, city: '北京市' },
                { title: '客户经理', avgSalary: 12000, education: '本科', experience: 3, city: '北京市' },
                { title: '业务经理', avgSalary: 14000, education: '本科', experience: 4, city: '北京市' }
            ]
        }
    ]

    const results: any[] = []

    jobCategories.forEach(categoryData => {
        categoryData.jobs.forEach(job => {
            // 生成完整的职位数据结构，匹配原有格式
            const jobData = {
                url: `https://www.zhipin.com/job-detail/${Math.random().toString(36).substr(2, 9)}.html`,
                title: job.title,
                description: `${job.title}是当前市场需求较大的职位，主要负责相关技术开发、产品设计、运营推广等工作。`,
                category: categoryData.category,

                // 薪资相关
                salary: {
                    average: job.avgSalary,
                    highest: Math.round(job.avgSalary * 1.5),
                    lowest: Math.round(job.avgSalary * 0.7),
                    distribution: {
                        average: job.avgSalary,
                        highest: Math.round(job.avgSalary * 1.5),
                        lowest: Math.round(job.avgSalary * 0.7)
                    }
                },

                // 年限分布
                experienceDistribution: [
                    { years: 1, salary: Math.round(job.avgSalary * 0.6) },
                    { years: 2, salary: Math.round(job.avgSalary * 0.8) },
                    { years: 3, salary: job.avgSalary },
                    { years: 5, salary: Math.round(job.avgSalary * 1.3) },
                    { years: 8, salary: Math.round(job.avgSalary * 1.8) }
                ],

                // 月薪分布
                salaryDistribution: {
                    average: job.avgSalary,
                    highest: Math.round(job.avgSalary * 1.5),
                    lowest: Math.round(job.avgSalary * 0.7)
                },

                // 不同年限收入相差
                salaryDifference: {
                    min: Math.round(job.avgSalary * 0.6),
                    max: Math.round(job.avgSalary * 1.8),
                    difference: Math.round(job.avgSalary * 1.2)
                },

                // 学历分布
                educationDistribution: [
                    { education: '大专', salary: Math.round(job.avgSalary * 0.8) },
                    { education: '本科', salary: job.avgSalary },
                    { education: '硕士', salary: Math.round(job.avgSalary * 1.3) },
                    { education: '博士', salary: Math.round(job.avgSalary * 1.6) }
                ],

                // 就业前景
                jobProspects: {
                    description: `${job.title}岗位的就业前景良好，市场需求持续增长，薪资水平稳步上升。`,
                    currentMonth: {
                        month: '2025年1月',
                        count: Math.floor(Math.random() * 100) + 50,
                        rank: Math.floor(Math.random() * 20) + 1
                    },
                    outlook: '强需求',
                    growthRate: [
                        { month: '1月', rate: 5.2 },
                        { month: '2月', rate: 3.8 },
                        { month: '3月', rate: 7.1 },
                        { month: '4月', rate: 4.5 }
                    ]
                },

                // 新增职位
                newJobs: {
                    count: Math.floor(Math.random() * 200) + 100,
                    currentMonth: {
                        month: '1月',
                        count: Math.floor(Math.random() * 50) + 20,
                        rank: Math.floor(Math.random() * 15) + 1
                    },
                    monthlyTrend: [
                        { month: '1月', count: Math.floor(Math.random() * 30) + 10 },
                        { month: '2月', count: Math.floor(Math.random() * 30) + 10 },
                        { month: '3月', count: Math.floor(Math.random() * 30) + 10 },
                        { month: '4月', count: Math.floor(Math.random() * 30) + 10 }
                    ],
                    outlook: '强需求',
                    hotJobs: [
                        { title: '高级' + job.title, salary: Math.round(job.avgSalary * 1.5) },
                        { title: '资深' + job.title, salary: Math.round(job.avgSalary * 1.8) }
                    ]
                },

                // 工作机会占比
                workOpportunities: {
                    distribution: [
                        { years: 1, percentage: 15 },
                        { years: 3, percentage: 35 },
                        { years: 5, percentage: 30 }
                    ]
                },

                // 城市排名
                cityRanking: [
                    { city: job.city, avgSalary: job.avgSalary, jobCount: Math.floor(Math.random() * 1000) + 500, avgHousingPrice: 50000, competitivenessIndex: 85 },
                    { city: '上海市', avgSalary: Math.round(job.avgSalary * 1.1), jobCount: Math.floor(Math.random() * 800) + 400, avgHousingPrice: 60000, competitivenessIndex: 90 },
                    { city: '深圳市', avgSalary: Math.round(job.avgSalary * 1.2), jobCount: Math.floor(Math.random() * 600) + 300, avgHousingPrice: 55000, competitivenessIndex: 88 },
                    { city: '杭州市', avgSalary: Math.round(job.avgSalary * 0.9), jobCount: Math.floor(Math.random() * 400) + 200, avgHousingPrice: 35000, competitivenessIndex: 75 }
                ],

                // 类似职位
                similarJobs: [
                    { title: '高级' + job.title, url: `https://www.zhipin.com/job-detail/${Math.random().toString(36).substr(2, 9)}.html`, averageSalary: Math.round(job.avgSalary * 1.3), education: job.education, location: job.city, experience: `${job.experience + 2}年` },
                    { title: '资深' + job.title, url: `https://www.zhipin.com/job-detail/${Math.random().toString(36).substr(2, 9)}.html`, averageSalary: Math.round(job.avgSalary * 1.5), education: job.education, location: job.city, experience: `${job.experience + 3}年` },
                    { title: '主管' + job.title, url: `https://www.zhipin.com/job-detail/${Math.random().toString(36).substr(2, 9)}.html`, averageSalary: Math.round(job.avgSalary * 1.4), education: job.education, location: job.city, experience: `${job.experience + 2}年` }
                ]
            }

            results.push(jobData)
        })
    })

    return results
}