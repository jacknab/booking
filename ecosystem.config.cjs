module.exports = {
  apps: [
    {
      name: 'certxa',
      script: 'dist/index.cjs',
      cwd: '/apps/booking',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5065,
        DATABASE_URL: 'postgresql://certxa_user:booking_secure_pass_2024@127.0.0.1/certxa_db?sslmode=disable'
      },
      error_file: '/apps/booking/logs/pm2-error.log',
      out_file: '/apps/booking/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
