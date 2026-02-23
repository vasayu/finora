module.exports = {
  apps: [
    {
      name: "finora-api",
      script: "./dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8000,
      },
    },
    {
      name: "finora-doc-worker",
      script: "./dist/workers/document.worker.js",
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: "finora-alert-worker",
      script: "./dist/workers/alert.worker.js",
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
