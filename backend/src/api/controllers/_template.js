const { sendNotImplemented } = require("../../core/http/response");

function buildNotImplementedHandler(feature) {
  return function notImplementedHandler(_req, res) {
    return sendNotImplemented(res, feature);
  };
}

module.exports = {
  buildNotImplementedHandler,
};
