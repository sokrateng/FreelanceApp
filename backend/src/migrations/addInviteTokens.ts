import pool from '../config/database';

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add invite token columns to users table');
    
    // Add invite_token column
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token TEXT`);
    console.log('✓ Added invite_token column');
    
    // Add invite_token_expiry column
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_expiry TIMESTAMP`);
    console.log('✓ Added invite_token_expiry column');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
