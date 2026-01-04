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

async function updateAdminPassword() {
  try {
    const password = 'Admin123!';
    const hash = await bcrypt.hash(password, 12);

    await pool.query(
      'UPDATE users SET password_hash = $1, role = $2 WHERE email = $3',
      [hash, 'admin', 'admin@example.com']
    );

    console.log('✅ Admin password updated successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();
