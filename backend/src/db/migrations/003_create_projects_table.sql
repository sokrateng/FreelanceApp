-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    budget DECIMAL(12, 2),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample projects for testing
INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date)
SELECT
    u.id,
    c.id,
    'Website Redesign',
    'Complete redesign of company website with new branding',
    'active',
    15000.00,
    '2025-01-01',
    '2025-03-31'
FROM users u
JOIN clients c ON c.user_id = u.id
WHERE u.email = 'admin@example.com' AND c.name = 'Acme Corporation'
ON CONFLICT DO NOTHING;

INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date)
SELECT
    u.id,
    c.id,
    'E-commerce Platform',
    'Build a custom e-commerce solution with payment integration',
    'planning',
    45000.00,
    '2025-02-01'
FROM users u
JOIN clients c ON c.user_id = u.id
WHERE u.email = 'admin@example.com' AND c.name = 'Acme Corporation'
ON CONFLICT DO NOTHING;

-- Verify table creation
SELECT 'Projects table created successfully!' AS message;
