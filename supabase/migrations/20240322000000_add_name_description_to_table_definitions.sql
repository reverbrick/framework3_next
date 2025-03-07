-- Add name and description columns to table_definitions
ALTER TABLE table_definitions
ADD COLUMN name TEXT,
ADD COLUMN description TEXT;

-- Update existing records with default values based on table_name
UPDATE table_definitions
SET 
  name = INITCAP(REPLACE(table_name, '_', ' ')),
  description = 'View and manage ' || LOWER(REPLACE(table_name, '_', ' '))
WHERE name IS NULL OR description IS NULL; 