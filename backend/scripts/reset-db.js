const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'freelance_pm_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function resetDatabase() {
  try {
    console.log('🗑️  Dropping existing tables...');

    // Drop tables in correct order (respecting foreign keys)
    await pool.query('DROP TABLE IF EXISTS clients CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');

    console.log('✅ Tables dropped successfully!');
    console.log('\nNow run: npm run migrate');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetDatabase();
