module.exports = {
  apps: [
    {
      name: "Bung-le-pos",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3019, // Using 8080 as a safe alternative to 5000/3001
        MONGODB_URI: "mongodb+srv://raneaniket23_db_user:5MIiySrJlljOOOBY@bungle.hggnj83.mongodb.net/?appName=BUNGLE",
        SESSION_SECRET: "aDauFfbM3ebs1JusMnBde31dZvn1lx6pT4kf4fSJm1o-RHHUOKZ1a0f0bciP1Dv4",
        QR_SESSION_SECRET: process.env.QR_SESSION_SECRET
      }
    }
  ]
};
