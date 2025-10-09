-- Create wishes table
CREATE TABLE IF NOT EXISTS wishes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);

-- Create index on created_at
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
