/**
 * PM2 生态系统配置文件
 * 用于管理Next.js应用的进程
 */

module.exports = {
  apps: [
    {
      name: 'aino-nextjs',
      script: './scripts/start-server.sh',
      interpreter: 'bash',
      cwd: './',
      instances: 1, // 或者使用 'max' 来使用所有CPU核心
      exec_mode: 'fork', // 'fork' 或 'cluster'
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      // 自动重启配置
      watch: false,
      ignore_watch: [
        'node_modules',
        '.next',
        'logs',
        '*.log',
      ],
      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      // 其他配置
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // 优雅关闭
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
