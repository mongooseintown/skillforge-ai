const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.htffvdnfcxrqnbpazdcg:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('[PostgreSQL] Connected to Supabase Cloud PostgreSQL Database successfully!');
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Error] Supabase PostgreSQL Database Error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
