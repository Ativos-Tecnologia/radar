module.exports = {
  apps: [
    {
      name: 'radardados-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
  ],
};
