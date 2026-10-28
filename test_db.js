require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0,25) + '...' : 'Not Set');
console.log('DB_TYPE env:', process.env.DB_TYPE);
let dbType = process.env.DB_TYPE || 'sqlite';
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres')) dbType = 'postgres';
console.log('Calculated dbType:', dbType);
