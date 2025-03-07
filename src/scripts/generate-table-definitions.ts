import { createClient } from '../utils/supabase/client';

async function generateTableDefinitions() {
  const supabase = createClient();
  
  // Get all tables from the database
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    return;
  }

  for (const table of tables) {
    const tableName = table.table_name;

    // Get column information for the table
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);

    if (columnsError) {
      console.error(`Error fetching columns for ${tableName}:`, columnsError);
      continue;
    }

    // Convert the column information to our format
    const tableColumns = columns.map(col => ({
      name: col.column_name,
      type: col.data_type.toLowerCase(),
      is_nullable: col.is_nullable === 'YES',
    }));

    // Save the table definition
    const { error } = await supabase
      .from('table_definitions')
      .upsert({
        table_name: tableName,
        schema_name: 'public',
        columns: tableColumns,
      }, {
        onConflict: 'table_name'
      });

    if (error) {
      console.error(`Error saving table definition for ${tableName}:`, error);
    } else {
      console.log(`Successfully saved table definition for ${tableName}`);
    }
  }
}

// Run the script
generateTableDefinitions().catch(console.error); 