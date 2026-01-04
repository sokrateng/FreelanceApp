const { Pool } = require('pg');
require('dotenv').config();

console.log('Database config:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Port:', process.env.DB_PORT || '5432');
console.log('  Database:', process.env.DB_NAME || 'freelance_pm_dev');
console.log('  User:', process.env.DB_USER || 'postgres');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'freelance_pm_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

(async () => {
  try {
    console.log('\n🔌 Connecting to database...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful!');
    
    // Test queries
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('📊 Users count:', usersResult.rows[0].count);
    
    const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
    console.log('👥 Clients count:', clientsResult.rows[0].count);
    
    await pool.end();
    console.log('\n✅ All database operations completed successfully!');
  } catch (err) {
    console.error('❌ Database error:', err.message);
    console.error('Error details:', err);
    await pool.end();
    process.exit(1);
  }
})();
