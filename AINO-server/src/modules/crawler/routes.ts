import fetch from 'node-fetch'
import { Hono } from 'hono'
import { mockRequireAuthMiddleware } from "../../middleware/auth"

const crawlRoute = new Hono()

let cacheLinks, cacheJobTitles;

// 工具: 简单延时
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// 工具: 以超时包装 fetch
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 20000): Promise<Response> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const res = await fetch(url, { ...options, signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (AINO Crawler)', ...(options?.headers || {}) } })
        return res
    } finally {
        clearTimeout(id)
    }
}

// 解析列表页，返回职位详情页链接和职位名称
async function parseListPageForJobLinks(html: string): Promise<{ links: string[], jobTitles: string[] }> {
    const links = new Set<string>()
    const jobTitles = new Set<string>()

    // 提取类似 /job-titles/<uuid>/ 的详情链接和职位名称
    const regex = /<a[^>]*href=["'](\/job-titles\/[0-9a-fA-F-]+\/)["'][^>]*>([^<]+)<\/a>/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(html)) !== null) {
        const rawLink = match[1]
        const rawTitle = match[2]
        const cleanedLink = rawLink.replace(/['"]/g, '')
        let cleanedTitle = rawTitle.trim()

        // 清理职位名称，去掉常见的后缀
        cleanedTitle = cleanedTitle.replace(/\s*招聘.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*对比.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*详情.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*更多.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*查看.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*订阅.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*薪资.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*月薪.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*￥.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*\d+.*$/, '') // 去掉数字后缀
        cleanedTitle = cleanedTitle.trim()

        if (cleanedTitle && cleanedTitle.length > 1) {
            links.add(cleanedLink)
            jobTitles.add(cleanedTitle)
        }
    }
    cacheLinks = Array.from(links)
    cacheJobTitles = Array.from(jobTitles)

    // 也尝试匹配绝对链接
    const absRegex = /<a[^>]*href=["'](https?:\/\/www\.tanzhi\.cn\/job-titles\/[0-9a-fA-F-]+\/)["'][^>]*>([^<]+)<\/a>/g
    while ((match = absRegex.exec(html)) !== null) {
        const rawLink = match[1]
        const rawTitle = match[2]
        const cleanedLink = rawLink.replace(/['"]/g, '')
        let cleanedTitle = rawTitle.trim()

        // 清理职位名称，去掉常见的后缀
        cleanedTitle = cleanedTitle.replace(/\s*招聘.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*对比.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*详情.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*更多.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*查看.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*订阅.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*薪资.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*月薪.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*￥.*$/, '')
        cleanedTitle = cleanedTitle.replace(/\s*\d+.*$/, '') // 去掉数字后缀
        cleanedTitle = cleanedTitle.trim()

        if (cleanedTitle && cleanedTitle.length > 1) {
            links.add(cleanedLink)
            jobTitles.add(cleanedTitle)
        }
    }

    return {
        links: Array.from(links),
        jobTitles: Array.from(jobTitles)
    }
}

// 从详情页提取核心字段（尽量健壮，采用多种正则与简单文本清洗）
function extractTextBetween(html: string, startPattern: RegExp, endPattern: RegExp): string | null {
    const startMatch = startPattern.exec(html)
    if (!startMatch) return null
    const startIdx = startMatch.index + startMatch[0].length
    const rest = html.slice(startIdx)
    const endMatch = endPattern.exec(rest)
    const segment = endMatch ? rest.slice(0, endMatch.index) : rest
    return segment
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || null
}

// 提取数字，支持千、万、k等单位
function extractNumber(text: string): number | null {
    if (!text) return null
    const match = text.match(/(\d+(?:\.\d+)?)\s*(k|千|万)?/i)
    if (!match) return null
    let num = parseFloat(match[1])
    const unit = match[2]?.toLowerCase()
    if (unit === 'k' || unit === '千') num *= 1000
    if (unit === '万') num *= 10000
    return num
}

// 提取薪资数据
function extractSalaryData(html: string) {
    const salaryData: any = {}

    // 平均薪资 - 更精确的匹配
    const avgMatch = html.match(/平均月薪[\s\S]*?¥(\d+(?:,\d+)*)/i)
    if (avgMatch) salaryData.average = parseInt(avgMatch[1].replace(/,/g, ''))

    // 最高薪资 - 匹配"最高¥数字"格式
    const maxMatch = html.match(/最高¥(\d+(?:,\d+)*)/i)
    if (maxMatch) salaryData.highest = parseInt(maxMatch[1].replace(/,/g, ''))

    // 最低薪资 - 匹配"最低¥数字"格式
    const minMatch = html.match(/最低¥(\d+(?:,\d+)*)/i)
    if (minMatch) salaryData.lowest = parseInt(minMatch[1].replace(/,/g, ''))

    return salaryData
}

// 提取年限分布数据 - 改进去重逻辑
function extractExperienceDistribution(html: string) {
    const experienceData: any = {}
    const experienceMap = new Map()

    // 查找年限相关的数据
    const expMatch = html.match(/(\d+)\s*年.*?(\d+(?:\.\d+)?[k千万]?)/gi)
    if (expMatch) {
        expMatch.forEach(match => {
            const parts = match.match(/(\d+)\s*年.*?(\d+(?:\.\d+)?[k千万]?)/i)
            if (parts) {
                const years = parseInt(parts[1])
                const salary = extractNumber(parts[2])

                // 过滤掉不合理的年限（2025年工作经验确实不合理）
                if (years >= 1 && years <= 20) {
                    // 如果该年限已存在，保留薪资更高的
                    if (!experienceMap.has(years) || experienceMap.get(years).salary < salary) {
                        experienceMap.set(years, {
                            years,
                            salary
                        })
                    }
                }
            }
        })

        // 转换为数组并按年限排序
        experienceData.distribution = Array.from(experienceMap.values())
            .sort((a, b) => a.years - b.years)
    }

    return experienceData
}

// 提取学历分布数据 - 改进去重逻辑
function extractEducationDistribution(html: string) {
    const educationData: any = {}
    const educationMap = new Map()

    // 查找学历相关的数据
    const eduMatch = html.match(/(本科|硕士|博士|大专|高中|中专).*?(\d+(?:\.\d+)?[k千万]?)/gi)
    if (eduMatch) {
        eduMatch.forEach(match => {
            const parts = match.match(/(本科|硕士|博士|大专|高中|中专).*?(\d+(?:\.\d+)?[k千万]?)/i)
            if (parts) {
                const education = parts[1]
                const salary = extractNumber(parts[2])

                // 如果该学历已存在，保留薪资更高的
                if (!educationMap.has(education) || educationMap.get(education).salary < salary) {
                    educationMap.set(education, {
                        education,
                        salary
                    })
                }
            }
        })

        // 转换为数组并去重
        educationData.distribution = Array.from(educationMap.values())
    }

    return educationData
}

// 提取城市排名数据 - 改进匹配逻辑
function extractCityRanking(html: string) {
    const cityData: any = {}
    const cityRanking: any[] = []

    // 改进的薪资提取逻辑 - 多种模式匹配
    const patterns = [
        // 模式1: 城市名 + 4-6位数字 + /月
        /(深圳市|芜湖市|杭州市|北京市|珠海市|苏州市|南京市|东莞市|上海市|广州市|成都市|重庆市|天津市|武汉市|西安市|长沙市|青岛市|大连市|厦门市|福州市|济南市|郑州市|合肥市|石家庄市|太原市|呼和浩特市|沈阳市|长春市|哈尔滨市|南昌市|南宁市|海口市|贵阳市|昆明市|拉萨市|兰州市|西宁市|银川市|乌鲁木齐市)[\s\S]*?(\d{4,6})\s*\/月/gi,

        // 模式2: 城市名 + 3-6位数字（不带/月）
        /(深圳市|芜湖市|杭州市|北京市|珠海市|苏州市|南京市|东莞市|上海市|广州市|成都市|重庆市|天津市|武汉市|西安市|长沙市|青岛市|大连市|厦门市|福州市|济南市|郑州市|合肥市|石家庄市|太原市|呼和浩特市|沈阳市|长春市|哈尔滨市|南昌市|南宁市|海口市|贵阳市|昆明市|拉萨市|兰州市|西宁市|银川市|乌鲁木齐市)[\s\S]*?(\d{3,6})/gi,

        // 模式3: 城市名 + 薪资（更宽松）
        /(深圳市|芜湖市|杭州市|北京市|珠海市|苏州市|南京市|东莞市|上海市|广州市|成都市|重庆市|天津市|武汉市|西安市|长沙市|青岛市|大连市|厦门市|福州市|济南市|郑州市|合肥市|石家庄市|太原市|呼和浩特市|沈阳市|长春市|哈尔滨市|南昌市|南宁市|海口市|贵阳市|昆明市|拉萨市|兰州市|西宁市|银川市|乌鲁木齐市)[\s\S]*?(\d+(?:,\d+)*)/gi
    ]

    for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(html)) !== null) {
            const city = match[1]
            let salary = parseInt(match[2].replace(/,/g, ''))

            // 验证薪资是否合理
            if (salary >= 1000 && salary <= 100000) {
                // 避免重复添加
                if (!cityRanking.find(item => item.city === city)) {
                    cityRanking.push({
                        city,
                        avgSalary: salary,
                        jobCount: 0,
                        avgHousingPrice: 0,
                        competitivenessIndex: 0
                    })
                }
            }
        }
    }

    // 如果还是没找到足够的数据，尝试从城市列表部分提取
    if (cityRanking.length < 5) {
        const citySection = html.match(/招聘城市对比[\s\S]*?(?=<h\d|$)/i)
        if (citySection) {
            const cityMatches = citySection[0].match(/(深圳市|芜湖市|杭州市|北京市|珠海市|苏州市|南京市|东莞市|上海市|广州市|成都市|重庆市|天津市|武汉市|西安市|长沙市|青岛市|大连市|厦门市|福州市|济南市|郑州市|合肥市|石家庄市|太原市|呼和浩特市|沈阳市|长春市|哈尔滨市|南昌市|南宁市|海口市|贵阳市|昆明市|拉萨市|兰州市|西宁市|银川市|乌鲁木齐市)/gi)
            if (cityMatches) {
                cityMatches.forEach(city => {
                    if (!cityRanking.find(item => item.city === city)) {
                        cityRanking.push({
                            city,
                            avgSalary: 0,
                            jobCount: 0,
                            avgHousingPrice: 0,
                            competitivenessIndex: 0
                        })
                    }
                })
            }
        }
    }

    // 如果还是数据不够，尝试从页面中提取所有城市名称
    if (cityRanking.length < 5) {
        const allCities = html.match(/(深圳市|芜湖市|杭州市|北京市|珠海市|苏州市|南京市|东莞市|上海市|广州市|成都市|重庆市|天津市|武汉市|西安市|长沙市|青岛市|大连市|厦门市|福州市|济南市|郑州市|合肥市|石家庄市|太原市|呼和浩特市|沈阳市|长春市|哈尔滨市|南昌市|南宁市|海口市|贵阳市|昆明市|拉萨市|兰州市|西宁市|银川市|乌鲁木齐市)/gi)
        if (allCities) {
            allCities.forEach(city => {
                if (!cityRanking.find(item => item.city === city)) {
                    cityRanking.push({
                        city,
                        avgSalary: 0,
                        jobCount: 0,
                        avgHousingPrice: 0,
                        competitivenessIndex: 0
                    })
                }
            })
        }
    }

    cityData.ranking = cityRanking
    return cityData
}

// 提取类似职位数据 - 改进提取逻辑，包含详细信息
async function extractSimilarJobs(html: string) {
    const similarJobs: any = {}
    const jobs: any[] = []

    // 从"与测试工程师相似名称"部分提取职位名称和链接
    const similarSection = html.match(/与.*?相似名称[\s\S]*?查看更多/i)
    if (similarSection) {
        // 提取职位名称和对应的链接
        const jobLinkPattern = /<a[^>]*href=["'](\/job-titles\/[^"']*)["'][^>]*>([^<]+)<\/a>/gi
        let linkMatch
        while ((linkMatch = jobLinkPattern.exec(similarSection[0])) !== null) {
            const url = linkMatch[1]
            let title = linkMatch[2].trim()

            // 清理职位名称，只保留职位名
            if (title) {
                // 去掉常见的后缀
                title = title.replace(/\s*招聘.*$/, '')
                title = title.replace(/\s*对比.*$/, '')
                title = title.replace(/\s*详情.*$/, '')
                title = title.replace(/\s*更多.*$/, '')
                title = title.replace(/\s*查看.*$/, '')
                title = title.replace(/\s*订阅.*$/, '')
                title = title.replace(/\s*薪资.*$/, '')
                title = title.replace(/\s*月薪.*$/, '')
                title = title.replace(/\s*￥.*$/, '')
                title = title.replace(/\s*\d+.*$/, '') // 去掉数字后缀
                title = title.trim()

                if (title && title.length > 1) {
                    const fullUrl = url.startsWith('http') ? url : `https://www.tanzhi.cn${url}`

                    // 抓取该职位的详细信息
                    try {
                        const jobDetails = await fetchSimilarJobDetails(fullUrl)
                        jobs.push({
                            title,
                            url: fullUrl,
                            ...jobDetails
                        })
                    } catch (error) {
                        // 如果抓取失败，至少保留基本信息
                        jobs.push({
                            title,
                            url: fullUrl,
                            averageSalary: null,
                            education: null,
                            location: null,
                            experience: null
                        })
                    }
                }
            }
        }
    }

    // 如果上面没找到，尝试从页面其他地方的链接中提取
    if (jobs.length === 0) {
        const allJobLinks = html.match(/<a[^>]*href=["']\/job-titles\/[^"']*["'][^>]*>([^<]+)<\/a>/gi)
        if (allJobLinks) {
            for (const link of allJobLinks) {
                const titleMatch = link.match(/<a[^>]*href=["'](\/job-titles\/[^"']*)["'][^>]*>([^<]+)<\/a>/i)
                if (titleMatch) {
                    const url = titleMatch[1]
                    let title = titleMatch[2].trim()

                    // 清理职位名称，只保留职位名
                    if (title) {
                        // 去掉常见的后缀
                        title = title.replace(/\s*招聘.*$/, '')
                        title = title.replace(/\s*对比.*$/, '')
                        title = title.replace(/\s*详情.*$/, '')
                        title = title.replace(/\s*更多.*$/, '')
                        title = title.replace(/\s*查看.*$/, '')
                        title = title.replace(/\s*订阅.*$/, '')
                        title = title.replace(/\s*薪资.*$/, '')
                        title = title.replace(/\s*月薪.*$/, '')
                        title = title.replace(/\s*￥.*$/, '')
                        title = title.replace(/\s*\d+.*$/, '') // 去掉数字后缀
                        title = title.trim()

                        // 过滤掉一些明显不是职位的链接
                        if (title && title.length > 1 &&
                            !title.includes('查看更多') &&
                            !title.includes('招聘') &&
                            !title.includes('对比') &&
                            !title.includes('订阅')) {

                            const fullUrl = url.startsWith('http') ? url : `https://www.tanzhi.cn${url}`

                            // 抓取该职位的详细信息
                            try {
                                const jobDetails = await fetchSimilarJobDetails(fullUrl)
                                jobs.push({
                                    title,
                                    url: fullUrl,
                                    ...jobDetails
                                })
                            } catch (error) {
                                // 如果抓取失败，至少保留基本信息
                                jobs.push({
                                    title,
                                    url: fullUrl,
                                    averageSalary: null,
                                    education: null,
                                    location: null,
                                    experience: null
                                })
                            }
                        }
                    }
                }
            }
        }
    }

    // 去重
    const uniqueJobs = jobs.filter((job, index, self) =>
        index === self.findIndex(j => j.title === job.title)
    )

    similarJobs.jobs = uniqueJobs.slice(0, 10) // 最多返回10个
    return similarJobs
}

// 抓取相似职位的详细信息
async function fetchSimilarJobDetails(url: string) {
    try {
        const res = await fetchWithTimeout(url, { method: 'GET' }, 15000)
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }
        const html = await res.text()

        // 提取平均薪资
        const avgSalaryMatch = html.match(/平均月薪[\s\S]*?¥(\d+(?:,\d+)*)/i)
        const averageSalary = avgSalaryMatch ? parseInt(avgSalaryMatch[1].replace(/,/g, '')) : null

        // 提取学历要求 - 从学历分布中获取最常见的学历
        const educationData = extractEducationDistribution(html)
        const education = educationData.distribution && educationData.distribution.length > 0
            ? educationData.distribution[0].education
            : null

        // 提取工作地点 - 从城市排名中获取主要城市
        const cityData = extractCityRanking(html)
        const location = cityData.ranking && cityData.ranking.length > 0
            ? cityData.ranking[0].city
            : null

        // 提取经验要求 - 从年限分布中获取最常见的年限
        const experienceData = extractExperienceDistribution(html)
        const experience = experienceData.distribution && experienceData.distribution.length > 0
            ? `${experienceData.distribution[0].years}年`
            : null

        return {
            averageSalary,
            education,
            location,
            experience
        }
    } catch (error) {
        console.error(`Failed to fetch details for ${url}:`, error)
        return {
            averageSalary: null,
            education: null,
            location: null,
            experience: null
        }
    }
}

// 提取新增职位趋势数据 - 改进匹配逻辑
function extractNewJobsTrend(html: string) {
    const trendData: any = {}

    // 提取每月新增职位数据 - 改进去重逻辑
    const monthlyData = []
    const monthMap = new Map()

    // 尝试多种匹配模式
    const patterns = [
        /(\d{4}年\d{1,2}月)新增(\d+)个职位/gi,
        /(\d{4}-\d{1,2})新增(\d+)个职位/gi,
        /(\d{1,2}月)新增(\d+)个职位/gi,
        /(\d{4}年\d{1,2}月).*?(\d+)个职位/gi
    ]

    for (const pattern of patterns) {
        let monthMatch
        while ((monthMatch = pattern.exec(html)) !== null) {
            const month = monthMatch[1]
            const count = parseInt(monthMatch[2])

            // 避免重复添加，如果已存在则保留更大的数值
            if (!monthMap.has(month) || monthMap.get(month) < count) {
                monthMap.set(month, count)
            }
        }
    }

    // 转换为数组，统一格式为只有月份，并去重
    const finalMonthMap = new Map()

    monthMap.forEach((count, month) => {
        // 统一格式：去掉年份，只保留月份
        let cleanMonth = month
        if (month.includes('年')) {
            // 2025年2月 -> 2月
            cleanMonth = month.replace(/\d{4}年/, '')
        } else if (month.includes('-')) {
            // 2025-02 -> 2月
            const monthNum = month.split('-')[1]
            cleanMonth = `${parseInt(monthNum)}月`
        } else if (!month.includes('月')) {
            // 2 -> 2月
            cleanMonth = `${month}月`
        }

        // 去重：如果已存在，保留更大的数值
        if (!finalMonthMap.has(cleanMonth) || finalMonthMap.get(cleanMonth) < count) {
            finalMonthMap.set(cleanMonth, count)
        }
    })

    // 转换为数组
    finalMonthMap.forEach((count, month) => {
        monthlyData.push({ month, count })
    })

    // 如果还是没找到，尝试从文本中提取具体数据
    if (monthlyData.length === 0) {
        // 尝试匹配具体的文本描述
        const textMatch = html.match(/2025年2月新增(\d+)个职位.*?3月新增(\d+)个职位.*?4月新增(\d+)个职位.*?5月新增(\d+)个职位.*?6月新增(\d+)个职位.*?7月新增(\d+)个职位.*?8月新增(\d+)个职位/i)
        if (textMatch) {
            const months = ['2月', '3月', '4月', '5月', '6月', '7月', '8月']
            const counts = [textMatch[1], textMatch[2], textMatch[3], textMatch[4], textMatch[5], textMatch[6], textMatch[7]]
            months.forEach((month, index) => {
                monthlyData.push({ month, count: parseInt(counts[index]) })
            })
        } else {
            // 尝试更宽松的匹配，分别匹配每个月份
            const monthPatterns = [
                { month: '2月', pattern: /2025年2月新增(\d+)个职位/i },
                { month: '3月', pattern: /2025年3月新增(\d+)个职位/i },
                { month: '4月', pattern: /2025年4月新增(\d+)个职位/i },
                { month: '5月', pattern: /2025年5月新增(\d+)个职位/i },
                { month: '6月', pattern: /2025年6月新增(\d+)个职位/i },
                { month: '7月', pattern: /2025年7月新增(\d+)个职位/i },
                { month: '8月', pattern: /2025年8月新增(\d+)个职位/i }
            ]

            monthPatterns.forEach(({ month, pattern }) => {
                const match = html.match(pattern)
                if (match) {
                    monthlyData.push({ month, count: parseInt(match[1]) })
                }
            })
        }
    }

    // 提取当前月份数据
    const currentMonthMatch = html.match(/(\d{4}年\d{1,2}月)新增(\d+)个职位.*?排名第(\d+)/i)
    if (currentMonthMatch) {
        // 统一格式：去掉年份，只保留月份
        let cleanMonth = currentMonthMatch[1].replace(/\d{4}年/, '')
        trendData.currentMonth = {
            month: cleanMonth,
            count: parseInt(currentMonthMatch[2]),
            rank: parseInt(currentMonthMatch[3])
        }
    }

    // 提取就业前景描述
    const outlookMatch = html.match(/预计该职位在未来将处于(强需求|中等需求|弱需求)状态/i)
    if (outlookMatch) {
        trendData.outlook = outlookMatch[1]
    }

    trendData.monthlyTrend = monthlyData
    return trendData
}

// 提取就业前景数据 - 改进匹配逻辑
function extractJobProspects(html: string) {
    const prospectsData: any = {}

    // 提取就业前景详细描述 - 从"测试工程师岗位的就业前景怎么样？"开始
    const descriptionMatch = html.match(/测试工程师岗位的就业前景怎么样\?[\s\S]*?测试工程师这一岗位未来的市场需求仍较大[\s\S]*?仅供参考[^。]*/i)
    if (descriptionMatch) {
        prospectsData.description = descriptionMatch[0]
            .replace(/<[^>]+>/g, ' ') // 移除HTML标签
            .replace(/\s+/g, ' ') // 合并多个空格
            .trim()
    }

    // 如果上面没匹配到，尝试更宽松的匹配
    if (!prospectsData.description) {
        const looseMatch = html.match(/测试工程师岗位的就业前景怎么样\?[\s\S]*?测试工程师[\s\S]*?岗位[\s\S]*?需求[\s\S]*?较大[\s\S]*?数据[\s\S]*?仅供参考/i)
        if (looseMatch) {
            prospectsData.description = looseMatch[0]
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
        }
    }

    // 提取当前月份新增职位信息
    const currentMonthMatch = html.match(/(\d{4}年\d{1,2}月)测试工程师新增(\d+)个岗位.*?排名第(\d+)名/i)
    if (currentMonthMatch) {
        prospectsData.currentMonth = {
            month: currentMonthMatch[1],
            count: parseInt(currentMonthMatch[2]),
            rank: parseInt(currentMonthMatch[3])
        }
    }

    // 提取就业前景预测
    const outlookMatch = html.match(/预计该职位在未来将处于(强需求|中等需求|弱需求)状态/i)
    if (outlookMatch) {
        prospectsData.outlook = outlookMatch[1]
    }

    // 提取职位增长比率数据 - 改进匹配
    const growthRateData = []
    const growthPattern = /(\d{1,2}月)[\s\S]*?(-?\d+(?:\.\d+)?)%/gi
    let growthMatch
    while ((growthMatch = growthPattern.exec(html)) !== null) {
        const month = growthMatch[1]
        const rate = parseFloat(growthMatch[2])
        growthRateData.push({
            month,
            rate
        })
    }

    prospectsData.growthRate = growthRateData
    return prospectsData
}

// 提取热招职位数据
function extractHotJobs(html: string) {
    const hotJobs: any = {}

    // 提取热招职位数量
    const countMatch = html.match(/(\d+)\+\s*岗位更新/i)
    if (countMatch) {
        hotJobs.count = parseInt(countMatch[1])
    }

    // 提取具体的热招职位列表
    const jobMatches = html.match(/##\s*([^#\n]+)\s*￥(\d+(?:,\d+)*)\/月/gi)
    if (jobMatches) {
        hotJobs.jobs = jobMatches.map(match => {
            const parts = match.match(/##\s*([^#\n]+)\s*￥(\d+(?:,\d+)*)\/月/i)
            return {
                title: parts ? parts[1].trim() : '',
                salary: parts ? parseInt(parts[2].replace(/,/g, '')) : 0
            }
        }).filter(job => job.title)
    }

    return hotJobs
}

// 提取职业介绍内容
function extractJobDescription(html: string): string | null {
    // 匹配class为mt-6 leading-6的div，并提取其中的p标签文字
    const descriptionRegex = /<div[^>]*class=["'][^"']*mt-6[^"']*leading-6[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/div>/i

    const match = html.match(descriptionRegex)
    if (match && match[1]) {
        // 清理提取到的文本
        let description = match[1]
            .replace(/<[^>]+>/g, ' ') // 移除HTML标签
            .replace(/&nbsp;/g, ' ') // 替换HTML实体
            .replace(/&amp;/g, '&') // 替换HTML实体
            .replace(/&lt;/g, '<') // 替换HTML实体
            .replace(/&gt;/g, '>') // 替换HTML实体
            .replace(/&quot;/g, '"') // 替换HTML实体
            .replace(/&#39;/g, "'") // 替换HTML实体
            .replace(/\s+/g, ' ') // 合并多个空格
            .trim()

        return description || null
    }

    // 如果上面的正则没匹配到，尝试更宽松的匹配
    const looseRegex = /<div[^>]*class=["'][^"']*mt-6[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/div>/i
    const looseMatch = html.match(looseRegex)
    if (looseMatch && looseMatch[1]) {
        let description = looseMatch[1]
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim()

        return description || null
    }

    return null
}

// 提取职业类型信息
function extractJobCategory(html: string, jobTitle: string): string | null {
    try {
        // 从页面中提取职业分类数据
        const categoryMatch = html.match(/hotJobsSalary.*?\[(.*?)\]/s)
        if (categoryMatch) {
            // 尝试解析JSON数据
            const jsonStr = '[' + categoryMatch[1] + ']'
            const categories = JSON.parse(jsonStr)

            // 遍历分类，查找匹配的职业类型
            for (const category of categories) {
                if (category.hot_job_titles && Array.isArray(category.hot_job_titles)) {
                    for (const title of category.hot_job_titles) {
                        // 检查职位名称是否包含在热门职位中
                        if (title.includes(jobTitle) || jobTitle.includes(title)) {
                            return category.name
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log('解析职业分类数据失败:', error)
    }

    // 如果无法从数据中提取，尝试基于职位名称推断类型
    return inferJobCategoryFromTitle(jobTitle)
}

// 基于职位名称推断职业类型
function inferJobCategoryFromTitle(jobTitle: string): string | null {
    const title = jobTitle.toLowerCase()

    // 技术类
    if (title.includes('工程师') || title.includes('开发') || title.includes('程序员') ||
        title.includes('算法') || title.includes('架构师') || title.includes('技术')) {
        return '技术'
    }

    // 产品类
    if (title.includes('产品经理') || title.includes('产品') || title.includes('pm')) {
        return '产品'
    }

    // 设计类
    if (title.includes('设计师') || title.includes('设计') || title.includes('ui') ||
        title.includes('ux') || title.includes('美工') || title.includes('原画')) {
        return '设计'
    }

    // 销售类
    if (title.includes('销售') || title.includes('商务') || title.includes('客户经理') ||
        title.includes('业务') || title.includes('推广')) {
        return '销售'
    }

    // 运营类
    if (title.includes('运营') || title.includes('推广') || title.includes('营销') ||
        title.includes('新媒体') || title.includes('内容')) {
        return '运营'
    }

    // 金融类
    if (title.includes('金融') || title.includes('投资') || title.includes('财务') ||
        title.includes('会计') || title.includes('审计')) {
        return '金融'
    }

    // 法律类
    if (title.includes('律师') || title.includes('法务') || title.includes('法律') ||
        title.includes('合规')) {
        return '法律'
    }

    // 教育培训类
    if (title.includes('老师') || title.includes('教师') || title.includes('培训') ||
        title.includes('教育') || title.includes('讲师')) {
        return '教育培训'
    }

    // 广告类
    if (title.includes('广告') || title.includes('创意') || title.includes('策划')) {
        return '广告'
    }

    // 建筑类
    if (title.includes('建筑') || title.includes('工程') || title.includes('施工') ||
        title.includes('监理')) {
        return '建筑'
    }

    // 传媒类
    if (title.includes('编辑') || title.includes('记者') || title.includes('媒体') ||
        title.includes('传媒') || title.includes('内容')) {
        return '传媒'
    }

    // 房地产类
    if (title.includes('房地产') || title.includes('地产') || title.includes('置业') ||
        title.includes('物业')) {
        return '房地产'
    }

    return "其它"
}

async function parseDetailPage(url: string, html: string) {

    // 职业名称: 优先从 <title> 或 H1/H2 中获取
    let title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || '')
        .replace(/\s+\|\s*谈职.*/g, '')
        .trim()
    if (!title) {
        title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() || html.match(/<h2[^>]*>([^<]+)<\/h2>/i)?.[1]?.trim() || ''
    }

    // 清理职位名称，只保留职位名
    if (title) {
        // 去掉常见的后缀
        title = title.replace(/\s*招聘.*$/, '')
        title = title.replace(/\s*对比.*$/, '')
        title = title.replace(/\s*详情.*$/, '')
        title = title.replace(/\s*更多.*$/, '')
        title = title.replace(/\s*查看.*$/, '')
        title = title.replace(/\s*订阅.*$/, '')
        title = title.replace(/\s*薪资.*$/, '')
        title = title.replace(/\s*月薪.*$/, '')
        title = title.replace(/\s*￥.*$/, '')
        title = title.replace(/\s*\d+.*$/, '') // 去掉数字后缀
        title = title.replace(/\s*工程师.*$/, '工程师') // 保留"工程师"后缀
        title = title.replace(/\s*师.*$/, '师') // 保留"师"后缀
        title = title.trim()
    }

    // 职业介绍: 优先从class为mt-6 leading-6的div中提取，然后从 meta description 或页面简介段落获取
    const jobDescription = extractJobDescription(html)
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() || null
    const intro = jobDescription || metaDesc || extractTextBetween(html, /<p[^>]*>/i, /<\/p>/i) || null

    // 职业类型: 从页面数据中提取或基于职位名称推断
    const jobCategory = extractJobCategory(html, title)

    // 薪资数据
    const salaryData = extractSalaryData(html)

    // 年限分布
    const experienceData = extractExperienceDistribution(html)

    // 月薪分布
    const salaryDistribution = extractSalaryData(html)

    // 不同年限收入相差
    const salaryDifference = experienceData.distribution ? {
        min: Math.min(...experienceData.distribution.map((item: any) => item.salary)),
        max: Math.max(...experienceData.distribution.map((item: any) => item.salary)),
        difference: 0
    } : null

    if (salaryDifference && salaryDifference.min && salaryDifference.max) {
        salaryDifference.difference = salaryDifference.max - salaryDifference.min
    }

    // 学历分布
    const educationData = extractEducationDistribution(html)

    // 就业前景相关数据 - 结构化图表数据
    const jobProspects = extractJobProspects(html)

    // 新增职位趋势数据 - 结构化图表数据
    const newJobsTrend = extractNewJobsTrend(html)

    // 热招职位数据
    const hotJobs = extractHotJobs(html)

    // 合并新增职位数据
    const newJobs = {
        count: newJobsTrend.currentMonth?.count || hotJobs.count || 0,
        currentMonth: newJobsTrend.currentMonth,
        monthlyTrend: newJobsTrend.monthlyTrend || [],
        outlook: newJobsTrend.outlook,
        hotJobs: hotJobs.jobs || []
    }

    // 不同年限工作机会占比 - 只保留前3个年限
    const workOpportunities = {
        distribution: experienceData.distribution ?
            experienceData.distribution
                .slice(0, 3) // 只取前3个
                .map((item: any) => ({
                    years: item.years,
                    percentage: Math.round((item.salary / (experienceData.distribution.reduce((sum: number, exp: any) => sum + exp.salary, 0) || 1)) * 100)
                })) : []
    }

    // 城市排名
    const cityRanking = extractCityRanking(html)

    // 类似职位
    const similarJobs = await extractSimilarJobs(html)

    const result = {
        url,
        // 基础信息
        title: title || null,
        description: intro,
        category: jobCategory, // 职业类型

        // 薪资相关
        salary: {
            average: salaryData.average,
            highest: salaryData.highest,
            lowest: salaryData.lowest,
            distribution: salaryDistribution
        },

        // 年限分布
        experienceDistribution: experienceData.distribution || [],

        // 月薪分布
        salaryDistribution: salaryDistribution,

        // 不同年限收入相差
        salaryDifference: salaryDifference,

        // 学历分布
        educationDistribution: educationData.distribution || [],

        // 就业前景
        jobProspects: jobProspects,

        // 新增职位
        newJobs: newJobs,

        // 工作机会占比
        workOpportunities: workOpportunities,

        // 城市排名
        cityRanking: cityRanking.ranking || [],

        // 类似职位
        similarJobs: similarJobs.jobs || []
    }

    return result
}

// 统一将相对链接转绝对
function toAbsoluteUrl(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http')) return pathOrUrl
    return `https://www.tanzhi.cn${pathOrUrl}`
}

// 即时抓取：GET /crawler/tanzhi/jobs
crawlRoute.get('/tanzhi/jobs', mockRequireAuthMiddleware, async (c) => {
    // 仅在内存中使用的临时集合，函数结束自然释放
    const visited = new Set<string>()
    const results: any[] = []
    // const jobTitle = c.req.query('jobTitle')

    try {
        const listUrl = 'https://www.tanzhi.cn/job-salary-insight/'
        let links, jobTitles, listHtml;
        if (cacheLinks && cacheJobTitles) {
            links = cacheLinks
            jobTitles = cacheJobTitles
        } else {
            const listRes = await fetchWithTimeout(listUrl, { method: 'GET' }, 20000)
            if (!listRes.ok) {
                return c.json({ success: false, error: `List page request failed: ${listRes.status}` }, 502)
            }
            listHtml = await listRes.text()
            const parsedPageJobLinks = await parseListPageForJobLinks(listHtml);
            links = parsedPageJobLinks.links
            jobTitles = parsedPageJobLinks.jobTitles
            cacheLinks = links
            cacheJobTitles = jobTitles
        }

        // 若列表页无直接链接，尝试从页面内"热门职位"等卡片中抓取
        if (links.length === 0) {
            const fallback = Array.from(new Set((listHtml.match(/job-titles\/[0-9a-fA-F-]+\//g) || []).map(x => `/${x.replace(/^\//, '')}`)))
            links.push(...fallback)
        }

        // 去重与最多抓取上限，避免过大压力
        const absoluteLinks = Array.from(new Set(links.map(toAbsoluteUrl)))
        // console.log('提取到的职位链接:', absoluteLinks)
        // console.log('提取到的职位名称:', jobTitles)

        // 并发抓取
        const MAX_CONCURRENCY = 5
        const RETRY = 2
        let idx = 0
        const workList = absoluteLinks.slice(0, 100);

        async function worker() {
            while (idx < workList.length) {
                const current = workList[idx++]
                if (visited.has(current)) continue
                visited.add(current)
                let attempt = 0
                while (attempt <= RETRY) {
                    try {
                        const res = await fetchWithTimeout(current, { method: 'GET' }, 20000)
                        if (!res.ok) throw new Error(`status ${res.status}`)
                        const html = await res.text()
                        const data = await parseDetailPage(current, html)
                        results.push(data)
                        break
                    } catch (e) {
                        attempt++
                        if (attempt > RETRY) {
                            // 失败则记录最小信息，继续其它任务
                            results.push({ url: current, error: (e as Error).message })
                            break
                        }
                        await delay(500 + attempt * 300)
                    }
                }
            }
        }

        const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, workList.length) }, () => worker())
        await Promise.all(workers)


        const datas = [];
        sortBySalaryAverage(results).forEach(item => {
            datas.push({
                "标题": item.title,
                "工作地点": item.cityRanking[0]?.city || '',
                "教育": item.educationDistribution[0]?.education || '',
                "经验": `${item.experienceDistribution[0]?.years}年` || '',
                "职位类型": item.category || '', // 职业类型
                "平均薪资": item.salary.average,
                "内页数据": JSON.stringify(item),
            })
        })

        // 返回结构化数据，并且不做任何持久化；函数返回后局部变量会被释放
        return c.json({
            success: true,
            count: datas.length,
            data: datas,
        })
    } catch (error) {
        console.log(23232323, error)
        return c.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, 500)
    }
})

// 根据薪资平均值排序数组的函数
function sortBySalaryAverage<T extends { salary: { average: number } }>(arr: T[]): T[] {
    return arr.sort((a, b) => {
        const salaryA = a.salary?.average || 0;
        const salaryB = b.salary?.average || 0;
        return salaryB - salaryA; // 降序排列，薪资高的在前
    });
}

export default crawlRoute;