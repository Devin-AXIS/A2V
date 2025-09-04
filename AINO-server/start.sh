#!/bin/bash

echo "🚀 Starting AINO Server..."
echo "📊 Health check will be available at: http://localhost:3001/health"
echo "🌍 Press Ctrl+C to stop the server"
echo ""

# 启动服务器
npx tsx src/server.ts
