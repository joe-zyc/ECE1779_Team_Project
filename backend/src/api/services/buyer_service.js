const pool = require("../../config/db");

const getPublishedListings = async () => {
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
    WHERE l.status = 'published'
    ORDER BY l.published_at DESC NULLS LAST, l.created_at DESC, l.id DESC;
  `;

  const result = await pool.query(query);
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