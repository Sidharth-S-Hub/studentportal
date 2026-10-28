require('dotenv').config({ path: 'backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  /* ssl removed */
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id BIGSERIAL PRIMARY KEY,
        ticket_id VARCHAR(20) UNIQUE NOT NULL,
        student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        attachment_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        admin_remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table created");
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();

