#!/bin/bash

# WorkloadToken 系统 BSC测试网部署脚本
# 作者: AINO Team

set -e

echo "🚀 开始部署 WorkloadToken 系统到 BSC测试网"
echo "=============================================="

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

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装项目依赖...${NC}"
    
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

# 配置环境变量
setup_environment() {
    echo -e "${BLUE}⚙️  配置环境变量...${NC}"
    
    # 检查是否已有.env文件
    if [ ! -f "smart-contract/.env" ]; then
        echo "创建智能合约环境变量文件..."
        cp smart-contract/env.bnb.example smart-contract/.env
        echo -e "${YELLOW}⚠️  请编辑 smart-contract/.env 文件，填入你的私钥${NC}"
    fi
    
    if [ ! -f "mcp-server/.env" ]; then
        echo "创建MCP服务器环境变量文件..."
        cp mcp-server/env.example mcp-server/.env
    fi
    
    if [ ! -f "client/.env" ]; then
        echo "创建客户端环境变量文件..."
        cp client/env.example client/.env
    fi
    
    echo -e "${GREEN}✅ 环境变量配置完成${NC}"
}

# 检查私钥配置
check_private_key() {
    echo -e "${BLUE}🔑 检查私钥配置...${NC}"
    
    if [ ! -f "smart-contract/.env" ]; then
        echo -e "${RED}❌ 智能合约环境变量文件不存在${NC}"
        exit 1
    fi
    
    # 检查私钥是否已配置
    if grep -q "0x1234567890123456789012345678901234567890123456789012345678901234" smart-contract/.env; then
        echo -e "${YELLOW}⚠️  请先配置你的私钥${NC}"
        echo "编辑文件: smart-contract/.env"
        echo "将 PRIVATE_KEY 替换为你的测试私钥"
        echo ""
        echo "获取测试私钥的方法:"
        echo "1. 使用 MetaMask 创建新钱包"
        echo "2. 导出私钥 (仅用于测试)"
        echo "3. 将私钥填入 .env 文件"
        echo ""
        read -p "配置完成后按回车继续..."
    fi
    
    echo -e "${GREEN}✅ 私钥配置检查完成${NC}"
}

# 获取测试BNB
get_test_bnb() {
    echo -e "${BLUE}💰 获取测试BNB...${NC}"
    
    # 从.env文件读取私钥
    PRIVATE_KEY=$(grep "PRIVATE_KEY=" smart-contract/.env | cut -d'=' -f2)
    
    if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "0x1234567890123456789012345678901234567890123456789012345678901234" ]; then
        echo -e "${YELLOW}⚠️  请先配置私钥${NC}"
        return
    fi
    
    # 从私钥获取地址
    ADDRESS=$(node -e "
        const { ethers } = require('ethers');
        const wallet = new ethers.Wallet('$PRIVATE_KEY');
        console.log(wallet.address);
    ")
    
    echo -e "${GREEN}✅ 钱包地址: $ADDRESS${NC}"
    echo ""
    echo "请访问以下链接获取测试BNB:"
    echo "🔗 https://testnet.binance.org/faucet-smart"
    echo "📝 输入地址: $ADDRESS"
    echo "💰 获取测试BNB (每次0.1 BNB)"
    echo ""
    read -p "获取测试BNB后按回车继续..."
}

# 部署智能合约
deploy_contract() {
    echo -e "${BLUE}📄 部署智能合约到BSC测试网...${NC}"
    
    cd smart-contract
    
    # 编译合约
    echo "编译智能合约..."
    npx hardhat compile
    
    # 部署合约
    echo "部署到BSC测试网..."
    npx hardhat run scripts/deploy-bnb.js --network bscTestnet
    
    # 获取合约地址
    CONTRACT_ADDRESS=$(ls deployments/bscTestnet-*.json 2>/dev/null | tail -1 | xargs cat | jq -r '.contractAddress')
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${RED}❌ 无法获取合约地址${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 智能合约部署成功${NC}"
    echo -e "${GREEN}📍 合约地址: $CONTRACT_ADDRESS${NC}"
    
    cd ..
    
    # 更新配置文件
    update_configs "$CONTRACT_ADDRESS"
}

# 更新配置文件
update_configs() {
    local contract_address=$1
    
    echo -e "${BLUE}⚙️  更新配置文件...${NC}"
    
    # 更新MCP服务器配置
    sed -i.bak "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$contract_address/" mcp-server/.env
    sed -i.bak "s|WEB3_PROVIDER_URL=.*|WEB3_PROVIDER_URL=https://data-seed-prebsc-1-s1.binance.org:8545/|" mcp-server/.env
    
    # 更新客户端配置
    sed -i.bak "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$contract_address/" client/.env
    sed -i.bak "s|RPC_URL=.*|RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/|" client/.env
    sed -i.bak "s/NETWORK_ID=.*/NETWORK_ID=97/" client/.env
    sed -i.bak "s/CHAIN_ID=.*/CHAIN_ID=97/" client/.env
    
    echo -e "${GREEN}✅ 配置文件更新完成${NC}"
}

# 启动系统
start_system() {
    echo -e "${BLUE}🚀 启动系统...${NC}"
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动MCP服务器
    echo "启动MCP服务器..."
    cd mcp-server
    nohup npm start > ../logs/mcp-server.log 2>&1 &
    MCP_PID=$!
    echo $MCP_PID > ../logs/mcp-server.pid
    cd ..
    
    # 等待服务器启动
    sleep 5
    
    # 检查服务器是否启动成功
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ MCP服务器启动成功${NC}"
    else
        echo -e "${RED}❌ MCP服务器启动失败${NC}"
        echo "查看日志: tail -f logs/mcp-server.log"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 系统启动完成${NC}"
}

# 显示系统信息
show_system_info() {
    echo -e "${BLUE}📊 系统信息${NC}"
    echo "=============================================="
    
    # 获取合约地址
    CONTRACT_ADDRESS=$(ls smart-contract/deployments/bscTestnet-*.json 2>/dev/null | tail -1 | xargs cat | jq -r '.contractAddress')
    
    echo -e "${GREEN}✅ 系统状态: 运行中${NC}"
    echo -e "${GREEN}✅ 网络: BSC测试网${NC}"
    echo -e "${GREEN}✅ 合约地址: $CONTRACT_ADDRESS${NC}"
    echo -e "${GREEN}✅ MCP服务器: http://localhost:3001${NC}"
    echo -e "${GREEN}✅ 区块链浏览器: https://testnet.bscscan.com/address/$CONTRACT_ADDRESS${NC}"
    
    echo ""
    echo -e "${BLUE}📋 可用命令${NC}"
    echo "   npm run start:client    # 启动客户端"
    echo "   npm run start:demo      # 运行演示"
    echo "   npm run logs           # 查看日志"
    echo "   ./stop.sh              # 停止系统"
    
    echo ""
    echo -e "${GREEN}🎉 部署完成! 现在可以开始使用系统了${NC}"
}

# 主函数
main() {
    check_node
    echo ""
    
    install_dependencies
    echo ""
    
    setup_environment
    echo ""
    
    check_private_key
    echo ""
    
    get_test_bnb
    echo ""
    
    deploy_contract
    echo ""
    
    start_system
    echo ""
    
    show_system_info
}

# 运行主函数
main "$@"
