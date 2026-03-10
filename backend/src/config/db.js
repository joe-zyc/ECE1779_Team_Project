const { Pool } = require("pg");
const { env } = require("./env");

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.connect()
  .then((client) => {
    console.log("PostgreSQL connected successfully.");
    client.release();
  })
  .catch((err) => {
    console.error("Failed to connect to PostgreSQL:", err.message);
  });

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

module.exports = pool;