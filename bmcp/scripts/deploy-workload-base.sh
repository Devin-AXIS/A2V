#!/usr/bin/env bash
set -euo pipefail

# One-click deploy for bmcp/packages/workload-contracts to Base (Sepolia/Mainnet)
# Usage:
#   ./bmcp/scripts/deploy-workload-base.sh                # default baseSepolia
#   ./bmcp/scripts/deploy-workload-base.sh baseMainnet    # deploy to Base mainnet

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTRACTS_DIR="$REPO_ROOT/bmcp/packages/workload-contracts"
NETWORK="${1:-baseSepolia}"

if [ ! -d "$CONTRACTS_DIR" ]; then
  echo "❌ 未找到合约目录: $CONTRACTS_DIR" >&2
  exit 1
fi

cd "$CONTRACTS_DIR"

# load .env if exists
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

# sanity check
if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "❌ 缺少 PRIVATE_KEY 环境变量。请在 $CONTRACTS_DIR/.env 中配置或在环境中导出。" >&2
  exit 1
fi

# install deps
if command -v npm >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    npm ci || npm install
  else
    npm install
  fi
else
  echo "❌ 未找到 npm，请先安装 Node.js/npm" >&2
  exit 1
fi

# compile
npx hardhat compile --config hardhat.config.base.js

# deploy
echo "🚀 正在部署到网络: $NETWORK"
npx hardhat run scripts/deploy-base.js --network "$NETWORK" --config hardhat.config.base.js

# fetch latest deployment JSON and print contract address
DEPLOYMENTS_DIR="$CONTRACTS_DIR/deployments"
if [ -d "$DEPLOYMENTS_DIR" ]; then
  LATEST_FILE=$(ls -t "$DEPLOYMENTS_DIR" | head -n 1 || true)
  if [ -n "$LATEST_FILE" ];
    then
      echo "📄 最新部署文件: $DEPLOYMENTS_DIR/$LATEST_FILE"
      # Use node to read JSON reliably without jq dependency
      ADDR=$(node -e "const fs=require('fs');const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,'utf8'));console.log(j.contractAddress||'');" "$DEPLOYMENTS_DIR/$LATEST_FILE")
      if [ -n "$ADDR" ]; then
        echo "✅ 合约地址: $ADDR"
        echo ""
        echo "下一步：将该地址填入相关服务配置"
        echo "- MCP/服务端: CONTRACT_ADDRESS=$ADDR"
        echo "- 前端/客户端: CONTRACT_ADDRESS=$ADDR"
      fi
  fi
fi

echo "🎉 完成"
