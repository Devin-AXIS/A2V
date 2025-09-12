import { serve } from '@hono/node-server'
import app from './app'
import { env } from './env'
import { initDatabase } from './db'

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 启动 AINO 服务器...')

    // 初始化数据库
    console.log('📊 检查数据库状态...')
    const dbInitSuccess = await initDatabase()
    if (!dbInitSuccess) {
      console.log('\n⚠️  数据库未初始化，请先运行初始化脚本:')
      console.log('   node scripts/init-database.js')
      console.log('   或者')
      console.log('   ./scripts/setup-database.sh')
      console.log('\n然后重新启动服务器。')
      // process.exit(1)
    }

    // 启动 HTTP 服务器
    serve({
      fetch: app.fetch,
      port: env.PORT
    }, () => {
      console.log(`🚀 AINO Server running at http://localhost:${env.PORT}`)
      console.log(`📊 Health check: http://localhost:${env.PORT}/health`)
      console.log(`🌍 Environment: ${env.NODE_ENV}`)
      console.log('✅ 服务器启动完成！')
    })

  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动服务器
startServer()
