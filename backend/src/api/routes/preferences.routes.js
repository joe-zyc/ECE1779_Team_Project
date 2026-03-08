const express = require("express");

const preferencesController = require("../controllers/preferences.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/requireRole.middleware");
const { USER_ROLES } = require("../../config/constants");

const router = express.Router();

router.use(authMiddleware, requireRole(USER_ROLES.BUYER));

router.post("/", preferencesController.createPreference);
router.get("/", preferencesController.listPreferences);
router.patch("/:id", preferencesController.updatePreference);
router.delete("/:id", preferencesController.deletePreference);

module.exports = {
  preferencesRouter: router,
};
