const { buildNotImplementedHandler } = require("./_template");

const createPreference = buildNotImplementedHandler("POST /preferences");
const listPreferences = buildNotImplementedHandler("GET /preferences");
const updatePreference = buildNotImplementedHandler("PATCH /preferences/:id");
const deletePreference = buildNotImplementedHandler("DELETE /preferences/:id");

module.exports = {
  createPreference,
  listPreferences,
  updatePreference,
  deletePreference,
};
