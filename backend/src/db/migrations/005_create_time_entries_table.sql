-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    description TEXT,
    hours DECIMAL(5, 2) NOT NULL CHECK (hours > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO time_entries (user_id, task_id, project_id, description, hours, date, billable)
SELECT
    u.id,
    t.id,
    t.project_id,
    'Initial design work',
    2.5,
    CURRENT_DATE,
    true
FROM users u
CROSS JOIN tasks t
WHERE u.email = 'test@example.com'
LIMIT 1;

INSERT INTO time_entries (user_id, task_id, project_id, description, hours, date, billable)
SELECT
    u.id,
    t.id,
    t.project_id,
    'Review and feedback',
    1.0,
    CURRENT_DATE - INTERVAL '1 day',
    true
FROM users u
CROSS JOIN tasks t
WHERE u.email = 'test@example.com'
OFFSET 1
LIMIT 1;

INSERT INTO time_entries (user_id, project_id, description, hours, date, billable)
SELECT
    u.id,
    p.id,
    'Project planning meeting',
    1.5,
    CURRENT_DATE - INTERVAL '2 days',
    true
FROM users u
CROSS JOIN projects p
WHERE u.email = 'test@example.com'
LIMIT 2;
