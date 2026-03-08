const { buildNotImplementedHandler } = require("./_template");

const listPublicListings = buildNotImplementedHandler("GET /listings");
const getListingById = buildNotImplementedHandler("GET /listings/:id");
const createListing = buildNotImplementedHandler("POST /listings");
const updateListing = buildNotImplementedHandler("PATCH /listings/:id");
const deleteListing = buildNotImplementedHandler("DELETE /listings/:id");
const publishListing = buildNotImplementedHandler("POST /listings/:id/publish");
const unpublishListing = buildNotImplementedHandler("POST /listings/:id/unpublish");
const listMyListings = buildNotImplementedHandler("GET /my/listings");
const uploadListingImages = buildNotImplementedHandler("POST /listings/:id/images");
const deleteListingImage = buildNotImplementedHandler("DELETE /listings/:id/images/:imageId");
const reportListing = buildNotImplementedHandler("POST /listings/:id/report");

module.exports = {
  listPublicListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  publishListing,
  unpublishListing,
  listMyListings,
  uploadListingImages,
  deleteListingImage,
  reportListing,
};
