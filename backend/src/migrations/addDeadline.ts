import pool from '../config/database';

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add deadline column to projects table');
    
    // Drop start_date and end_date columns
    await client.query(`ALTER TABLE projects DROP COLUMN IF EXISTS start_date`);
    console.log('✓ Dropped start_date column');
    
    await client.query(`ALTER TABLE projects DROP COLUMN IF EXISTS end_date`);
    console.log('✓ Dropped end_date column');
    
    // Add deadline column
    await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline DATE`);
    console.log('✓ Added deadline column');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end(); // Close the pool
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
