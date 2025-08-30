const { spawn } = require('child_process');

console.log('🚀 启动 AINO 后端服务...');

// 设置环境变量
const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '3001',
  DB_HOST: 'localhost',
  DB_PORT: '5433',
  DB_USER: 'aino',
  DB_PASSWORD: 'pass',
  DB_NAME: 'aino'
};

// 使用 tsx 启动服务
const child = spawn('npx', ['tsx', 'src/server.ts'], {
  stdio: 'inherit',
  env: env,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('启动失败:', error);
});

child.on('exit', (code) => {
  console.log(`服务退出，代码: ${code}`);
});
