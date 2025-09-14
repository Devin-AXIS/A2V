# AINO 项目生产环境部署指南

本指南介绍如何使用 PM2 守护进程在生产环境中部署 AINO 项目。

## 📋 前置要求

- Node.js 18+ 
- pnpm 包管理器
- PM2 进程管理器
- PostgreSQL 数据库

## 🚀 快速开始

### 一键部署（推荐）
```bash
./deploy-production.sh
```

这个脚本会自动：
1. 停止现有服务
2. 构建所有项目
3. 启动生产环境

### 分步部署

#### 1. 构建项目
```bash
./build-production.sh
```

#### 2. 启动生产环境
```bash
./start-production.sh
```

#### 3. 停止服务
```bash
./stop-production.sh
```

## 📊 服务端口

| 服务 | 端口 | 地址 | 状态 |
|------|------|------|------|
| AINO-APP | 3005 | http://47.94.52.142:3005 | ✅ 运行中 |
| AINO-Studio | 3006 | http://47.94.52.142:3006 | ✅ 运行中 |
| AINO-Server | 3007 | http://47.94.52.142:3007 | ✅ 运行中 |
| Drizzle Studio | - | https://local.drizzle.studio | ✅ 运行中 |

## 🔧 PM2 管理命令

```bash
# 查看服务状态
pm2 status

# 查看实时日志
pm2 logs

# 查看特定服务日志
pm2 logs aino-backend
pm2 logs aino-studio
pm2 logs aino-app
pm2 logs drizzle-studio

# 重启所有服务
pm2 restart all

# 重启特定服务
pm2 restart aino-backend

# 停止所有服务
pm2 stop all

# 删除所有服务
pm2 delete all

# 保存当前配置
pm2 save

# 设置开机自启
pm2 startup
```

## 📁 文件结构

```
AINO/
├── build-production.sh      # 构建脚本
├── start-production.sh      # 启动脚本
├── stop-production.sh       # 停止脚本
├── deploy-production.sh     # 一键部署脚本
├── ecosystem.config.js      # PM2 配置文件
└── logs/                    # 日志目录
    ├── backend.log
    ├── frontend.log
    ├── aino-app.log
    └── drizzle.log
```

## 🐛 故障排除

### 构建失败
- 检查依赖是否正确安装
- 确保数据库连接正常
- 查看构建日志中的具体错误

### 服务启动失败
- 检查端口是否被占用：`lsof -i :端口号`
- 查看 PM2 日志：`pm2 logs`
- 检查环境变量配置

### 数据库连接问题
- 确保 PostgreSQL 服务正在运行
- 检查数据库连接配置
- 运行数据库初始化脚本

### 端口冲突
如果遇到端口被占用的问题：
```bash
# 查看端口占用
lsof -i :3006

# 杀死占用进程
kill -9 PID

# 重新启动服务
pm2 restart all
```

## 📝 注意事项

1. **端口配置**：生产环境使用固定端口，请确保端口未被占用
2. **环境变量**：生产环境会自动设置 `NODE_ENV=production`
3. **日志管理**：所有日志文件保存在 `logs/` 目录
4. **内存限制**：每个服务设置了 1GB 内存限制，超出会自动重启
5. **自动重启**：服务异常退出时会自动重启，最多重启 10 次
6. **后端服务**：使用 tsx 直接运行 TypeScript 代码，无需编译

## 🔄 更新部署

当代码更新后，重新运行部署脚本：

```bash
./deploy-production.sh
```

这会自动停止旧服务，重新构建，然后启动新版本。

## ✅ 部署验证

部署完成后，可以通过以下方式验证服务状态：

```bash
# 检查后端健康状态
curl http://47.94.52.142:3007/health

# 检查前端服务
curl -I http://47.94.52.142:3006

# 检查 aino-app 服务
curl -I http://47.94.52.142:3005

# 查看 PM2 状态
pm2 status
```

## 🎉 部署成功

恭喜！您的 AINO 项目已成功部署到生产环境。所有服务都在 PM2 守护进程下运行，具有自动重启、日志管理和监控功能。
