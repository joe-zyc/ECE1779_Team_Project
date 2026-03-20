const pool = require("../../config/db");

const createPreference = async (buyerId, data) => {
  const {
    make,
    model,
    yearMin,
    yearMax,
    priceMaxCad,
    mileageMaxKm,
    color,
    isActive = true,
  } = data;

  const query = `
    INSERT INTO buyer_preferences (
      buyer_id,
      make,
      model,
      year_min,
      year_max,
      price_max_cad,
      mileage_max_km,
      color,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING
      id,
      buyer_id AS "buyerId",
      make,
      model,
      year_min AS "yearMin",
      year_max AS "yearMax",
      price_max_cad AS "priceMaxCad",
      mileage_max_km AS "mileageMaxKm",
      color,
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const values = [
    buyerId,
    make || null,
    model || null,
    yearMin || null,
    yearMax || null,
    priceMaxCad || null,
    mileageMaxKm || null,
    color || null,
    isActive,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const listPreferences = async (buyerId) => {
  const query = `
    SELECT
      id,
      buyer_id AS "buyerId",
      make,
      model,
      year_min AS "yearMin",
      year_max AS "yearMax",
      price_max_cad AS "priceMaxCad",
      mileage_max_km AS "mileageMaxKm",
      color,
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM buyer_preferences
    WHERE buyer_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [buyerId]);
  return result.rows;
};

const updatePreference = async (buyerId, preferenceId, data) => {
  const existingQuery = `
    SELECT *
    FROM buyer_preferences
    WHERE id = $1 AND buyer_id = $2;
  `;

  const existingResult = await pool.query(existingQuery, [preferenceId, buyerId]);

  if (existingResult.rows.length === 0) {
    return null;
  }

  const current = existingResult.rows[0];

  const query = `
    UPDATE buyer_preferences
    SET
      make = $1,
      model = $2,
      year_min = $3,
      year_max = $4,
      price_max_cad = $5,
      mileage_max_km = $6,
      color = $7,
      is_active = $8,
      updated_at = NOW()
    WHERE id = $9 AND buyer_id = $10
    RETURNING
      id,
      buyer_id AS "buyerId",
      make,
      model,
      year_min AS "yearMin",
      year_max AS "yearMax",
      price_max_cad AS "priceMaxCad",
      mileage_max_km AS "mileageMaxKm",
      color,
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const values = [
    data.make ?? current.make,
    data.model ?? current.model,
    data.yearMin ?? current.year_min,
    data.yearMax ?? current.year_max,
    data.priceMaxCad ?? current.price_max_cad,
    data.mileageMaxKm ?? current.mileage_max_km,
    data.color ?? current.color,
    data.isActive ?? current.is_active,
    preferenceId,
    buyerId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deletePreference = async (buyerId, preferenceId) => {
  const query = `
    DELETE FROM buyer_preferences
    WHERE id = $1 AND buyer_id = $2
    RETURNING
      id,
      buyer_id AS "buyerId";
  `;

  const result = await pool.query(query, [preferenceId, buyerId]);
  return result.rows[0] || null;
};

module.exports = {
  createPreference,
  listPreferences,
  updatePreference,
  deletePreference,
};