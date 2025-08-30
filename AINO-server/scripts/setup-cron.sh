#!/bin/bash

# 设置数据清理的定时任务
# 使用方法: ./setup-cron.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CLEANUP_SCRIPT="$SCRIPT_DIR/data-cleanup.js"

echo "🔧 设置数据清理定时任务..."

# 检查脚本是否存在
if [ ! -f "$CLEANUP_SCRIPT" ]; then
    echo "❌ 清理脚本不存在: $CLEANUP_SCRIPT"
    exit 1
fi

# 创建 cron 任务
CRON_JOB="0 2 * * * cd $PROJECT_DIR && node $CLEANUP_SCRIPT cleanup-test >> /var/log/aino-cleanup.log 2>&1"

# 检查是否已存在相同的任务
if crontab -l 2>/dev/null | grep -q "data-cleanup.js"; then
    echo "⚠️  已存在数据清理任务，跳过添加"
else
    # 添加新的 cron 任务
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ 已添加定时清理任务"
    echo "📅 任务计划: 每天凌晨2点执行测试数据清理"
fi

# 显示当前的 cron 任务
echo ""
echo "📋 当前的数据清理相关任务:"
crontab -l 2>/dev/null | grep -E "(data-cleanup|aino-cleanup)" || echo "   无相关任务"

echo ""
echo "💡 手动执行清理命令:"
echo "   cd $PROJECT_DIR && node $CLEANUP_SCRIPT analyze"
echo "   cd $PROJECT_DIR && node $CLEANUP_SCRIPT cleanup-test"
echo "   cd $PROJECT_DIR && node $CLEANUP_SCRIPT delete-old 7"
