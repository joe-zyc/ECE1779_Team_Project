const { AppError } = require("../../core/http/errors");

function uploadListingImages(_req, _res, next) {
  return next(
    new AppError(501, "UPLOAD_NOT_IMPLEMENTED", "Multipart image upload is not implemented in this template.")
  );
}

module.exports = {
  uploadListingImages,
};
