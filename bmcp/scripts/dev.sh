#!/usr/bin/env bash

set -euo pipefail

# 若用户用 sh 调起，确保在 bash 下重启自身
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

# 项目根目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

echo "[bmcp] 一键启动: $ROOT_DIR"

# 加载 .env（可选）
if [ -f .env ]; then
  echo "[bmcp] 加载根目录 .env 环境变量"
  # shellcheck disable=SC1091
  set -o allexport
  source .env
  set +o allexport
fi

# 检查 Node/NPM 版本
need_node=20
curr_node=$(node -v | sed 's/v\([0-9]*\).*/\1/g' || echo 0)
if [ "$curr_node" -lt "$need_node" ]; then
  echo "[bmcp] 需要 Node.js >= 20，请升级后再试（当前: $(node -v || echo unknown)）" >&2
  exit 1
fi

# 默认端口与变量（如未在 .env 中提供）
export REGISTRAR_PORT=${PORT:-3010}
export DATABASE_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/bmcp}
export GATEWAY_BASE=${GATEWAY_BASE:-http://localhost:${REGISTRAR_PORT}}
export SIGNATURE_SECRET=${SIGNATURE_SECRET:-dev-secret}
export NEXT_PUBLIC_BMCP_REGISTRAR=${NEXT_PUBLIC_BMCP_REGISTRAR:-http://localhost:${REGISTRAR_PORT}}
export NEXT_PUBLIC_BMCP_COMPILER=${NEXT_PUBLIC_BMCP_COMPILER:-http://localhost:3011}

echo "[bmcp] 环境变量:"
echo "  REGISTRAR_PORT=$REGISTRAR_PORT"
echo "  DATABASE_URL=$DATABASE_URL"
echo "  GATEWAY_BASE=$GATEWAY_BASE"
echo "  NEXT_PUBLIC_BMCP_REGISTRAR=$NEXT_PUBLIC_BMCP_REGISTRAR"
echo "  NEXT_PUBLIC_BMCP_COMPILER=$NEXT_PUBLIC_BMCP_COMPILER"

echo "[bmcp] 检查 npm 版本..."
curr_npm_major=$(npm -v | awk -F. '{print $1}' 2>/dev/null || echo 0)
if [ "$curr_npm_major" -lt 7 ]; then
  echo "[bmcp] 检测到 npm 版本过低（当前: $(npm -v || echo unknown)），将临时使用 npm@10 执行工作区命令"
  NPM="npx -y npm@10"
else
  NPM="npm"
fi

echo "[bmcp] 安装依赖...（启用 workspaces）"
if ! $NPM install --workspaces --include-workspace-root; then
  echo "[bmcp] 安装失败，使用 --legacy-peer-deps 重试..."
  $NPM install --workspaces --include-workspace-root --legacy-peer-deps
fi

echo "[bmcp] 构建共享包..."
$NPM --workspace @bmcp/schema run build

# 可选：执行数据库迁移（若不需要可注释）
if npm run -s | grep -q "db:migrate"; then
  echo "[bmcp] 执行数据库迁移..."
  $NPM run db:migrate || true
fi

echo "[bmcp] 并行启动服务: registrar / compiler / web"

# 在独立窗口/后台启动（macOS: 使用后台方式）

# Registrar
PORT="$REGISTRAR_PORT" \
DATABASE_URL="$DATABASE_URL" \
GATEWAY_BASE="$GATEWAY_BASE" \
SIGNATURE_SECRET="$SIGNATURE_SECRET" \
$NPM --workspace @bmcp/registrar run dev & REG_PID=$!

# Compiler（假设端口 3011 由代码内部决定或通过 .env 覆盖）
$NPM --workspace @bmcp/compiler run dev & COMP_PID=$!

# Web（Next.js 默认 3002）
NEXT_PUBLIC_BMCP_REGISTRAR="$NEXT_PUBLIC_BMCP_REGISTRAR" \
NEXT_PUBLIC_BMCP_COMPILER="$NEXT_PUBLIC_BMCP_COMPILER" \
$NPM --workspace @bmcp/web run dev & WEB_PID=$!

trap 'echo "[bmcp] 收到中断信号，停止进程..."; kill ${REG_PID:-0} ${COMP_PID:-0} ${WEB_PID:-0} 2>/dev/null || true; exit 0' INT TERM

echo "[bmcp] 所有进程已启动。"
echo "  Web:        http://localhost:3002"
echo "  Registrar:  http://localhost:${REGISTRAR_PORT}"
echo "  Compiler:   ${NEXT_PUBLIC_BMCP_COMPILER}"

wait


