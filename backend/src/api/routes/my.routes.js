const express = require("express");

const listingsController = require("../controllers/listings.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/requireRole.middleware");
const { USER_ROLES } = require("../../config/constants");

const router = express.Router();

router.get("/listings", authMiddleware, requireRole(USER_ROLES.SELLER), listingsController.listMyListings);

module.exports = {
  myRouter: router,
};
