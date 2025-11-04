#!/bin/bash

# 一键打包脚本（便捷入口）
# 调用 scripts/build.sh 执行打包

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/scripts/build.sh"

