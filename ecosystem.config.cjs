const fs = require("fs");

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
        QR_SESSION_SECRET: "ZTYj/a2OXy7iabAxcXL+ue17Aw3pQPg7wmyjLWvduDU4t/jS37xQriltz3khKboxGBhjje3+rqc7l7YuNmdOCA==",
        QZ_CERTIFICATE: fs.readFileSync(
          "/etc/bungle/qz/digital-certificate.txt",
          "utf8"
        ),
        QZ_PRIVATE_KEY: fs.readFileSync(
          "/etc/bungle/qz/private-key.pem",
          "utf8"
        )
      }
    }
  ]
};
