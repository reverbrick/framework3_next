import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';
import { generateAndSaveTableDefinition } from '@/utils/table/table-definition-utils';

type TableName = keyof Database['public']['Tables'];

interface TableInfo {
  table_name: string;
}

async function generateTableDefinitions() {
  const supabase = createClient();
  
  try {
    // Get all tables from the database using direct SQL
    const { data: tables, error: tablesError } = await supabase
      .from('table_definitions')
      .select('table_name');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }

    if (!tables) {
      console.log('No tables found');
      return;
    }

    // Generate definitions for each table
    for (const table of tables as TableInfo[]) {
      const tableName = table.table_name;
      console.log(`Generating definition for table: ${tableName}`);
      
      try {
        const success = await generateAndSaveTableDefinition(tableName);
        if (success) {
          console.log(`Successfully generated definition for table: ${tableName}`);
        } else {
          console.error(`Failed to generate definition for table: ${tableName}`);
        }
      } catch (error) {
        console.error(`Error generating definition for table ${tableName}:`, error);
      }
    }

    console.log('Finished generating table definitions');
  } catch (error) {
    console.error('Error in generateTableDefinitions:', error);
  }
}

// Run the script
generateTableDefinitions(); 