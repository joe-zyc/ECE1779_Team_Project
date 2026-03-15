const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

    res.json({
      data: {
        ...listing.rows[0],
        images: images.rows,
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

    for (const key in req.body) {
      fields.push(`${key}=$${index}`);
      values.push(req.body[key]);
      index++;
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

    await pool.query(
      `UPDATE car_listings
       SET status='removed',
       removed_at=NOW()
       WHERE id=$1`,
      [id]
    );

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

    const listing = result.rows[0];

    /* -------- EMAIL NOTIFICATION HOOK -------- */
    // await notifyMatchingBuyers(listing)

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

    const images = [];

    for (const file of files) {
      const result = await pool.query(
        `INSERT INTO car_listing_images
         (listing_id, storage_path)
         VALUES ($1,$2)
         RETURNING *`,
        [id, file.path]
      );

      images.push(result.rows[0]);
    }

    res.status(201).json({ data: images });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   DELETE image
--------------------------- */
const deleteListingImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    await pool.query(
      `DELETE FROM car_listing_images
       WHERE id=$1`,
      [imageId]
    );

    res.json({ message: "Image deleted" });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   REPORT listing
--------------------------- */
const reportListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE car_listings
       SET status='removed'
       WHERE id=$1`
      , [id]
    );

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