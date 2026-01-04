const bcrypt = require('bcryptjs');
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
    const newPassword = await bcrypt.hash('Test1234!', 12);
    
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = 'engin.coban@penta.com.tr' RETURNING id, email, first_name",
      [newPassword]
    );
    
    if (result.rows.length > 0) {
      console.log('Password reset successfully for:', result.rows[0]);
      console.log('You can now login with:');
      console.log('  Email: engin.coban@penta.com.tr');
      console.log('  Password: Test1234!');
    } else {
      console.log('User not found');
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
})();
