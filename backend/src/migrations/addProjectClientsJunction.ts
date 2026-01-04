import pool from '../config/database';

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Starting migration: Add project_clients junction table');

    // Create project_clients junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_clients (
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, client_id)
      )
    `);
    console.log('✓ Created project_clients junction table');

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
