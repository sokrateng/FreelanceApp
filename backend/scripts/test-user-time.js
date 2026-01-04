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
    // Check engin.coban user
    const user = await pool.query("SELECT id, email, first_name FROM users WHERE email = 'engin.coban@penta.com.tr'");
    
    if (user.rows.length === 0) {
      console.log('User engin.coban@penta.com.tr not found');
    } else {
      const userId = user.rows[0].id;
      console.log('User:', user.rows[0]);
      console.log('User ID:', userId);
      
      // Check time entries for this user
      const timeEntries = await pool.query('SELECT COUNT(*) as count FROM time_entries WHERE user_id = $1', [userId]);
      console.log('Time entries count:', timeEntries.rows[0].count);
      
      // Test the stats query
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log('\nTesting stats query:');
      console.log('Today:', today);
      console.log('Week ago:', weekAgo);
      
      const statsResult = await pool.query(
        'SELECT COALESCE(SUM(hours), 0) as hours FROM time_entries WHERE user_id = $1 AND date >= $2',
        [userId, weekAgo]
      );
      console.log('Stats result:', statsResult.rows[0]);
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
})();
