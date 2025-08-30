import { serve } from '@hono/node-server'
import app from './app'
import { env } from './env'

serve({ 
  fetch: app.fetch, 
  port: env.PORT 
}, () => {
  console.log(`🚀 AINO Server running at http://localhost:${env.PORT}`)
  console.log(`📊 Health check: http://localhost:${env.PORT}/health`)
  console.log(`🌍 Environment: ${env.NODE_ENV}`)
})
