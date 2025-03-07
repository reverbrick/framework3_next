-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON customers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert table definition
INSERT INTO table_definitions (table_name, name, description, columns)
VALUES (
    'customers',
    'Customers',
    'Customer information and contact details',
    ARRAY[
        jsonb_build_object(
            'name', 'id',
            'type', 'uuid',
            'is_nullable', false,
            'is_primary', true
        ),
        jsonb_build_object(
            'name', 'name',
            'type', 'text',
            'is_nullable', false,
            'is_primary', false
        ),
        jsonb_build_object(
            'name', 'email',
            'type', 'text',
            'is_nullable', false,
            'is_primary', false
        ),
        jsonb_build_object(
            'name', 'phone',
            'type', 'text',
            'is_nullable', true,
            'is_primary', false
        ),
        jsonb_build_object(
            'name', 'address',
            'type', 'text',
            'is_nullable', true,
            'is_primary', false
        ),
        jsonb_build_object(
            'name', 'created_at',
            'type', 'timestamp with time zone',
            'is_nullable', false,
            'is_primary', false
        ),
        jsonb_build_object(
            'name', 'updated_at',
            'type', 'timestamp with time zone',
            'is_nullable', false,
            'is_primary', false
        )
    ]
); 