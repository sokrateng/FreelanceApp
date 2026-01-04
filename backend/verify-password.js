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
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE email = 'engin.coban@penta.com.tr'"
    );
    
    if (result.rows.length > 0) {
      const hash = result.rows[0].password_hash;
      console.log('Hash found:', hash.substring(0, 30) + '...');
      
      // Test the password
      const isValid = await bcrypt.compare('Test1234!', hash);
      console.log('Password "Test1234!" is valid:', isValid);
      
      if (!isValid) {
        console.log('Setting new password...');
        const newHash = await bcrypt.hash('Test1234!', 12);
        await pool.query(
          "UPDATE users SET password_hash = $1 WHERE email = 'engin.coban@penta.com.tr'",
          [newHash]
        );
        console.log('Password reset complete');
        
        // Verify again
        const verifyResult = await pool.query(
          "SELECT password_hash FROM users WHERE email = 'engin.coban@penta.com.tr'"
        );
        const newValid = await bcrypt.compare('Test1234!', verifyResult.rows[0].password_hash);
        console.log('New password is valid:', newValid);
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
