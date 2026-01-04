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
    const email = 'engin.coban@penta.com.tr';
    const password = 'Test1234!';
    
    // Find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('User not found');
      await pool.end();
      return;
    }
    
    const user = userResult.rows[0];
    console.log('User found:', { id: user.id, email: user.email, is_active: user.is_active });
    
    // Check active
    if (!user.is_active) {
      console.log('User is not active');
      await pool.end();
      return;
    }
    
    // Verify password
    console.log('Verifying password...');
    console.log('Hash:', user.password_hash.substring(0, 30) + '...');
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);
    
    if (isValid) {
      console.log('\n✅ Login would be successful!');
    } else {
      console.log('\n❌ Password verification failed');
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
})();
