module.exports = {
  apps: [
    {
      name: 'certxa',
      script: 'dist/index.cjs',
      cwd: '/apps/booking',

      // Single process — bump to 'cluster' + instances: 'max' if you add more CPU
      instances: 1,
      exec_mode: 'fork',

      // Environment — sensitive values (DATABASE_URL, SESSION_SECRET, etc.)
      // should be set in /apps/booking/.env or as real shell env vars on the server.
      // Only non-secret defaults live here.
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Logs — make sure /apps/booking/logs/ exists (mkdir -p /apps/booking/logs)
      error_file: '/apps/booking/logs/pm2-error.log',
      out_file:   '/apps/booking/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',        // must stay up 10 s to count as a successful start
      restart_delay: 3000,      // wait 3 s between crash restarts

      // Memory guard — restarts the process if RSS exceeds this
      max_memory_restart: '1G',

      // Never watch filesystem in production (let you deploy without restarts)
      watch: false,

      // Give the process 10 s to shut down gracefully before SIGKILL
      kill_timeout: 10000,
    },
  ],
};
