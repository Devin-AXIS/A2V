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
  
  // 解析城市条件
  const cityMatch = rule.match(/城市[=：:]\s*([^,，\s]+)/)
  if (cityMatch) {
    processedOptions.city = cityMatch[1]
    console.log('🏙️ 提取城市条件:', processedOptions.city)
  }
  
  // 解析岗位条件
  const roleMatch = rule.match(/岗位[=：:]\s*([^,，\s]+)/)
  if (roleMatch) {
    processedOptions.role = roleMatch[1]
    console.log('💼 提取岗位条件:', processedOptions.role)
  }
  
  // 解析薪资条件
  const salaryMatch = rule.match(/薪资[>大于]\s*(\d+)k?/)
  if (salaryMatch) {
    processedOptions.minSalary = parseInt(salaryMatch[1]) * 1000
    console.log('💰 提取薪资条件:', processedOptions.minSalary)
  }
  
  // 解析公司条件
  const companyMatch = rule.match(/公司[=：:]\s*([^,，\s]+)/)
  if (companyMatch) {
    processedOptions.company = companyMatch[1]
    console.log('🏢 提取公司条件:', processedOptions.company)
  }
  
  // 解析平台条件
  const platformMatch = rule.match(/(boss直聘|智联|拉勾|前程无忧|猎聘)/)
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
