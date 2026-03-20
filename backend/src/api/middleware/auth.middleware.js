const jwt = require("jsonwebtoken");

const { AppError } = require("../../core/http/errors");
const { env } = require("../../config/env");

function authMiddleware(req, _res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHENTICATED", "Missing or malformed Authorization header."));
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError(401, "TOKEN_EXPIRED", "Access token has expired."));
    }
    return next(new AppError(401, "INVALID_TOKEN", "Access token is invalid."));
  }
}

module.exports = {
  authMiddleware,
};
