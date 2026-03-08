const express = require("express");

const listingsController = require("../controllers/listings.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/requireRole.middleware");
const { requireListingOwner } = require("../middleware/requireListingOwner.middleware");
const { uploadListingImages } = require("../middleware/upload.middleware");
const { USER_ROLES } = require("../../config/constants");

const router = express.Router();

router.get("/", listingsController.listPublicListings);
router.get("/:id", listingsController.getListingById);
router.post("/", authMiddleware, requireRole(USER_ROLES.SELLER), listingsController.createListing);
router.patch(
  "/:id",
  authMiddleware,
  requireRole(USER_ROLES.SELLER),
  requireListingOwner,
  listingsController.updateListing
);
router.delete("/:id", authMiddleware, requireRole(USER_ROLES.SELLER), requireListingOwner, listingsController.deleteListing);
router.post("/:id/publish", authMiddleware, requireRole(USER_ROLES.SELLER), requireListingOwner, listingsController.publishListing);
router.post("/:id/unpublish", authMiddleware, requireRole(USER_ROLES.SELLER), requireListingOwner, listingsController.unpublishListing);
router.post(
  "/:id/images",
  authMiddleware,
  requireRole(USER_ROLES.SELLER),
  requireListingOwner,
  uploadListingImages,
  listingsController.uploadListingImages
);
router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  requireRole(USER_ROLES.SELLER),
  requireListingOwner,
  listingsController.deleteListingImage
);
router.post("/:id/report", authMiddleware, requireRole(USER_ROLES.BUYER), listingsController.reportListing);

module.exports = {
  listingsRouter: router,
};
