const { AppError } = require("../../core/http/errors");

function requireListingOwner(_req, _res, next) {
  return next(
    new AppError(
      501,
      "LISTING_OWNERSHIP_NOT_IMPLEMENTED",
      "Listing ownership enforcement is not implemented in this template."
    )
  );
}

module.exports = {
  requireListingOwner,
};
