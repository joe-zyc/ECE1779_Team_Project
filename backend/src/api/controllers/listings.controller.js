const { buildNotImplementedHandler } = require("./_template");
const buyerService = require("../services/buyer_service");

// Buyer/Public endpoints
const listPublicListings = async (req, res) => {
  try {
    const listings = await buyerService.getPublishedListings();
    return res.status(200).json({ data: listings });
  } catch (error) {
    console.error("listPublicListings error:", error);
    return res.status(500).json({ message: "Failed to fetch published listings." });
  }
};

const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await buyerService.getPublishedListingById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    return res.status(200).json({ data: listing });
  } catch (error) {
    console.error("getListingById error:", error);
    return res.status(500).json({ message: "Failed to fetch listing detail." });
  }
};

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
