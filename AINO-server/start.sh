#!/bin/bash

echo "🚀 Starting AINO Server..."
echo "📊 Health check will be available at: http://47.94.52.142::3007/health"
echo "🌍 Press Ctrl+C to stop the server"
echo ""

# 启动服务器
npx tsx src/server.ts
