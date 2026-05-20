const path = require('path');
const PORT = process.env.PORT || 3001;

module.exports = {
  apps: [
    {
      name: 'edufund-backend',
      script: './src/index.js',
      // Preload dotenv so PM2 always loads variables from env_file on start (helps on Windows)
      node_args: '-r dotenv/config',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      // Ensure PM2 loads the correct .env file by using an absolute path
      env_file: path.join(__dirname, '.env'), // PM2 will load environment variables from server/.env
      // Force the working directory to the server folder so node_args '-r dotenv/config'
      // loads the same .env file regardless of where pm2 was started from.
      cwd: __dirname,
      // PM2 uses env_<name> when you pass --env <name>. Provide env_development
      // to match `--env development` and env_production for production.
      env_development: {
        NODE_ENV: 'development',
        PORT,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
  ],
};
