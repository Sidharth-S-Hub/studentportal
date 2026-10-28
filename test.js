const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('UPDATE admins SET totp_enabled = false, totp_secret = NULL');
    console.log('Postgres Admin 2FA reset:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
