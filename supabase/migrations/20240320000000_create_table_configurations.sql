-- Create table_configurations table
CREATE TABLE table_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    columns JSONB NOT NULL,
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index on table_name for faster lookups
CREATE INDEX idx_table_configurations_table_name ON table_configurations(table_name);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_table_configurations_updated_at
    BEFORE UPDATE ON table_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial configuration for the customers table
INSERT INTO table_configurations (table_name, columns, options)
VALUES (
    'customers',
    '[
        {
            "key": "Customer Id",
            "label": "ID",
            "width": 100
        },
        {
            "key": "name",
            "label": "Name",
            "width": 200,
            "render": {
                "type": "composite",
                "fields": ["First Name", "Last Name"]
            },
            "filterFn": "name"
        },
        {
            "key": "Email",
            "label": "Email",
            "width": 200
        },
        {
            "key": "Company",
            "label": "Company",
            "width": 200
        },
        {
            "key": "Country",
            "label": "Country",
            "width": 120
        },
        {
            "key": "City",
            "label": "City",
            "width": 150
        },
        {
            "key": "Phone 1",
            "label": "Phone",
            "width": 150
        },
        {
            "key": "Website",
            "label": "Website",
            "width": 200,
            "render": {
                "type": "link"
            }
        },
        {
            "key": "Subscription Date",
            "label": "Subscription Date",
            "type": "date",
            "width": 150
        }
    ]'::jsonb,
    '{
        "selectable": true,
        "title": "Customers",
        "description": "Manage your customer relationships",
        "actions": [
            {
                "label": "Copy ID",
                "action": "copyId"
            },
            {
                "label": "View Details",
                "action": "viewDetails"
            },
            {
                "label": "Edit",
                "action": "edit"
            }
        ]
    }'::jsonb
); 