const dotenv = require("dotenv");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  apiBasePath: process.env.API_BASE_PATH || "/api/v1",
  dbHost: process.env.DB_HOST || "",
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || "",
  dbUser: process.env.DB_USER || "",
  dbPassword: process.env.DB_PASSWORD || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  autoFlagThreshold: Number(process.env.AUTO_FLAG_THRESHOLD || 3),
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || "storage/uploads"),
};

module.exports = {
  env,
};
