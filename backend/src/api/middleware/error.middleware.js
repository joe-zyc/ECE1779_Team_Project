const { sendError } = require("../../core/http/response");

function errorMiddleware(error, _req, res, _next) {
  return sendError(res, error);
}

module.exports = {
  errorMiddleware,
};
