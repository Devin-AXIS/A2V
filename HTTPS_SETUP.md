# HTTPS 配置说明

本项目已支持 HTTPS。以下是使用说明。

## 快速开始

### 1. 生成 SSL 证书

首次使用前，需要生成 SSL 证书：

```bash
pnpm run generate-cert
```

或者：

```bash
sh scripts/generate-cert.sh
```

这会在 `certs/` 目录下生成自签名证书：
- `server.key` - 私钥文件
- `server.crt` - 证书文件

> **注意**: 自签名证书仅适用于开发/测试环境。生产环境请使用 Let's Encrypt 或其他 CA 签发的证书。

### 2. 启动 HTTPS 服务器

#### 方式一：使用 PM2（推荐）

```bash
# 启动 HTTPS 服务器
pnpm run prod:https

# 或
HTTPS_ENABLED=true pnpm run prod
```

#### 方式二：直接启动

```bash
pnpm run start:https
```

### 3. 访问应用

- HTTPS: https://localhost:443
- HTTP 重定向: http://localhost:80 (自动重定向到 HTTPS)

## 配置选项

可以通过环境变量自定义配置：

- `HTTPS_PORT`: HTTPS 端口（默认: 443）
- `PORT`: HTTP 端口（默认: 80）
- `HOSTNAME`: 主机名（默认: localhost）
- `ENABLE_HTTP_REDIRECT`: 是否启用 HTTP 到 HTTPS 的重定向（默认: true）

示例：

```bash
HTTPS_PORT=8443 HOSTNAME=example.com pnpm run start:https
```

## 生产环境

### 使用 Let's Encrypt 证书

1. 使用 certbot 获取证书：

```bash
sudo certbot certonly --standalone -d yourdomain.com
```

2. 将证书复制到项目目录：

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem certs/server.key
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem certs/server.crt
sudo chmod 600 certs/server.key
sudo chmod 644 certs/server.crt
```

3. 启动 HTTPS 服务器：

```bash
HTTPS_ENABLED=true pnpm run prod
```

### 使用其他 CA 证书

将您的证书文件放置到 `certs/` 目录：
- `server.key` - 私钥文件
- `server.crt` - 证书文件

确保文件权限正确：
```bash
chmod 600 certs/server.key
chmod 644 certs/server.crt
```

## 故障排除

### 证书文件未找到

如果启动时提示证书文件未找到，请运行：

```bash
pnpm run generate-cert
```

### 端口被占用

如果 443 端口被占用，可以修改端口：

```bash
HTTPS_PORT=8443 pnpm run start:https
```

### 浏览器安全警告

使用自签名证书时，浏览器会显示安全警告。这是正常的，点击"高级" -> "继续访问"即可。

## 相关文件

- `server.js` - HTTPS 服务器主文件
- `scripts/generate-cert.sh` - 证书生成脚本
- `scripts/start-https-server.sh` - HTTPS 启动脚本
- `ecosystem.config.js` - PM2 配置文件（支持 HTTPS）

