import { createClient } from "@/utils/supabase/client";
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { Database } from "@/types/supabase";
import { TableDefinition, SupabaseColumn } from "@/types/table";

type TableName = keyof Database['public']['Tables'];
type TableDefinitionsTable = Database['public']['Tables']['table_definitions'];

const SYSTEM_TABLES = ['table_definitions', 'form_definitions'] as const;

/**
 * Gets a table definition from the database
 * @param tableName The name of the table to get the definition for
 * @returns The table definition or null if not found
 */
export async function getTableDefinition(tableName: string): Promise<TableDefinition | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('table_definitions' as typeof SYSTEM_TABLES[number])
      .select('*')
      .eq('table_name', tableName)
      .single();

    if (error) {
      console.error('Error fetching table definition:', error);
      return null;
    }

    // Convert the data to the correct type
    const tableData = data as TableDefinitionsTable['Row'];
    return {
      table_name: tableData.table_name,
      schema_name: tableData.schema_name,
      columns: tableData.columns as TableDefinition['columns'],
      name: tableData.name,
      description: tableData.description
    };
  } catch (error) {
    console.error('Error in getTableDefinition:', error);
    return null;
  }
}

/**
 * Creates a new table definition with column information from the database
 * @param tableName The name of the table to create a definition for
 * @throws {Error} When the table doesn't exist or there's an error generating the definition
 * @returns true if successful
 */
export async function generateAndSaveTableDefinition(tableName: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    // First check if the table exists in the database
    const { error: tableCheckError } = await supabase
      .from(tableName as TableName)
      .select('count')
      .limit(1);

    if (tableCheckError) {
      // If the error is "relation does not exist", throw an error
      if (tableCheckError.code === '42P01') {
        throw new Error(`Table "${tableName}" does not exist in the database`);
      }
      handleSupabaseError(tableCheckError, {
        context: `checking if table "${tableName}" exists`,
        fallbackMessage: "Failed to check if table exists."
      });
      return false;
    }

    // Check if definition already exists
    const { data: existingDefinition, error: fetchError } = await supabase
      .from('table_definitions' as typeof SYSTEM_TABLES[number])
      .select('*')
      .eq('table_name', tableName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Not found
      handleSupabaseError(fetchError, {
        context: `checking table definition for "${tableName}"`,
        fallbackMessage: "Failed to check table definition."
      });
      return false;
    }

    // If definition exists and has columns, return true
    if (existingDefinition && 'columns' in existingDefinition && existingDefinition.columns) {
      return true;
    }

    // Get column information from the database
    const { data: columns, error: columnsError } = await supabase
      .from(tableName as TableName)
      .select('*')
      .limit(1);

    if (columnsError) {
      handleSupabaseError(columnsError, {
        context: `fetching column information for "${tableName}"`,
        fallbackMessage: "Failed to fetch column information."
      });
      return false;
    }

    // Create column definitions from the first row or create basic definitions
    const columnDefinitions: SupabaseColumn[] = columns && columns.length > 0
      ? Object.entries(columns[0]).map(([name, value]) => ({
          name,
          type: typeof value === 'string' ? 'text' :
                typeof value === 'number' ? 'number' :
                typeof value === 'boolean' ? 'boolean' :
                value instanceof Date ? 'date' :
                Array.isArray(value) ? 'json' :
                typeof value === 'object' ? 'json' : 'text',
          is_nullable: true, // Default to true since we can't determine from a single row
        }))
      : [
          // Basic column definitions for common fields
          { name: 'id', type: 'text', is_nullable: false },
          { name: 'created_at', type: 'date', is_nullable: true },
          { name: 'updated_at', type: 'date', is_nullable: true },
          // Add more default columns based on table name
          ...(tableName === 'payments' ? [
            { name: 'amount', type: 'number', is_nullable: true },
            { name: 'status', type: 'text', is_nullable: true },
            { name: 'email', type: 'text', is_nullable: true },
          ] : []),
        ];

    // Generate default name and description if not provided
    const defaultName = tableName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const defaultDescription = `View and manage ${tableName.replace(/_/g, ' ')}`;

    // Create or update the table definition
    const { error: upsertError } = await supabase
      .from('table_definitions' as typeof SYSTEM_TABLES[number])
      .upsert({
        table_name: tableName,
        schema_name: 'public',
        columns: columnDefinitions,
        name: defaultName,
        description: defaultDescription,
      } as TableDefinitionsTable['Insert'], {
        onConflict: 'table_name'
      });

    if (upsertError) {
      handleSupabaseError(upsertError, {
        context: `saving table definition for "${tableName}"`,
        fallbackMessage: "Failed to save table definition."
      });
      return false;
    }

    return true;
  } catch (error: any) {
    // If it's our custom error, rethrow it
    if (error.message.includes('does not exist in the database')) {
      throw error;
    }
    handleSupabaseError(error, {
      context: `generating table definition for "${tableName}"`,
      fallbackMessage: "Failed to generate table definition."
    });
    return false;
  }
}

export async function saveTableDefinition(tableName: string, definition: TableDefinition): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('table_definitions' as typeof SYSTEM_TABLES[number])
      .upsert({
        table_name: tableName,
        schema_name: definition.schema_name,
        columns: definition.columns,
        name: definition.name,
        description: definition.description
      } as TableDefinitionsTable['Insert'], {
        onConflict: 'table_name'
      });

    if (error) {
      console.error('Error saving table definition:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveTableDefinition:', error);
    return false;
  }
}

export async function getOrCreateTableDefinition(tableName: string): Promise<TableDefinition | null> {
  return getTableDefinition(tableName);
} 