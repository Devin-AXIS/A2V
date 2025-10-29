#!/bin/bash

# WorkloadToken 系统停止脚本
# 作者: AINO Team

echo "🛑 停止 WorkloadToken 系统"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止MCP服务器
stop_mcp_server() {
    echo -e "${BLUE}🖥️  停止MCP服务器...${NC}"
    
    if [ -f "mcp-server/logs/mcp-server.pid" ]; then
        MCP_PID=$(cat mcp-server/logs/mcp-server.pid)
        if ps -p $MCP_PID > /dev/null; then
            kill $MCP_PID
            echo -e "${GREEN}✅ MCP服务器已停止 (PID: $MCP_PID)${NC}"
        else
            echo -e "${YELLOW}⚠️  MCP服务器进程不存在${NC}"
        fi
        rm -f mcp-server/logs/mcp-server.pid
    else
        echo -e "${YELLOW}⚠️  未找到MCP服务器PID文件${NC}"
    fi
    
    # 强制杀死可能残留的进程
    pkill -f "mcp-server" 2>/dev/null || true
}

# 停止客户端
stop_client() {
    echo -e "${BLUE}🤖 停止客户端...${NC}"
    
    if [ -f "client/logs/client.pid" ]; then
        CLIENT_PID=$(cat client/logs/client.pid)
        if ps -p $CLIENT_PID > /dev/null; then
            kill $CLIENT_PID
            echo -e "${GREEN}✅ 客户端已停止 (PID: $CLIENT_PID)${NC}"
        else
            echo -e "${YELLOW}⚠️  客户端进程不存在${NC}"
        fi
        rm -f client/logs/client.pid
    else
        echo -e "${YELLOW}⚠️  未找到客户端PID文件${NC}"
    fi
    
    # 强制杀死可能残留的进程
    pkill -f "client" 2>/dev/null || true
}

# 清理端口
cleanup_ports() {
    echo -e "${BLUE}🧹 清理端口...${NC}"
    
    # 清理MCP服务器端口
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        echo -e "${YELLOW}⚠️  端口 3001 仍被占用，尝试清理...${NC}"
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
        sleep 1
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
            echo -e "${RED}❌ 无法清理端口 3001${NC}"
        else
            echo -e "${GREEN}✅ 端口 3001 已清理${NC}"
        fi
    else
        echo -e "${GREEN}✅ 端口 3001 已释放${NC}"
    fi
}

# 显示停止状态
show_status() {
    echo -e "${BLUE}📊 停止状态${NC}"
    echo "================================"
    
    # 检查MCP服务器
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${RED}❌ MCP服务器: 仍在运行${NC}"
    else
        echo -e "${GREEN}✅ MCP服务器: 已停止${NC}"
    fi
    
    # 检查客户端进程
    if pgrep -f "client" > /dev/null; then
        echo -e "${RED}❌ 客户端: 仍在运行${NC}"
    else
        echo -e "${GREEN}✅ 客户端: 已停止${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 系统停止完成!${NC}"
}

# 主函数
main() {
    # 停止服务
    stop_mcp_server
    echo ""
    
    stop_client
    echo ""
    
    # 清理端口
    cleanup_ports
    echo ""
    
    # 显示状态
    show_status
}

# 运行主函数
main "$@"
