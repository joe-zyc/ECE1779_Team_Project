const cors = require("cors");
const express = require("express");
const path = require("path");

const { env } = require("./config/env");
const { apiRouter } = require("./api/routes");
//const buyerRoutes = require("./api/routes/listings.routes");
const { notFoundMiddleware } = require("./api/middleware/notFound.middleware");
const { errorMiddleware } = require("./api/middleware/error.middleware");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //app.use(`${env.apiBasePath}/buyer`, buyerRoutes);

  app.get("/health/live", (_req, res) => {
    res.status(200).json({ data: { status: "ok" } });
  });

  app.get("/health/ready", (_req, res) => {
    res.status(200).json({ data: { status: "ok" } });
  });

  // Serve uploaded listing images under /storage/uploads/*
  app.use("/storage", express.static(path.resolve(process.cwd(), "storage")));

  app.use(env.apiBasePath, apiRouter);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

module.exports = {
  createApp,
};
