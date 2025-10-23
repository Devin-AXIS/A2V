import { serve } from '@hono/node-server'
import app from './app'
import { env } from './env'
import { initDatabase } from './db'
import { createServer } from 'net'

// 检查端口是否可用
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()

    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })

    server.on('error', () => {
      resolve(false)
    })
  })
}

// 查找可用端口
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i
    if (await isPortAvailable(port)) {
      return port
    }
  }
  throw new Error(`无法找到可用端口，尝试了 ${maxAttempts} 个端口`)
}

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 启动 AINO 服务器...')

    // 初始化数据库
    console.log('📊 检查数据库状态...')
    const dbInitSuccess = await initDatabase()
    if (!dbInitSuccess) {
      console.log('\n⚠️  数据库未初始化或初始化失败，请先运行初始化脚本:')
      console.log('   node scripts/init-database.js')
      console.log('   或者')
      console.log('   ./scripts/setup-database.sh')
      console.log('\n然后重新启动服务器。')
      process.exit(1)
    }

    // 检查端口可用性
    let port = env.PORT
    if (!(await isPortAvailable(port))) {
      console.log(`⚠️  端口 ${port} 被占用，正在查找可用端口...`)
      try {
        port = await findAvailablePort(port)
        console.log(`✅ 找到可用端口: ${port}`)
      } catch (error) {
        console.error('❌ 无法找到可用端口:', error)
        process.exit(1)
      }
    }

    // 启动 HTTP 服务器
    const server = serve({
      fetch: app.fetch,
      port: port
    }, () => {
      console.log(`🚀 AINO Server running at http://localhost:${port}`)
      console.log(`📊 Health check: http://localhost:${port}/health`)
      console.log(`🌍 Environment: ${env.NODE_ENV}`)
      console.log('✅ 服务器启动完成！')
    })

    // 处理服务器错误
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${port} 被占用，请检查是否有其他服务在使用此端口`)
        console.error('💡 解决方案:')
        console.error('   1. 停止占用端口的其他服务')
        console.error('   2. 或者修改环境变量 PORT 使用其他端口')
        console.error('   3. 或者等待几秒后重试')
      } else {
        console.error('❌ 服务器启动失败:', error)
      }
      process.exit(1)
    })

  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动服务器
startServer()
