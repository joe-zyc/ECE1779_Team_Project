const pool = require("../../config/db");

const getPublishedListings = async (filters = {}) => {
  const conditions = [`l.status = 'published'`];
  const values = [];
  let index = 1;

  // text filters
  if (filters.make) {
    conditions.push(`l.make = $${index++}`);
    values.push(filters.make);
  }

  if (filters.model) {
    conditions.push(`l.model = $${index++}`);
    values.push(filters.model);
  }

  if (filters.trim) {
    conditions.push(`l.trim = $${index++}`);
    values.push(filters.trim);
  }

  if (filters.bodyType) {
    conditions.push(`l.body_type = $${index++}`);
    values.push(filters.bodyType);
  }

  if (filters.color) {
    conditions.push(`l.color = $${index++}`);
    values.push(filters.color);
  }

  // year range
  if (filters.yearMin) {
    conditions.push(`l.year >= $${index++}`);
    values.push(Number(filters.yearMin));
  }

  if (filters.yearMax) {
    conditions.push(`l.year <= $${index++}`);
    values.push(Number(filters.yearMax));
  }

  // price range
  if (filters.priceMin) {
    conditions.push(`l.price >= $${index++}`);
    values.push(Number(filters.priceMin));
  }

  if (filters.priceMax) {
    conditions.push(`l.price <= $${index++}`);
    values.push(Number(filters.priceMax));
  }

  // mileage range
  if (filters.mileageMin) {
    conditions.push(`l.mileage_km >= $${index++}`);
    values.push(Number(filters.mileageMin));
  }

  if (filters.mileageMax) {
    conditions.push(`l.mileage_km <= $${index++}`);
    values.push(Number(filters.mileageMax));
  }

  const allowedSortFields = [
    "price",
    "year",
    "mileage_km",
    "created_at",
    "published_at",
  ];

  const sort = allowedSortFields.includes(filters.sort)
    ? filters.sort
    : "published_at";

  const order = filters.order === "asc" ? "ASC" : "DESC";

  const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
  const limit = Number(filters.limit) > 0 ? Number(filters.limit) : 10;
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      l.id,
      l.make,
      l.model,
      l.trim,
      l.year,
      l.body_type AS "bodyType",
      l.color,
      l.mileage_km AS "mileageKm",
      l.price,
      l.description,
      l.contact_email AS "contactEmail",
      l.contact_phone AS "contactPhone",
      l.published_at AS "publishedAt",
      l.created_at AS "createdAt",
      l.updated_at AS "updatedAt",
      (
        SELECT i.storage_path
        FROM car_listing_images i
        WHERE i.listing_id = l.id
        ORDER BY i.created_at ASC, i.id ASC
        LIMIT 1
      ) AS "thumbnailUrl"
    FROM car_listings l
    WHERE ${conditions.join(" AND ")}
    ORDER BY l.${sort} ${order}
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

const getPublishedListingById = async (listingId) => {
  const listingQuery = `
    SELECT
      l.id,
      l.seller_id AS "sellerId",
      l.make,
      l.model,
      l.trim,
      l.year,
      l.vin,
      l.body_type AS "bodyType",
      l.color,
      l.mileage_km AS "mileageKm",
      l.price,
      l.description,
      l.contact_email AS "contactEmail",
      l.contact_phone AS "contactPhone",
      l.status,
      l.published_at AS "publishedAt",
      l.created_at AS "createdAt",
      l.updated_at AS "updatedAt"
    FROM car_listings l
    WHERE l.id = $1
      AND l.status = 'published';
  `;

  const imageQuery = `
    SELECT
      id,
      storage_path AS "url",
      created_at AS "createdAt"
    FROM car_listing_images
    WHERE listing_id = $1
    ORDER BY created_at ASC, id ASC;
  `;

  const listingResult = await pool.query(listingQuery, [listingId]);

  if (listingResult.rows.length === 0) {
    return null;
  }

  const listing = listingResult.rows[0];
  const imageResult = await pool.query(imageQuery, [listingId]);

  return {
    ...listing,
    images: imageResult.rows,
  };
};

module.exports = {
  getPublishedListings,
  getPublishedListingById,
};