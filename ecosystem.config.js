module.exports = {
    apps: [
        {
            name: "aino-backend",
            cwd: "./AINO-server",
            script: "npx",
            args: "tsx src/server.ts",
            instances: 1,
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
                PORT: 3007
            },
            log_file: "./logs/backend.log",
            out_file: "./logs/backend-out.log",
            error_file: "./logs/backend-error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: true,
            max_memory_restart: "1G",
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: "10s"
        },
        {
            name: "aino-studio",
            cwd: "./AINO-studio",
            script: "npm",
            args: "start",
            instances: 1,
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
                PORT: 3006
            },
            log_file: "./logs/frontend.log",
            out_file: "./logs/frontend-out.log",
            error_file: "./logs/frontend-error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: true,
            max_memory_restart: "1G",
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: "10s"
        },
        {
            name: "aino-app",
            cwd: "./AINO-APP",
            script: "npm",
            args: "start",
            instances: 1,
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
                PORT: 3005
            },
            log_file: "./logs/aino-app.log",
            out_file: "./logs/aino-app-out.log",
            error_file: "./logs/aino-app-error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: true,
            max_memory_restart: "1G",
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: "10s"
        },
        {
            name: "drizzle-studio",
            cwd: "./AINO-server",
            script: "npm",
            args: "run studio",
            instances: 1,
            exec_mode: "fork",
            env: {
                NODE_ENV: "production"
            },
            log_file: "./logs/drizzle.log",
            out_file: "./logs/drizzle-out.log",
            error_file: "./logs/drizzle-error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: true,
            max_memory_restart: "500M",
            restart_delay: 4000,
            max_restarts: 5,
            min_uptime: "10s"
        }
    ]
}
