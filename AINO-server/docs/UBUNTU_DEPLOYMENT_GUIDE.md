# 🐧 Ubuntu 系统部署指南

## 📋 Ubuntu 系统特殊说明

Ubuntu 系统中的 Node.js 安装位置可能与标准路径不同，本指南将帮助您解决 Ubuntu 环境下的部署问题。

## 🔍 常见问题

### 1. Node.js 检测问题

**问题**: 脚本报告 "Node.js 未安装"，但实际已安装
**原因**: Ubuntu 系统中 Node.js 可能安装在 `/usr/bin/node` 而不是标准路径
**解决**: 使用修复后的脚本，会自动检测多个可能的位置

### 2. 包管理器问题

**问题**: npm 不支持 `workspace:` 协议
**原因**: 项目使用 pnpm 的 workspace 功能
**解决**: 脚本会自动检测并使用正确的包管理器

## 🚀 部署步骤

### 方法一：使用修复后的部署脚本（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd AINO/AINO-server

# 2. 运行修复后的部署脚本
./deploy.sh
```

### 方法二：手动检查 Node.js

```bash
# 1. 运行 Node.js 检查脚本
./scripts/check-nodejs-ubuntu.sh

# 2. 如果检查通过，运行部署脚本
./deploy.sh
```

### 方法三：手动安装 pnpm（如果使用 pnpm 项目）

```bash
# 1. 安装 pnpm
npm install -g pnpm

# 2. 安装依赖
pnpm install

# 3. 初始化数据库
./scripts/setup-database.sh

# 4. 启动服务
npm start
```

## 🔧 Ubuntu 系统 Node.js 安装

### 推荐方法：使用 NodeSource 仓库

```bash
# 1. 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 2. 安装 Node.js
sudo apt-get install -y nodejs

# 3. 验证安装
node --version
npm --version
```

### 其他安装方法

```bash
# 使用 snap
sudo snap install node --classic

# 使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install node

# 使用 apt（版本可能较旧）
sudo apt update
sudo apt install nodejs npm
```

## 📊 脚本改进

### 1. Node.js 检测改进

**修复前**:
```bash
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
```

**修复后**:
```bash
# 检查多个可能的位置
if command -v node &> /dev/null; then
    echo "✅ Node.js 已安装: $(node --version)"
elif [ -f "/usr/bin/node" ]; then
    echo "✅ Node.js 已安装: $(/usr/bin/node --version) (在 /usr/bin/node)"
    export PATH="/usr/bin:$PATH"
elif [ -f "/usr/local/bin/node" ]; then
    echo "✅ Node.js 已安装: $(/usr/local/bin/node --version) (在 /usr/local/bin/node)"
    export PATH="/usr/local/bin:$PATH"
else
    echo "❌ Node.js 未安装"
    exit 1
fi
```

### 2. 包管理器检测改进

**新增功能**:
```bash
# 自动检测包管理器
if [ -f "pnpm-lock.yaml" ]; then
    echo "📋 检测到 pnpm 项目，使用 pnpm 安装依赖..."
    pnpm install
elif [ -f "yarn.lock" ]; then
    echo "📋 检测到 yarn 项目，使用 yarn 安装依赖..."
    yarn install
else
    echo "📋 使用 npm 安装依赖..."
    npm install --legacy-peer-deps
fi
```

## 🧪 测试验证

### 1. Node.js 检查测试

```bash
./scripts/check-nodejs-ubuntu.sh
```

**预期输出**:
```
🔍 Ubuntu 系统 Node.js 检查脚本
==================================
📊 系统信息:
   操作系统: Ubuntu 22.04.4 LTS
   架构: x86_64

🔍 检查 Node.js 安装位置...
✅ Node.js 已找到:
   路径: /usr/bin/node
   版本: v18.19.0
✅ Node.js 已在 PATH 中

🔍 检查 npm...
✅ npm 已找到:
   路径: /usr/bin/npm
   版本: 9.2.0
✅ npm 已在 PATH 中

🎉 Node.js 和 npm 检查完成！
```

### 2. 部署脚本测试

```bash
./deploy.sh
```

**预期输出**:
```
🚀 AINO 新服务器一键部署脚本
==================================
🔍 检查 Node.js 安装状态...
✅ Node.js 已安装: v18.19.0
✅ npm 已安装: 9.2.0
✅ 项目目录检查通过
📦 安装项目依赖...
📋 检测到 pnpm 项目，使用 pnpm 安装依赖...
✅ 数据库连接正常
✅ 数据库已初始化
🚀 启动 AINO 服务器...
```

## 🔍 故障排除

### 1. Node.js 路径问题

**检查 Node.js 位置**:
```bash
which node
whereis node
ls -la /usr/bin/node
ls -la /usr/local/bin/node
```

**手动添加到 PATH**:
```bash
export PATH="/usr/bin:$PATH"
# 或
export PATH="/usr/local/bin:$PATH"
```

### 2. 权限问题

**检查权限**:
```bash
ls -la /usr/bin/node
ls -la /usr/local/bin/node
```

**修复权限**:
```bash
sudo chmod +x /usr/bin/node
sudo chmod +x /usr/local/bin/node
```

### 3. 包管理器问题

**安装 pnpm**:
```bash
npm install -g pnpm
```

**使用 npm 替代**:
```bash
npm install --legacy-peer-deps
```

## 📝 环境变量

### Ubuntu 系统环境变量

```bash
# 添加到 ~/.bashrc
export PATH="/usr/bin:$PATH"
export PATH="/usr/local/bin:$PATH"

# 重新加载配置
source ~/.bashrc
```

### 项目环境变量

```bash
export DB_HOST=localhost
export DB_PORT=5433
export DB_USER=aino
export DB_PASSWORD=pass
export DB_NAME=aino
```

---

**🎉 现在您可以在 Ubuntu 系统中成功部署 AINO 项目了！**
