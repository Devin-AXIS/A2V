const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const httpsPort = parseInt(process.env.HTTPS_PORT || '443', 10);
const httpPort = parseInt(process.env.PORT || '80', 10);

// 证书文件路径
const certDir = path.join(__dirname, 'certs');
const keyPath = path.join(certDir, 'server.key');
const certPath = path.join(certDir, 'server.crt');

const app = next({ dev, hostname, port: httpsPort });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // 检查证书文件是否存在
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('❌ SSL 证书文件未找到！');
    console.error(`   请确保以下文件存在：`);
    console.error(`   - ${keyPath}`);
    console.error(`   - ${certPath}`);
    console.error('');
    console.error('💡 提示: 运行以下命令生成自签名证书：');
    console.error('   pnpm run generate-cert');
    console.error('   或');
    console.error('   sh scripts/generate-cert.sh');
    process.exit(1);
  }

  // 读取证书文件
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  // 创建 HTTPS 服务器
  const httpsServer = createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // 启动 HTTPS 服务器
  httpsServer.listen(httpsPort, (err) => {
    if (err) throw err;
    console.log(`✅ HTTPS 服务器已启动`);
    console.log(`   🔒 地址: https://${hostname}:${httpsPort}`);
    console.log(`   📝 环境: ${dev ? 'development' : 'production'}`);
  });

  // 可选：创建 HTTP 服务器用于重定向到 HTTPS
  if (process.env.ENABLE_HTTP_REDIRECT === 'true') {
    const http = require('http');
    const httpServer = http.createServer((req, res) => {
      const host = req.headers.host?.replace(`:${httpPort}`, '') || hostname;
      res.writeHead(301, {
        Location: `https://${host}:${httpsPort}${req.url}`,
      });
      res.end();
    });

    httpServer.listen(httpPort, () => {
      console.log(`✅ HTTP 重定向服务器已启动`);
      console.log(`   🔄 地址: http://${hostname}:${httpPort} -> https://${hostname}:${httpsPort}`);
    });
  }
});

