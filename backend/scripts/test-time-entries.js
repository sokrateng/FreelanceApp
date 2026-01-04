const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'freelance_pm_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

(async () => {
  try {
    // Get a test user
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', ['test@example.com']);
    if (userResult.rows.length === 0) {
      console.log('No test user found');
      await pool.end();
      return;
    }
    const userId = userResult.rows[0].id;

    console.log('Testing time entries stats query for user:', userId);

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('Today:', today);
    console.log('Week ago:', weekAgo);

    const result = await pool.query('SELECT COALESCE(SUM(hours), 0) as hours FROM time_entries WHERE user_id = $1 AND date >= $2', [userId, weekAgo]);
    console.log('Query result:', result.rows[0]);

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
