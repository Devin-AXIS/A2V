import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { mockRequireAuthMiddleware } from '../../middleware/auth'

// 自然语言规则处理函数
async function processNaturalLanguageRule(nlRule: string | undefined, baseOptions: any) {
  if (!nlRule || !nlRule.trim()) {
    return baseOptions
  }

  console.log('🔍 处理自然语言规则:', nlRule)
  
  // 解析自然语言规则，提取关键词和条件
  const rule = nlRule.toLowerCase().trim()
  
  // 初始化处理后的选项
  const processedOptions = { ...baseOptions }
  
  // 检查是否是通用数据采集需求
  const generalDataPatterns = [
    /我想要任何数据/,
    /我要所有数据/,
    /采集所有内容/,
    /获取全部信息/,
    /抓取所有数据/,
    /全部都要/,
    /不限制条件/,
    /无限制/,
    /随便什么都可以/,
    /都可以/,
    /全部/,
    /所有/,
    /任何/,
  ]
  
  const isGeneralRequest = generalDataPatterns.some(pattern => pattern.test(rule))
  
  if (isGeneralRequest) {
    console.log('🌐 检测到通用数据采集需求，不设置特定过滤条件')
    // 对于通用需求，不设置特定的过滤条件，让Firecrawl抓取所有内容
    processedOptions.generalDataCollection = true
    processedOptions.contentFilter = {
      include: ['所有内容', '全部信息'],
      exclude: []
    }
    console.log('✅ 自然语言规则处理完成 (通用采集):', processedOptions)
    return processedOptions
  }
  
  // 城市解析 - 支持多种表达方式
  const cityPatterns = [
    /城市[=：:]\s*([^,，\s]+)/,           // 城市=北京
    /只要\s*([^,，\s]+)区/,              // 只要海淀区
    /只要\s*([^,，\s]+)市/,              // 只要北京市
    /只要\s*([^,，\s]+)的/,              // 只要北京的
    /([^,，\s]+)区\s*的/,               // 海淀区的
    /([^,，\s]+)市\s*的/,               // 北京市的
    /在\s*([^,，\s]+)区/,               // 在海淀区
    /在\s*([^,，\s]+)市/,               // 在北京市
  ]
  
  for (const pattern of cityPatterns) {
    const match = rule.match(pattern)
    if (match) {
      processedOptions.city = match[1]
      console.log('🏙️ 提取城市条件:', processedOptions.city)
      break
    }
  }
  
  // 岗位解析 - 支持多种表达方式
  const rolePatterns = [
    /岗位[=：:]\s*([^,，\s]+)/,           // 岗位=前端
    /只要\s*([^,，\s]+)开发/,            // 只要前端开发
    /只要\s*([^,，\s]+)工程师/,          // 只要前端工程师
    /只要\s*([^,，\s]+)师/,              // 只要前端师
    /([^,，\s]+)开发\s*的/,              // 前端开发的
    /([^,，\s]+)工程师\s*的/,            // 前端工程师的
    /([^,，\s]+)师\s*的/,                // 前端师的
    /需要\s*([^,，\s]+)开发/,            // 需要前端开发
    /需要\s*([^,，\s]+)工程师/,          // 需要前端工程师
  ]
  
  for (const pattern of rolePatterns) {
    const match = rule.match(pattern)
    if (match) {
      processedOptions.role = match[1]
      console.log('💼 提取岗位条件:', processedOptions.role)
      break
    }
  }
  
  // 薪资解析 - 支持多种表达方式
  const salaryPatterns = [
    /薪资[>大于]\s*(\d+)k?/,             // 薪资>10k
    /薪资[>大于]\s*(\d+)/,               // 薪资>10000
    /(\d+)k\s*以上/,                     // 10k以上
    /(\d+)\s*以上/,                      // 10000以上
    /(\d+)\s*万\s*以上/,                 // 1万以上
    /超过\s*(\d+)k/,                     // 超过10k
    /超过\s*(\d+)/,                      // 超过10000
    /最低\s*(\d+)k/,                     // 最低10k
    /最低\s*(\d+)/,                      // 最低10000
  ]
  
  for (const pattern of salaryPatterns) {
    const match = rule.match(pattern)
    if (match) {
      let salary = parseInt(match[1])
      // 如果是万为单位，转换为千
      if (rule.includes('万')) {
        salary = salary * 10
      }
      // 如果数字小于100，认为是k为单位
      if (salary < 100) {
        salary = salary * 1000
      }
      processedOptions.minSalary = salary
      console.log('💰 提取薪资条件:', processedOptions.minSalary)
      break
    }
  }
  
  // 公司解析 - 支持多种表达方式
  const companyPatterns = [
    /公司[=：:]\s*([^,，\s]+)/,           // 公司=腾讯
    /只要\s*([^,，\s]+)公司/,            // 只要腾讯公司
    /只要\s*([^,，\s]+)的/,              // 只要腾讯的
    /([^,，\s]+)公司\s*的/,              // 腾讯公司的
    /([^,，\s]+)\s*的/,                  // 腾讯的
    /在\s*([^,，\s]+)公司/,              // 在腾讯公司
    /在\s*([^,，\s]+)工作/,              // 在腾讯工作
  ]
  
  for (const pattern of companyPatterns) {
    const match = rule.match(pattern)
    if (match) {
      processedOptions.company = match[1]
      console.log('🏢 提取公司条件:', processedOptions.company)
      break
    }
  }
  
  // 平台解析
  const platformMatch = rule.match(/(boss直聘|智联|拉勾|前程无忧|猎聘|boss|智联招聘|拉勾网|前程无忧网|猎聘网)/)
  if (platformMatch) {
    processedOptions.platform = platformMatch[1]
    console.log('🌐 提取平台条件:', processedOptions.platform)
  }
  
  // 生成搜索关键词
  const keywords = []
  if (processedOptions.role) keywords.push(processedOptions.role)
  if (processedOptions.city) keywords.push(processedOptions.city)
  if (processedOptions.company) keywords.push(processedOptions.company)
  
  if (keywords.length > 0) {
    processedOptions.searchKeywords = keywords.join(' ')
    console.log('🔍 生成搜索关键词:', processedOptions.searchKeywords)
  }
  
  // 设置内容过滤规则
  if (processedOptions.city || processedOptions.role || processedOptions.minSalary) {
    processedOptions.contentFilter = {
      include: [],
      exclude: []
    }
    
    if (processedOptions.city) {
      processedOptions.contentFilter.include.push(`城市:${processedOptions.city}`)
    }
    if (processedOptions.role) {
      processedOptions.contentFilter.include.push(`岗位:${processedOptions.role}`)
    }
    if (processedOptions.minSalary) {
      processedOptions.contentFilter.include.push(`薪资:${processedOptions.minSalary}+`)
    }
  }
  
  console.log('✅ 自然语言规则处理完成:', processedOptions)
  return processedOptions
}

const crawlRoute = new Hono()

// 请求验证模式
const scrapeRequestSchema = z.object({
  url: z.string().url(),
  domain: z.string().optional(),
  nlRule: z.string().optional(),
  options: z.object({
    formats: z.array(z.string()).optional(),
    onlyMainContent: z.boolean().optional(),
    includeHtml: z.boolean().optional(),
    includeMarkdown: z.boolean().optional(),
  }).optional()
})

const crawlStartRequestSchema = z.object({
  urls: z.array(z.string().url()),
  domain: z.string().optional(),
  nlRule: z.string().optional(),
  options: z.object({
    formats: z.array(z.string()).optional(),
    onlyMainContent: z.boolean().optional(),
    includeHtml: z.boolean().optional(),
    includeMarkdown: z.boolean().optional(),
  }).optional()
})

const batchStartRequestSchema = z.object({
  urls: z.array(z.string().url()),
  domain: z.string().optional(),
  nlRule: z.string().optional(),
  options: z.object({
    formats: z.array(z.string()).optional(),
    onlyMainContent: z.boolean().optional(),
    includeHtml: z.boolean().optional(),
    includeMarkdown: z.boolean().optional(),
  }).optional()
})

// 单页面抓取测试
crawlRoute.post('/scrape', mockRequireAuthMiddleware, zValidator('json', scrapeRequestSchema), async (c) => {
  try {
    const firecrawlKey = c.req.header('x-aino-firecrawl-key')
    if (!firecrawlKey) {
      return c.json({
        success: false,
        error: 'Firecrawl API Key not provided'
      }, 400)
    }

    const { url, domain, nlRule, options = {} } = c.req.valid('json')
    
    console.log('🔍 开始单页面抓取:', { url, domain, nlRule, options })
    
    // 处理自然语言规则
    const processedOptions = await processNaturalLanguageRule(nlRule, options)

    // 调用Firecrawl API
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: processedOptions.formats || ['markdown', 'html'],
        onlyMainContent: processedOptions.onlyMainContent || false,
        includeHtml: processedOptions.includeHtml || false,
        includeMarkdown: processedOptions.includeMarkdown || true,
        // 如果有内容过滤规则，使用Firecrawl的原生LLM提取功能
        ...(processedOptions.contentFilter && {
          jsonOptions: {
            prompt: `请从网页中提取以下信息：${processedOptions.contentFilter.include.join(', ')}。只返回符合条件的内容，以JSON格式返回。`
          }
        })
      })
    })

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.json().catch(() => ({}))
      console.error('❌ Firecrawl API错误:', errorData)
      return c.json({
        success: false,
        error: errorData.message || 'Firecrawl API request failed'
      }, firecrawlResponse.status)
    }

    const data = await firecrawlResponse.json()
    console.log('✅ 单页面抓取成功:', { url, dataKeys: Object.keys(data) })

    return c.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('❌ 单页面抓取失败:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

// 开始爬取任务
crawlRoute.post('/start', mockRequireAuthMiddleware, zValidator('json', crawlStartRequestSchema), async (c) => {
  try {
    const firecrawlKey = c.req.header('x-aino-firecrawl-key')
    if (!firecrawlKey) {
      return c.json({
        success: false,
        error: 'Firecrawl API Key not provided'
      }, 400)
    }

    const { urls, domain, nlRule, options = {} } = c.req.valid('json')
    
    console.log('🔍 开始爬取任务:', { urls: urls.length, domain, nlRule })
    
    // 处理自然语言规则
    const processedOptions = await processNaturalLanguageRule(nlRule, options)

    // 调用Firecrawl API开始爬取
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: urls[0], // Firecrawl目前只支持单个起始URL
        crawlerOptions: {
          includes: urls.length > 1 ? urls : undefined,
          limit: processedOptions.limit || 10, // 限制爬取数量
          maxDepth: 2,
          // 如果有搜索关键词，添加到爬取选项中
          ...(processedOptions.searchKeywords && {
            searchParams: {
              q: processedOptions.searchKeywords
            }
          })
        },
        pageOptions: {
          formats: processedOptions.formats || ['markdown', 'html'],
          onlyMainContent: processedOptions.onlyMainContent || false,
          includeHtml: processedOptions.includeHtml || false,
          includeMarkdown: processedOptions.includeMarkdown || true
        },
        // 如果有内容过滤规则，使用Firecrawl的原生LLM提取功能
        ...(processedOptions.contentFilter && {
          jsonOptions: {
            prompt: `请从网页中提取以下信息：${processedOptions.contentFilter.include.join(', ')}。只返回符合条件的内容，以JSON格式返回。`
          }
        })
      })
    })

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.json().catch(() => ({}))
      console.error('❌ Firecrawl爬取API错误:', errorData)
      return c.json({
        success: false,
        error: errorData.message || 'Firecrawl crawl request failed'
      }, firecrawlResponse.status)
    }

    const data = await firecrawlResponse.json()
    console.log('✅ 爬取任务启动成功:', { jobId: data.jobId })

    return c.json({
      success: true,
      data: {
        jobId: data.jobId,
        status: 'active'
      }
    })

  } catch (error) {
    console.error('❌ 爬取任务启动失败:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

// 查询爬取状态
crawlRoute.get('/status/:jobId', mockRequireAuthMiddleware, async (c) => {
  try {
    const firecrawlKey = c.req.header('x-aino-firecrawl-key')
    if (!firecrawlKey) {
      return c.json({
        success: false,
        error: 'Firecrawl API Key not provided'
      }, 400)
    }

    const jobId = c.req.param('jobId')
    console.log('🔍 查询爬取状态:', { jobId })

    // 调用Firecrawl API查询状态
    const firecrawlResponse = await fetch(`https://api.firecrawl.dev/v0/crawl/status/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.json().catch(() => ({}))
      console.error('❌ Firecrawl状态查询错误:', errorData)
      return c.json({
        success: false,
        error: errorData.message || 'Firecrawl status request failed'
      }, firecrawlResponse.status)
    }

    const data = await firecrawlResponse.json()
    console.log('✅ 爬取状态查询成功:', { jobId, status: data.status })

    return c.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('❌ 爬取状态查询失败:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

// 批量爬取开始
crawlRoute.post('/batch/start', mockRequireAuthMiddleware, zValidator('json', batchStartRequestSchema), async (c) => {
  try {
    const firecrawlKey = c.req.header('x-aino-firecrawl-key')
    if (!firecrawlKey) {
      return c.json({
        success: false,
        error: 'Firecrawl API Key not provided'
      }, 400)
    }

    const { urls, domain, nlRule, options = {} } = c.req.valid('json')
    
    console.log('🔍 开始批量爬取:', { urls: urls.length, domain, nlRule })
    
    // 处理自然语言规则
    const processedOptions = await processNaturalLanguageRule(nlRule, options)

    // 为每个URL启动单独的爬取任务
    const batchJobs = []
    for (const url of urls.slice(0, 5)) { // 限制最多5个并发任务
      try {
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/crawl', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            crawlerOptions: {
              limit: 1, // 每个URL只爬取1页
              maxDepth: 0,
              // 如果有搜索关键词，添加到爬取选项中
              ...(processedOptions.searchKeywords && {
                searchParams: {
                  q: processedOptions.searchKeywords
                }
              })
            },
            pageOptions: {
              formats: processedOptions.formats || ['markdown', 'html'],
              onlyMainContent: processedOptions.onlyMainContent || false,
              includeHtml: processedOptions.includeHtml || false,
              includeMarkdown: processedOptions.includeMarkdown || true
            },
            // 如果有内容过滤规则，使用Firecrawl的原生LLM提取功能
            ...(processedOptions.contentFilter && {
              jsonOptions: {
                prompt: `请从网页中提取以下信息：${processedOptions.contentFilter.include.join(', ')}。只返回符合条件的内容，以JSON格式返回。`
              }
            })
          })
        })

        if (firecrawlResponse.ok) {
          const data = await firecrawlResponse.json()
          batchJobs.push({
            url,
            jobId: data.jobId,
            status: 'active'
          })
        }
      } catch (error) {
        console.error(`❌ URL ${url} 爬取启动失败:`, error)
      }
    }

    console.log('✅ 批量爬取任务启动成功:', { batchJobs: batchJobs.length })

    return c.json({
      success: true,
      data: {
        batchId: `batch_${Date.now()}`,
        jobs: batchJobs,
        status: 'active'
      }
    })

  } catch (error) {
    console.error('❌ 批量爬取任务启动失败:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

// 批量爬取状态查询
crawlRoute.get('/batch/status/:batchId', mockRequireAuthMiddleware, async (c) => {
  try {
    const firecrawlKey = c.req.header('x-aino-firecrawl-key')
    if (!firecrawlKey) {
      return c.json({
        success: false,
        error: 'Firecrawl API Key not provided'
      }, 400)
    }

    const batchId = c.req.param('batchId')
    console.log('🔍 查询批量爬取状态:', { batchId })

    // 这里应该从数据库或缓存中获取批量任务的状态
    // 目前返回模拟状态
    return c.json({
      success: true,
      data: {
        batchId,
        status: 'completed',
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0
      }
    })

  } catch (error) {
    console.error('❌ 批量爬取状态查询失败:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

// 取消爬取任务
crawlRoute.post('/cancel/:jobId', mockRequireAuthMiddleware, async (c) => {
  try {
    const firecrawlKey = c.req.header('x-aino-firecrawl-key')
    if (!firecrawlKey) {
      return c.json({
        success: false,
        error: 'Firecrawl API Key not provided'
      }, 400)
    }

    const jobId = c.req.param('jobId')
    console.log('🔍 取消爬取任务:', { jobId })

    // 调用Firecrawl API取消任务
    const firecrawlResponse = await fetch(`https://api.firecrawl.dev/v0/crawl/cancel/${jobId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.json().catch(() => ({}))
      console.error('❌ Firecrawl取消任务错误:', errorData)
      return c.json({
        success: false,
        error: errorData.message || 'Firecrawl cancel request failed'
      }, firecrawlResponse.status)
    }

    const data = await firecrawlResponse.json()
    console.log('✅ 爬取任务取消成功:', { jobId })

    return c.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('❌ 爬取任务取消失败:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

export default crawlRoute
