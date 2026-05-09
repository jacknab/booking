module.exports = {
  apps: [
    {
      name: 'certxa',
      script: './dist/index.cjs',
      // cwd: Set this to the absolute path of your project root on the VPS,
      //      e.g. '/apps/booking' or '/home/deploy/certxa'
      //      If you start PM2 from inside the project directory, you can remove this line.
      instances: 1,
      exec_mode: 'fork',   // MUST be fork — the app spawns a child PHP process
      env: {
        NODE_ENV: 'production',
        PORT: 8100,
        // All other secrets and config (DATABASE_URL, SESSION_SECRET, API keys, etc.)
        // are loaded from the .env file in the project root via 'import "dotenv/config"'
        // at the top of server/index.ts.
        // DO NOT hardcode DATABASE_URL or SESSION_SECRET here — use .env instead.
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
