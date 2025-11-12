#!/bin/bash

# HTTPS 服务器启动脚本
# 用于在 PM2 中启动支持 HTTPS 的 Next.js 应用

cd "$(dirname "$0")/.."

# 设置环境变量
export NODE_ENV=production
export PORT=${PORT:-80}
export HTTPS_PORT=${HTTPS_PORT:-443}
export HOSTNAME=${HOSTNAME:-localhost}
export ENABLE_HTTP_REDIRECT=${ENABLE_HTTP_REDIRECT:-true}

# 检查证书是否存在
CERT_DIR="$(pwd)/certs"
if [ ! -f "$CERT_DIR/server.key" ] || [ ! -f "$CERT_DIR/server.crt" ]; then
    echo "❌ SSL 证书文件未找到！"
    echo "💡 正在自动生成证书..."
    sh scripts/generate-cert.sh
    if [ $? -ne 0 ]; then
        echo "❌ 证书生成失败，无法启动 HTTPS 服务器"
        exit 1
    fi
fi

# 启动 HTTPS 服务器
exec node server.js

