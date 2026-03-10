const dotenv = require("dotenv");
const path = require("path");
const { env } = require("./env");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3001),
  apiBasePath: process.env.API_BASE_PATH || "/api/v1",
  databaseUrl: process.env.DATABASE_URL || "",
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
