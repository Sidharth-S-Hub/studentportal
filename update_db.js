const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_vjKzQyItCO02@ep-cold-frog-b5rhu6ck-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require' });
pool.query("DELETE FROM students; DELETE FROM admins WHERE id != 1; ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';")
  .then(() => { console.log('Done'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
