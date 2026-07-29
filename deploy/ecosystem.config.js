module.exports = {
  apps: [
    {
      name: 'bulknutri-api',
      script: 'src/index.js',
      cwd: '/var/www/bulknutri/backend',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      out_file: '/var/log/bulknutri/api-out.log',
      error_file: '/var/log/bulknutri/api-error.log',
      time: true,
    },
  ],
};
