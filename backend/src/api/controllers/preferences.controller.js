const preferencesService = require("../services/preferences.service");

const createPreference = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const preference = await preferencesService.createPreference(buyerId, req.body);

    return res.status(201).json({
      message: "Preference created successfully.",
      data: preference,
    });
  } catch (error) {
    console.error("createPreference error:", error);
    return res.status(500).json({
      message: "Failed to create preference.",
    });
  }
};

const listPreferences = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const preferences = await preferencesService.listPreferences(buyerId);

    return res.status(200).json({
      data: preferences,
    });
  } catch (error) {
    console.error("listPreferences error:", error);
    return res.status(500).json({
      message: "Failed to fetch preferences.",
    });
  }
};

const updatePreference = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const updatedPreference = await preferencesService.updatePreference(
      buyerId,
      id,
      req.body
    );

    if (!updatedPreference) {
      return res.status(404).json({
        message: "Preference not found.",
      });
    }

    return res.status(200).json({
      message: "Preference updated successfully.",
      data: updatedPreference,
    });
  } catch (error) {
    console.error("updatePreference error:", error);
    return res.status(500).json({
      message: "Failed to update preference.",
    });
  }
};

const deletePreference = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const deletedPreference = await preferencesService.deletePreference(buyerId, id);

    if (!deletedPreference) {
      return res.status(404).json({
        message: "Preference not found.",
      });
    }

    return res.status(200).json({
      message: "Preference deleted successfully.",
      data: deletedPreference,
    });
  } catch (error) {
    console.error("deletePreference error:", error);
    return res.status(500).json({
      message: "Failed to delete preference.",
    });
  }
};

module.exports = {
  createPreference,
  listPreferences,
  updatePreference,
  deletePreference,
};