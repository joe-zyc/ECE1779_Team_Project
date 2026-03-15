const pool = require("./src/config/db");

async function testDb() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB connected:", result.rows[0]);
  } catch (err) {
    console.error("DB connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

testDb();