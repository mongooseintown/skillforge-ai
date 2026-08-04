const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function initializeSupabaseDatabase() {
  try {
    console.log('[PostgreSQL] Connecting to Supabase Cloud PostgreSQL Database...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sqlScript);
    console.log('[SUCCESS] All 4 SQL Tables (users, roadmaps, skill_audits, badges) created live on Supabase Cloud!');

    // Test inserting a default user if empty
    const res = await pool.query('SELECT COUNT(*) FROM users;');
    console.log(`[Database] Current Users Count in Supabase: ${res.rows[0].count}`);

    process.exit(0);
  } catch (err) {
    console.error('[Error] Failed to initialize Supabase Database:', err);
    process.exit(1);
  }
}

initializeSupabaseDatabase();
