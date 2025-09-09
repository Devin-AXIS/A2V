#!/bin/bash

# AINO 数据库一键启停脚本（Docker 版）
# 用法：
#   ./db.sh start      启动数据库（首次会创建数据卷）
#   ./db.sh stop       停止并删除容器（保留数据卷）
#   ./db.sh restart    重启数据库
#   ./db.sh status     查看容器与健康检查状态
#   ./db.sh logs       查看容器日志（实时）
#   ./db.sh help       显示帮助

set -eo pipefail

COMMAND=${1:-help}

# 可通过环境变量覆盖以下变量
CONTAINER_NAME=${CONTAINER_NAME:-aino-postgres}
IMAGE=${IMAGE:-postgres:16}
DATA_VOLUME=${DATA_VOLUME:-aino_pg_data}

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_USER=${DB_USER:-aino}
DB_PASSWORD=${DB_PASSWORD:-pass}
DB_NAME=${DB_NAME:-aino}

HEALTH_TIMEOUT=${HEALTH_TIMEOUT:-60}

# 检查依赖
require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ 未检测到 Docker，请先安装 Docker Desktop 或 Docker CLI"
    exit 1
  fi
}

# 检查并创建数据卷
ensure_volume() {
  if ! docker volume inspect "$DATA_VOLUME" >/dev/null 2>&1; then
    echo "🪣 创建数据卷: $DATA_VOLUME"
    docker volume create "$DATA_VOLUME" >/dev/null
  fi
}

# 检查容器是否存在
container_exists() {
  docker inspect "$CONTAINER_NAME" >/dev/null 2>&1
}

# 检查容器是否运行中
container_running() {
  [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null || echo false)" = "true" ]
}

wait_for_health() {
  echo "⏳ 等待数据库健康检查通过（最多 ${HEALTH_TIMEOUT}s）..."
  local start_ts end_ts elapsed status
  start_ts=$(date +%s)
  while true; do
    status=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
    if [ "$status" = "healthy" ]; then
      echo "✅ 健康检查通过"
      break
    fi
    end_ts=$(date +%s)
    elapsed=$((end_ts - start_ts))
    if [ $elapsed -ge $HEALTH_TIMEOUT ]; then
      echo "❌ 健康检查超时，当前状态：$status"
      docker logs --since 10m "$CONTAINER_NAME" | tail -n 50 || true
      exit 1
    fi
    sleep 2
  done
}

start_db() {
  require_docker

  if container_running; then
    echo "✅ 容器已在运行：$CONTAINER_NAME"
    status_db
    return 0
  fi

  ensure_volume

  if container_exists; then
    echo "▶️ 启动已存在的容器：$CONTAINER_NAME"
    docker start "$CONTAINER_NAME" >/dev/null
  else
    echo "🚀 创建并启动容器：$CONTAINER_NAME（镜像：$IMAGE）"
    docker run -d \
      --name "$CONTAINER_NAME" \
      -e POSTGRES_USER="$DB_USER" \
      -e POSTGRES_PASSWORD="$DB_PASSWORD" \
      -e POSTGRES_DB="$DB_NAME" \
      -p "$DB_PORT:5432" \
      -v "$DATA_VOLUME":/var/lib/postgresql/data \
      --health-cmd="pg_isready -U $DB_USER -d $DB_NAME || exit 1" \
      --health-interval=5s \
      --health-timeout=5s \
      --health-retries=12 \
      "$IMAGE" >/dev/null
  fi

  wait_for_health

  echo "📡 连接信息："
  echo "   主机: $DB_HOST"
  echo "   端口: $DB_PORT"
  echo "   数据库: $DB_NAME"
  echo "   用户: $DB_USER"
  echo "   密码: $DB_PASSWORD"
  echo "   容器: $CONTAINER_NAME"
}

stop_db() {
  require_docker
  if container_exists; then
    echo "🛑 停止并删除容器：$CONTAINER_NAME"
    docker rm -f "$CONTAINER_NAME" >/dev/null || true
  else
    echo "ℹ️ 容器不存在：$CONTAINER_NAME"
  fi
  echo "💾 数据卷已保留：$DATA_VOLUME（不自动删除）"
}

restart_db() {
  stop_db
  start_db
}

status_db() {
  require_docker
  if container_exists; then
    local running health ports
    running=$(docker inspect -f '{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
    health=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unavailable")
    ports=$(docker port "$CONTAINER_NAME" 2>/dev/null || true)
    echo "📊 容器：$CONTAINER_NAME"
    echo "   状态：$running（健康：$health）"
    if [ -n "$ports" ]; then
      echo "   端口映射：$ports"
    fi
  else
    echo "❌ 容器不存在：$CONTAINER_NAME"
  fi
}

logs_db() {
  require_docker
  if container_exists; then
    echo "🧾 按 Ctrl+C 退出日志实时查看"
    docker logs -f "$CONTAINER_NAME"
  else
    echo "❌ 容器不存在：$CONTAINER_NAME"
    exit 1
  fi
}

usage() {
  cat <<EOF
AINO 数据库脚本

用法：
  ./db.sh start      启动数据库
  ./db.sh stop       停止并删除容器（保留数据卷）
  ./db.sh restart    重启数据库
  ./db.sh status     查看状态
  ./db.sh logs       查看日志
  ./db.sh help       显示帮助

环境变量（可覆盖默认值）：
  CONTAINER_NAME  默认为 aino-postgres
  IMAGE           默认为 postgres:16
  DATA_VOLUME     默认为 aino_pg_data
  DB_PORT         默认为 5433（与项目脚本/文档一致）
  DB_USER         默认为 aino
  DB_PASSWORD     默认为 pass
  DB_NAME         默认为 aino
  HEALTH_TIMEOUT  健康检查超时（秒），默认 60
EOF
}

case "$COMMAND" in
  start)
    start_db
    ;;
  stop)
    stop_db
    ;;
  restart)
    restart_db
    ;;
  status)
    status_db
    ;;
  logs)
    logs_db
    ;;
  help|*)
    usage
    ;;

esac 