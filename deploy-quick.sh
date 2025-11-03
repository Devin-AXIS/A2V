#!/bin/bash

# 快速部署脚本 - 无交互模式，使用默认配置

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "   快速部署 EncryptedTokenDistributor"
echo "=========================================="

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ 错误: .env 文件不存在${NC}"
    exit 1
fi

# 加载环境变量
export $(cat .env | grep -v '^#' | xargs)

# 检查必要的环境变量
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ 错误: DEPLOYER_PRIVATE_KEY 未设置${NC}"
    exit 1
fi

# 默认网络
NETWORK=${1:-base-sepolia}

echo "网络: $NETWORK"
echo ""

# 编译合约
echo "编译合约..."
pnpm run compile

# 部署合约
echo ""
echo "部署合约..."
if [ "$NETWORK" = "base" ]; then
    pnpm run deploy:encrypted-distributor:base
else
    pnpm run deploy:encrypted-distributor:base-sepolia
fi

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"

