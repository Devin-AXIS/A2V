const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动 AINO 后端服务...');

// 设置环境变量
process.env.NODE_ENV = 'development';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433';
process.env.DB_USER = 'aino';
process.env.DB_PASSWORD = 'pass';
process.env.DB_NAME = 'aino';

// 使用 node 直接运行 TypeScript 文件
const child = spawn('node', ['--loader', 'tsx/esm', 'src/server.ts'], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('启动失败:', error);
});

child.on('exit', (code) => {
  console.log(`服务退出，代码: ${code}`);
});
