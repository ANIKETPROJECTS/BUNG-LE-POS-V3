module.exports = {
  apps: [
    {
      name: "restaurant-pos",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 8080, // Using 8080 as a safe alternative to 5000/3001
        MONGODB_URI: process.env.MONGODB_URI,
        SESSION_SECRET: process.env.SESSION_SECRET
      }
    }
  ]
};
