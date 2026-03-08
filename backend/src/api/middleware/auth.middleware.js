const { AppError } = require("../../core/http/errors");

function authMiddleware(req, _res, next) {
  return next(
    new AppError(501, "AUTH_NOT_IMPLEMENTED", "JWT verification is not implemented in this template.")
  );
}

module.exports = {
  authMiddleware,
};
