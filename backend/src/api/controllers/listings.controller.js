const { Pool } = require("pg");
const path = require("path");

//const { notifyMatchingBuyers } = require("../../services/notification.service");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function toPublicStoragePath(filePath) {
  if (!filePath) {
    return filePath;
  }

  const normalized = String(filePath).replace(/\\/g, "/");
  const marker = "/storage/uploads/";
  const markerIndex = normalized.indexOf(marker);

  if (markerIndex >= 0) {
    return normalized.slice(markerIndex + 1);
  }

  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

const UPDATABLE_FIELDS = [
  "make",
  "model",
  "trim",
  "year",
  "vin",
  "body_type",
  "color",
  "mileage_km",
  "price",
  "description",
  "contact_email",
  "contact_phone",
];

/* ---------------------------
   GET /listings
   Public listings
--------------------------- */
const listPublicListings = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM car_listings
       WHERE status = 'published'
       ORDER BY published_at DESC`
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   GET /listings/:id
--------------------------- */
const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await pool.query(
      `SELECT * FROM car_listings WHERE id=$1`,
      [id]
    );

    if (listing.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const images = await pool.query(
      `SELECT * FROM car_listing_images WHERE listing_id=$1`,
      [id]
    );

    const imagesWithPublicPath = images.rows.map((image) => ({
      ...image,
      storage_path: toPublicStoragePath(image.storage_path),
    }));

    res.json({
      data: {
        ...listing.rows[0],
        images: imagesWithPublicPath,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /listings
   Create listing
--------------------------- */
const createListing = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const {
      make,
      model,
      trim,
      year,
      vin,
      body_type,
      color,
      mileage_km,
      price,
      description,
      contact_email,
      contact_phone,
    } = req.body;

    if (!make || !model || !year || !price) {
      return res
        .status(400)
        .json({ error: "make, model, year, and price are required" });
    }

    const result = await pool.query(
      `INSERT INTO car_listings
      (seller_id, make, model, trim, year, vin, body_type,
       color, mileage_km, price, description,
       contact_email, contact_phone)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        sellerId,
        make,
        model,
        trim,
        year,
        vin,
        body_type,
        color,
        mileage_km,
        price,
        description,
        contact_email,
        contact_phone,
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   PATCH /listings/:id
--------------------------- */
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fields = [];
    const values = [];
    let index = 1;

    for (const key of UPDATABLE_FIELDS) {
      if (key in req.body) {
        fields.push(`${key}=$${index}`);
        values.push(req.body[key]);
        index++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE car_listings
       SET ${fields.join(",")},
       updated_at = NOW()
       WHERE id=$${index}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   DELETE /listings/:id
--------------------------- */
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE car_listings
       SET status='removed',
       removed_at=NOW()
       WHERE id=$1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ message: "Listing removed" });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /listings/:id/publish
--------------------------- */
const publishListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE car_listings
       SET status='published',
       published_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = result.rows[0];

    await notifyMatchingBuyers(listing);

    res.json({ data: listing });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /listings/:id/unpublish
--------------------------- */
const unpublishListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE car_listings
       SET status='draft',
       published_at=NULL
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   GET /my/listings
--------------------------- */
const listMyListings = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const result = await pool.query(
      `SELECT *
       FROM car_listings
       WHERE seller_id=$1
       ORDER BY created_at DESC`,
      [sellerId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /listings/:id/images
--------------------------- */
const uploadListingImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const images = [];

    for (const file of files) {
      const storagePath = toPublicStoragePath(file.path);
      const result = await pool.query(
        `INSERT INTO car_listing_images
         (listing_id, storage_path)
         VALUES ($1,$2)
         RETURNING *`,
        [id, storagePath]
      );

      images.push(result.rows[0]);
    }

    res.status(201).json({ data: images });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   DELETE /listings/:id/images/:imageId
--------------------------- */
const deleteListingImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const result = await pool.query(
      `DELETE FROM car_listing_images
       WHERE id=$1 AND listing_id=$2
       RETURNING id`,
      [imageId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({ message: "Image deleted" });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /listings/:id/report
--------------------------- */
const reportListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE car_listings
       SET status='removed',
       removed_at=NOW()
       WHERE id=$1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ message: "Listing reported" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPublicListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  publishListing,
  unpublishListing,
  listMyListings,
  uploadListingImages,
  deleteListingImage,
  reportListing,
};
