module.exports = {
  apps: [
    {
      name: 'deepl-bot',
      script: './dist/index.js',
      cwd: '/var/opt/deepl-translate-bot',
      interpreter: 'node',
      autorestart: true,
      watch: false,
      max_restarts: 5,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
