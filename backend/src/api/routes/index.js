const express = require("express");

const { authRouter } = require("./auth.routes");
const { listingsRouter } = require("./listings.routes");
const { myRouter } = require("./my.routes");
const { preferencesRouter } = require("./preferences.routes");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/listings", listingsRouter);
router.use("/my", myRouter);
router.use("/preferences", preferencesRouter);

module.exports = {
  apiRouter: router,
};
