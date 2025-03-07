-- Create form_definitions table
CREATE TABLE IF NOT EXISTS form_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_name TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  layout JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE form_definitions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable public read access" ON form_definitions
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users only" ON form_definitions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Enable update for authenticated users only" ON form_definitions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Enable delete for authenticated users only" ON form_definitions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_form_definitions_updated_at
  BEFORE UPDATE ON form_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 