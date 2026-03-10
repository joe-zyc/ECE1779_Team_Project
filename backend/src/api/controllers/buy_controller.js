const buyerService = require("../services/buyer.service");

const getPublishedListings = async (req, res) => {
  try {
    const listings = await buyerService.getPublishedListings();
    return res.status(200).json({ data: listings });
  } catch (error) {
    console.error("getPublishedListings error:", error);
    return res.status(500).json({ message: "Failed to fetch published listings." });
  }
};

const getPublishedListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await buyerService.getPublishedListingById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    return res.status(200).json({ data: listing });
  } catch (error) {
    console.error("getPublishedListingById error:", error);
    return res.status(500).json({ message: "Failed to fetch listing detail." });
  }
};

module.exports = {
  getPublishedListings,
  getPublishedListingById,
};