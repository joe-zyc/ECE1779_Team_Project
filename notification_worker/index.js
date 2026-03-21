require("dotenv").config();

const { Pool } = require("pg");
const sgMail = require("@sendgrid/mail");
const MAX_LISTINGS_PER_BUYER = 3;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is required");
if (!process.env.SENDGRID_FROM_EMAIL) throw new Error("SENDGRID_FROM_EMAIL is required");
if (!process.env.APP_BASE_URL) throw new Error("APP_BASE_URL is required");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function formatPrice(price) {
  if (price == null) return "N/A";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(price);
}

function buildListingUrl(listingId) {
  return `${process.env.APP_BASE_URL.replace(/\/$/, "")}/listings/${listingId}`;
}

async function fetchMatches(client) {
  const query = `
    SELECT
      l.id AS listing_id,
      l.make,
      l.model,
      l.trim,
      l.year,
      l.price,
      l.mileage_km,
      l.color,
      l.published_at,
      u.id AS buyer_id,
      u.email AS buyer_email,
      u.display_name AS buyer_name
    FROM car_listings l
    JOIN buyer_preferences bp
      ON bp.is_active = TRUE
    JOIN users u
      ON u.id = bp.buyer_id
     AND u.role = 'buyer'
     AND u.is_active = TRUE
    LEFT JOIN listing_notifications ln
      ON ln.listing_id = l.id
     AND ln.buyer_id = u.id
    WHERE l.status = 'published'
      AND l.published_at IS NOT NULL
      AND l.published_at >= NOW() - INTERVAL '24 hours'
      AND ln.id IS NULL
      AND (bp.make IS NULL OR LOWER(bp.make) = LOWER(l.make))
      AND (bp.model IS NULL OR LOWER(bp.model) = LOWER(l.model))
      AND (bp.year_min IS NULL OR l.year >= bp.year_min)
      AND (bp.year_max IS NULL OR l.year <= bp.year_max)
      AND (bp.price_max_cad IS NULL OR l.price <= bp.price_max_cad)
      AND (bp.mileage_max_km IS NULL OR l.mileage_km <= bp.mileage_max_km)
      AND (bp.color IS NULL OR LOWER(bp.color) = LOWER(l.color))
    ORDER BY u.id, l.published_at DESC
  `;

  const result = await client.query(query);
  return result.rows;
}

function buildEmailForMultipleListings(firstMatch, matches) {
  const listingsHtml = matches.map(m => `
    <li>
      <strong>${m.year} ${m.make} ${m.model}</strong><br/>
      Price: ${formatPrice(m.price)}<br/>
      Mileage: ${m.mileage_km ?? "N/A"} km<br/>
      <a href="${buildListingUrl(m.listing_id)}">View listing</a>
    </li>
  `).join("");

  return {
    to: firstMatch.buyer_email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `New listings matching your preferences`,
    html: `
      <p>Hello ${firstMatch.buyer_name || "Buyer"},</p>
      <p>Here are new listings that match your preferences:</p>
      <ul>
        ${listingsHtml}
      </ul>
    `
  };
}

async function runJob() {
  const client = await pool.connect();

  try {
    const matches = await fetchMatches(client);
    const matchesByBuyer = {};
    console.log(`Found ${matches.length} matches`);

  for (const match of matches) {
    if (!matchesByBuyer[match.buyer_id]) {
      matchesByBuyer[match.buyer_id] = [];
    }
    matchesByBuyer[match.buyer_id].push(match);
  }

  for (const buyerId in matchesByBuyer) {
    const buyerMatches = matchesByBuyer[buyerId]
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, MAX_LISTINGS_PER_BUYER);

    const firstMatch = buyerMatches[0];

    try {
      const email = buildEmailForMultipleListings(firstMatch, buyerMatches);

      console.log("Sending to:", email.to);
      console.log("Sending from:", email.from);
      console.log("Subject:", email.subject);

      await sgMail.send(email);

      console.log(`Sent ${buyerMatches.length} listings to buyer ${buyerId}`);
    } catch (err) {
      console.error(`Failed for buyer ${buyerId}:`, err.message);

      if (err.response && err.response.body) {
        console.error(
          "SendGrid error body:",
          JSON.stringify(err.response.body, null, 2)
        );
      }
    }
  }
  } finally {
    client.release();
    await pool.end();
    }
  }

runJob()
  .then(() => {
    console.log("Notification job completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Notification job failed:", err);
    process.exit(1);
  });