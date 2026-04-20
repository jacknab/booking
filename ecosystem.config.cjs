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
        PORT: 5080,
        DATABASE_URL: 'postgresql://certxa_user:CHANGE_ME@127.0.0.1/certxabooking_data?sslmode=disable',
        SESSION_SECRET: 'CHANGE_ME',
        CORS_ALLOW_ALL: 'false',
        CORS_ORIGINS: 'https://certxa.com,https://www.certxa.com',
        TRIAL_PERIOD_DAYS: '60',
        APP_URL: 'https://certxa.com',
        GOOGLE_REDIRECT_URI: 'https://certxa.com/google-business',
        GOOGLE_AUTH_CALLBACK_URL: 'https://certxa.com/api/auth/google/callback'
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
