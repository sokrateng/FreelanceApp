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
    const result = await pool.query(
      "SELECT id, email, is_active FROM users WHERE email = 'engin.coban@penta.com.tr'"
    );
    
    if (result.rows.length > 0) {
      console.log('User found:', result.rows[0]);
      
      if (!result.rows[0].is_active) {
        console.log('User is NOT active. Activating...');
        await pool.query(
          "UPDATE users SET is_active = true WHERE email = 'engin.coban@penta.com.tr'"
        );
        console.log('User activated');
      } else {
        console.log('User is active');
      }
    } else {
      console.log('User not found');
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
})();
