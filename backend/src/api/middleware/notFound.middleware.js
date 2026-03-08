const { AppError } = require("../../core/http/errors");

function notFoundMiddleware(req, _res, next) {
  return next(new AppError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = {
  notFoundMiddleware,
};
