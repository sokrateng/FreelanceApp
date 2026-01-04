const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'freelance_pm_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runTaskMigration() {
  try {
    console.log('🚀 Running tasks migration...\n');

    const sql = fs.readFileSync('./src/db/migrations/004_create_tasks_table.sql', 'utf8');

    await pool.query(sql);

    console.log('✅ Tasks migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await pool.end();
  }
}

runTaskMigration();
