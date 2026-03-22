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

const UPDATABLE_FIELDS = [
  "make",
  "model",
  "year_min",
  "year_max",
  "price_max_cad",
  "mileage_max_km",
  "color",
  "is_active",
];

/* ---------------------------
   GET /preferences
   List all preferences for the authenticated buyer
--------------------------- */
const listPreferences = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM buyer_preferences
       WHERE buyer_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /preferences
   Create a new buyer preference
--------------------------- */
const createPreference = async (req, res, next) => {
  try {
    const {
      make,
      model,
      year_min,
      year_max,
      price_max_cad,
      mileage_max_km,
      color,
      is_active,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO buyer_preferences
         (id, buyer_id, make, model, year_min, year_max, price_max_cad, mileage_max_km, color, is_active)
       VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        make ?? null,
        model ?? null,
        year_min ?? null,
        year_max ?? null,
        price_max_cad ?? null,
        mileage_max_km ?? null,
        color ?? null,
        is_active !== undefined ? is_active : true,
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   PATCH /preferences/:id
   Update a buyer preference (owner only)
--------------------------- */
const updatePreference = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await pool.query(
      `SELECT id FROM buyer_preferences WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      throw new AppError(404, "NOT_FOUND", "Preference not found.");
    }

    const row = await pool.query(
      `SELECT id FROM buyer_preferences WHERE id = $1 AND buyer_id = $2`,
      [id, req.user.id]
    );

    if (row.rows.length === 0) {
      throw new AppError(403, "FORBIDDEN", "You do not own this preference.");
    }

    // Build dynamic SET clause from allowed fields present in body
    const updates = [];
    const values = [];

    for (const field of UPDATABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        values.push(req.body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      throw new AppError(400, "BAD_REQUEST", "No valid fields provided for update.");
    }

    values.push(new Date());
    updates.push(`updated_at = $${values.length}`);

    values.push(id);
    const result = await pool.query(
      `UPDATE buyer_preferences SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   DELETE /preferences/:id
   Delete a buyer preference (owner only)
--------------------------- */
const deletePreference = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT id FROM buyer_preferences WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      throw new AppError(404, "NOT_FOUND", "Preference not found.");
    }

    const row = await pool.query(
      `SELECT id FROM buyer_preferences WHERE id = $1 AND buyer_id = $2`,
      [id, req.user.id]
    );

    if (row.rows.length === 0) {
      throw new AppError(403, "FORBIDDEN", "You do not own this preference.");
    }

    await pool.query(`DELETE FROM buyer_preferences WHERE id = $1`, [id]);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPreference,
  listPreferences,
  updatePreference,
  deletePreference,
};
