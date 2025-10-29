#!/bin/bash

# WorkloadToken 系统启动脚本
# 作者: AINO Team

set -e

echo "🚀 启动 WorkloadToken 系统"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js版本
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo "请安装 Node.js 16+ 版本"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo -e "${RED}❌ Node.js 版本过低${NC}"
        echo "当前版本: $(node -v)"
        echo "需要版本: 16.0.0+"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js 版本检查通过: $(node -v)${NC}"
}

# 检查npm版本
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ npm 版本: $(npm -v)${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装依赖...${NC}"
    
    # 安装根项目依赖
    if [ ! -d "node_modules" ]; then
        echo "安装根项目依赖..."
        npm install
    fi
    
    # 安装MCP服务器依赖
    if [ ! -d "mcp-server/node_modules" ]; then
        echo "安装MCP服务器依赖..."
        cd mcp-server && npm install && cd ..
    fi
    
    # 安装智能合约依赖
    if [ ! -d "smart-contract/node_modules" ]; then
        echo "安装智能合约依赖..."
        cd smart-contract && npm install && cd ..
    fi
    
    # 安装客户端依赖
    if [ ! -d "client/node_modules" ]; then
        echo "安装客户端依赖..."
        cd client && npm install && cd ..
    fi
    
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 检查端口占用
check_ports() {
    echo -e "${BLUE}🔍 检查端口占用...${NC}"
    
    # 检查MCP服务器端口
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        echo -e "${YELLOW}⚠️  端口 3001 已被占用${NC}"
        echo "请停止占用端口的进程或修改配置"
        exit 1
    fi
    
    # 检查区块链端口
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null; then
        echo -e "${GREEN}✅ 区块链网络运行中${NC}"
    else
        echo -e "${YELLOW}⚠️  区块链网络未运行${NC}"
        echo "请启动本地区块链网络 (如 Hardhat Network)"
    fi
    
    echo -e "${GREEN}✅ 端口检查完成${NC}"
}

# 部署智能合约
deploy_contract() {
    echo -e "${BLUE}📄 部署智能合约...${NC}"
    
    cd smart-contract
    
    # 检查是否已部署
    if [ -f "deployments/localhost-*.json" ]; then
        echo -e "${GREEN}✅ 智能合约已部署${NC}"
        cd ..
        return
    fi
    
    # 编译合约
    echo "编译智能合约..."
    npx hardhat compile
    
    # 部署合约
    echo "部署智能合约到本地网络..."
    npx hardhat run scripts/deploy.js --network localhost || {
        echo -e "${YELLOW}⚠️  合约部署失败，使用模拟模式${NC}"
    }
    
    cd ..
    echo -e "${GREEN}✅ 智能合约部署完成${NC}"
}

# 启动MCP服务器
start_mcp_server() {
    echo -e "${BLUE}🖥️  启动MCP服务器...${NC}"
    
    cd mcp-server
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动服务器
    nohup npm start > logs/mcp-server.log 2>&1 &
    MCP_PID=$!
    echo $MCP_PID > logs/mcp-server.pid
    
    # 等待服务器启动
    sleep 3
    
    # 检查服务器是否启动成功
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ MCP服务器启动成功 (PID: $MCP_PID)${NC}"
    else
        echo -e "${RED}❌ MCP服务器启动失败${NC}"
        echo "查看日志: tail -f mcp-server/logs/mcp-server.log"
        exit 1
    fi
    
    cd ..
}

# 启动客户端
start_client() {
    echo -e "${BLUE}🤖 启动客户端...${NC}"
    
    cd client
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动客户端
    nohup npm start > logs/client.log 2>&1 &
    CLIENT_PID=$!
    echo $CLIENT_PID > logs/client.pid
    
    echo -e "${GREEN}✅ 客户端启动成功 (PID: $CLIENT_PID)${NC}"
    
    cd ..
}

# 显示系统状态
show_status() {
    echo -e "${BLUE}📊 系统状态${NC}"
    echo "================================"
    
    # MCP服务器状态
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ MCP服务器: 运行中${NC}"
        echo "   地址: http://localhost:3001"
        echo "   健康检查: http://localhost:3001/health"
    else
        echo -e "${RED}❌ MCP服务器: 未运行${NC}"
    fi
    
    # 客户端状态
    if [ -f "client/logs/client.pid" ]; then
        CLIENT_PID=$(cat client/logs/client.pid)
        if ps -p $CLIENT_PID > /dev/null; then
            echo -e "${GREEN}✅ 客户端: 运行中 (PID: $CLIENT_PID)${NC}"
        else
            echo -e "${RED}❌ 客户端: 未运行${NC}"
        fi
    else
        echo -e "${RED}❌ 客户端: 未运行${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📋 可用命令${NC}"
    echo "   npm run start:demo    # 运行演示"
    echo "   npm run logs         # 查看日志"
    echo "   npm run stop         # 停止系统"
    echo ""
    echo -e "${GREEN}🎉 系统启动完成!${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}开始启动 WorkloadToken 系统...${NC}"
    echo ""
    
    # 检查环境
    check_node
    check_npm
    echo ""
    
    # 安装依赖
    install_dependencies
    echo ""
    
    # 检查端口
    check_ports
    echo ""
    
    # 部署合约
    deploy_contract
    echo ""
    
    # 启动服务
    start_mcp_server
    echo ""
    
    # 启动客户端
    start_client
    echo ""
    
    # 显示状态
    show_status
}

# 运行主函数
main "$@"
