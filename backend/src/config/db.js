const { Pool } = require("pg");
const { env } = require("./env");

if (!env.dbName) {
  throw new Error("Database configuration is missing.");
}

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
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