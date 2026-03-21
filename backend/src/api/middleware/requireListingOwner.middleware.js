const { Pool } = require("pg");

const { AppError } = require("../../core/http/errors");
const { env } = require("../../config/env");

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
});

async function requireListingOwner(req, _res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT seller_id FROM car_listings WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError(404, "NOT_FOUND", "Listing not found."));
    }

    if (result.rows[0].seller_id !== userId) {
      return next(new AppError(403, "FORBIDDEN", "You do not own this listing."));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  requireListingOwner,
};
