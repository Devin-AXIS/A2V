#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 脚本标题
echo "=========================================="
echo "   EncryptedTokenDistributor 合约部署工具"
echo "=========================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "hardhat.config.ts" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    print_warning ".env 文件不存在，正在创建模板..."
    cat > .env << EOF
# 部署者私钥（必须）
DEPLOYER_PRIVATE_KEY=your_private_key_here

# 解密密钥（可选，如果不设置会自动生成）
DECRYPTION_KEY=your_secret_key_here

# Base Sepolia 测试网 RPC（可选，有默认值）
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# 代币合约地址（可选，如果不提供会自动部署测试代币）
TOKEN_ADDRESS=

# BaseScan API Key（可选，用于验证合约）
BASESCAN_API_KEY=
EOF
    print_info ".env 模板已创建，请填写必要的配置后重新运行脚本"
    exit 1
fi

# 检查必要的环境变量
print_info "检查环境变量..."

source .env

if [ -z "$DEPLOYER_PRIVATE_KEY" ] || [ "$DEPLOYER_PRIVATE_KEY" = "your_private_key_here" ]; then
    print_error "请在 .env 文件中设置 DEPLOYER_PRIVATE_KEY"
    exit 1
fi

print_success "环境变量检查通过"

# 选择网络
echo ""
print_info "请选择部署网络:"
echo "  1) Base Sepolia 测试网 (base-sepolia)"
echo "  2) Base 主网 (base)"
echo ""
read -p "请输入选项 (1 或 2，默认 1): " network_choice

NETWORK="base-sepolia"
if [ "$network_choice" = "2" ]; then
    NETWORK="base"
    print_warning "⚠️  您选择了主网部署，请确认您的操作！"
    read -p "确认继续? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "部署已取消"
        exit 0
    fi
fi

echo ""
print_info "选择的网络: $NETWORK"

# 检查依赖
echo ""
print_info "检查依赖..."

if ! command -v pnpm &> /dev/null; then
    print_error "未找到 pnpm，请先安装: npm install -g pnpm"
    exit 1
fi

print_success "依赖检查通过"

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo ""
    print_info "安装依赖..."
    pnpm install
    if [ $? -ne 0 ]; then
        print_error "依赖安装失败"
        exit 1
    fi
    print_success "依赖安装完成"
fi

# 编译合约
echo ""
print_info "编译智能合约..."
pnpm run compile

if [ $? -ne 0 ]; then
    print_error "合约编译失败"
    exit 1
fi

print_success "合约编译成功"

# 部署合约
echo ""
print_info "开始部署合约到 $NETWORK..."
echo ""

if [ "$NETWORK" = "base-sepolia" ]; then
    pnpm run deploy:encrypted-distributor:base-sepolia
else
    pnpm run deploy:encrypted-distributor:base
fi

DEPLOY_STATUS=$?

echo ""
if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    print_success "合约部署流程完成！"
    echo ""
    
    # 查找最新的部署信息文件
    if [ -d "deployments" ]; then
        LATEST_DEPLOY=$(ls -t deployments/encrypted-distributor-*.json 2>/dev/null | head -1)
        if [ -n "$LATEST_DEPLOY" ]; then
            echo "═══════════════════════════════════════════════════════════"
            echo "📄 部署信息摘要"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            
            # 使用 jq 解析 JSON（如果可用），否则使用 grep
            if command -v jq &> /dev/null; then
                echo "  合约地址: $(jq -r '.contractAddress' "$LATEST_DEPLOY")"
                echo "  网络: $(jq -r '.network' "$LATEST_DEPLOY")"
                echo "  交易哈希: $(jq -r '.txHash' "$LATEST_DEPLOY")"
                echo "  Gas 费用: $(jq -r '.gasInfo.gasCostEth' "$LATEST_DEPLOY") ETH"
                echo "  区块浏览器: $(jq -r '.explorer.contract' "$LATEST_DEPLOY")"
            else
                echo "  部署信息文件: $LATEST_DEPLOY"
                echo "  (安装 jq 可查看更详细信息: brew install jq)"
            fi
            echo ""
            echo "  完整信息: cat $LATEST_DEPLOY"
            echo ""
        fi
    fi
    
    echo "═══════════════════════════════════════════════════════════"
    print_info "下一步操作:"
    echo "  • 使用加密脚本生成加密值: pnpm run encrypt <代币数量>"
    echo "  • 查看完整部署信息: cat deployments/*.json"
    echo "  • 在区块浏览器查看合约: 查看上面的链接"
    echo "═══════════════════════════════════════════════════════════"
else
    print_error "合约部署失败，请检查错误信息"
    exit 1
fi

