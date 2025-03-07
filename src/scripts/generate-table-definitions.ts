import { Database } from '../types/supabase';
import { createClient } from '../utils/supabase/client';

type TableName = keyof Database['public']['Tables'];

async function generateTableDefinitions() {
  const supabase = createClient();
  const tables = Object.keys(Database['public']['Tables']) as TableName[];

  for (const tableName of tables) {
    const tableType = Database['public']['Tables'][tableName];
    if (!tableType || !('Row' in tableType)) {
      console.error(`Table ${tableName} has no row type defined`);
      continue;
    }

    const rowType = tableType['Row'];
    if (!rowType) {
      console.error(`Table ${tableName} has no row type defined`);
      continue;
    }

    // Convert the row type to columns
    const columns = Object.entries(rowType).map(([name, type]) => {
      const typeString = String(type);
      const isNullable = typeString.includes('null');
      const baseType = typeString.replace(' | null', '').replace(' | undefined', '');
      
      return {
        name,
        type: baseType.toLowerCase(),
        is_nullable: isNullable,
      };
    });

    // Save the table definition
    const { error } = await supabase
      .from('table_definitions')
      .upsert({
        table_name: tableName,
        schema_name: 'public',
        columns,
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