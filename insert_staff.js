const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_vjKzQyItCO02@ep-cold-frog-b5rhu6ck-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require' });

bcrypt.hash('staff123', 10)
  .then(hash => pool.query("INSERT INTO admins (name, email, password_hash, role) VALUES ('Portal Staff', 'staff@portal.edu', $1, 'staff')", [hash]))
  .then(() => { console.log('Staff inserted'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
