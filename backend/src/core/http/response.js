function sendData(res, data, meta) {
  const payload = { data };

  if (meta) {
    payload.meta = meta;
  }

  return res.json(payload);
}

function sendError(res, error) {
  return res.status(error.statusCode || 500).json({
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "Unexpected server error.",
      details: error.details || null,
    },
  });
}

function sendNotImplemented(res, feature) {
  return res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: `${feature} is not implemented in this template.`,
      details: null,
    },
  });
}

module.exports = {
  sendData,
  sendError,
  sendNotImplemented,
};
