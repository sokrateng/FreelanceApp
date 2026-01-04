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
    console.log('=== USERS ===');
    const users = await pool.query('SELECT id, email, first_name FROM users LIMIT 5');
    console.log('Users:', users.rows);

    if (users.rows.length > 0) {
      const userId = users.rows[0].id;

      console.log('\n=== TIME ENTRIES FOR USER', userId, '===');
      const timeEntries = await pool.query('SELECT * FROM time_entries WHERE user_id = $1', [userId]);
      console.log('Time entries:', timeEntries.rows);

      console.log('\n=== TIME ENTRY STATS ===');
      const statsResult = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(hours), 0) as total_hours FROM time_entries WHERE user_id = $1', [userId]);
      console.log('Stats:', statsResult.rows[0]);
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
})();
