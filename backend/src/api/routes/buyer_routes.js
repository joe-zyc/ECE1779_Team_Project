const express = require("express");
const router = express.Router();
const buyerController = require("../controllers/buyer.controller");

router.get("/listings", buyerController.getPublishedListings);
router.get("/listings/:id", buyerController.getPublishedListingById);

module.exports = router;