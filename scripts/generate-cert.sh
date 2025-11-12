#!/bin/bash

# SSL 证书生成脚本
# 用于生成自签名证书（开发/测试环境）

set -e

echo "🔐 生成 SSL 证书..."

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# 创建证书目录
CERT_DIR="$PROJECT_DIR/certs"
mkdir -p "$CERT_DIR"

# 证书文件路径
KEY_FILE="$CERT_DIR/server.key"
CERT_FILE="$CERT_DIR/server.crt"

# 检查是否已存在证书
if [ -f "$KEY_FILE" ] && [ -f "$CERT_FILE" ]; then
    echo "⚠️  证书文件已存在"
    read -p "是否要重新生成？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ 跳过证书生成"
        exit 0
    fi
    rm -f "$KEY_FILE" "$CERT_FILE"
fi

# 获取主机名（从环境变量或使用默认值）
HOSTNAME="${HOSTNAME:-localhost}"
DOMAIN="${DOMAIN:-localhost}"

echo "📝 生成自签名证书..."
echo "   主机名: $HOSTNAME"
echo "   域名: $DOMAIN"

# 生成私钥和证书
openssl req -x509 -newkey rsa:4096 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -nodes \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=$DOMAIN" \
    -addext "subjectAltName=DNS:$DOMAIN,DNS:$HOSTNAME,DNS:*.localhost,IP:127.0.0.1,IP:::1"

# 设置权限
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo ""
echo "✅ 证书生成成功！"
echo "   📁 私钥: $KEY_FILE"
echo "   📁 证书: $CERT_FILE"
echo ""
echo "💡 提示:"
echo "   - 这是自签名证书，浏览器会显示安全警告"
echo "   - 生产环境请使用 Let's Encrypt 或其他 CA 签发的证书"
echo "   - 证书有效期为 365 天"
echo ""

