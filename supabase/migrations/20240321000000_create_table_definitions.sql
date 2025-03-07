-- Create table_definitions table
CREATE TABLE table_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    schema_name TEXT NOT NULL DEFAULT 'public',
    columns JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index on table_name for faster lookups
CREATE INDEX idx_table_definitions_table_name ON table_definitions(table_name);

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_table_definitions_updated_at
    BEFORE UPDATE ON table_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 