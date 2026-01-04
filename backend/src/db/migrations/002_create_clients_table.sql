-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample clients for testing
INSERT INTO clients (user_id, name, email, phone, company, address, status, notes)
SELECT
    u.id,
    'Acme Corporation',
    'contact@acme.com',
    '+1 (555) 123-4567',
    'Acme Corp',
    '123 Business St, New York, NY 10001',
    'active',
    'Main client for web development projects'
FROM users u WHERE u.email = 'admin@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO clients (user_id, name, email, phone, company, status)
SELECT
    u.id,
    'Jane Smith',
    'jane.smith@email.com',
    '+1 (555) 987-6543',
    'Smith Consulting',
    'active'
FROM users u WHERE u.email = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- Verify table creation
SELECT 'Clients table created successfully!' AS message;
