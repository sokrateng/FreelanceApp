-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    estimated_hours DECIMAL(5, 2),
    actual_hours DECIMAL(5, 2),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample tasks for testing
INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date, estimated_hours)
SELECT
    u.id,
    p.id,
    'Design homepage mockup',
    'Create initial design concepts for the homepage',
    'in_progress',
    'high',
    '2025-01-15',
    8.0
FROM users u
JOIN projects p ON p.user_id = u.id
WHERE u.email = 'admin@example.com' AND p.name = 'Website Redesign'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (user_id, project_id, title, description, status, priority, estimated_hours)
SELECT
    u.id,
    p.id,
    'Setup development environment',
    'Configure Node.js, React, and tooling',
    'done',
    'high',
    4.0
FROM users u
JOIN projects p ON p.user_id = u.id
WHERE u.email = 'admin@example.com' AND p.name = 'Website Redesign'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (user_id, project_id, title, description, status, priority, estimated_hours)
SELECT
    u.id,
    p.id,
    'Implement user authentication',
    'Add login, register, and password reset functionality',
    'todo',
    'urgent',
    12.0
FROM users u
JOIN projects p ON p.user_id = u.id
WHERE u.email = 'admin@example.com' AND p.name = 'Website Redesign'
ON CONFLICT DO NOTHING;

-- Verify table creation
SELECT 'Tasks table created successfully!' AS message;
