import { createClient } from "@/utils/supabase/client";
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { Database } from "@/types/supabase";

export type SupabaseColumn = {
  name: string;
  type: string;
  is_nullable: boolean;
  format?: string;
  enums?: string[];
  references?: string;
};

export type TableDefinition = {
  table_name: string;
  schema_name: string;
  columns: SupabaseColumn[];
};

type TableName = keyof Database['public']['Tables'];

/**
 * Gets a table definition from the database
 * @param tableName The name of the table to get the definition for
 * @returns The table definition or null if not found
 */
export async function getTableDefinition(tableName: string): Promise<TableDefinition | null> {
  const supabase = createClient();
  
  try {
    const { data: definition, error } = await supabase
      .from('table_definitions')
      .select('*')
      .eq('table_name', tableName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      handleSupabaseError(error, {
        context: `fetching table definition for ${tableName}`,
        fallbackMessage: "Failed to fetch table definition."
      });
      return null;
    }

    return definition;
  } catch (error: any) {
    handleSupabaseError(error, {
      context: `fetching table definition for ${tableName}`,
      fallbackMessage: "Failed to fetch table definition."
    });
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
      .from(tableName)
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
      .from('table_definitions')
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
    if (existingDefinition?.columns) {
      return true;
    }

    // Get column information from the database
    const { data: columns, error: columnsError } = await supabase
      .from(tableName)
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

    // Create or update the table definition
    const { error: upsertError } = await supabase
      .from('table_definitions')
      .upsert({
        table_name: tableName,
        schema_name: 'public',
        columns: columnDefinitions,
      }, {
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

export async function saveTableDefinition(definition: TableDefinition): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('table_definitions')
      .upsert({
        table_name: definition.table_name,
        schema_name: definition.schema_name,
        columns: definition.columns,
      }, {
        onConflict: 'table_name'
      });

    if (error) {
      handleSupabaseError(error, {
        context: `saving table definition for ${definition.table_name}`,
        fallbackMessage: "Failed to save table definition."
      });
      return false;
    }

    return true;
  } catch (error: any) {
    handleSupabaseError(error, {
      context: `saving table definition for ${definition.table_name}`,
      fallbackMessage: "Failed to save table definition."
    });
    return false;
  }
}

export async function getOrCreateTableDefinition(tableName: string): Promise<TableDefinition | null> {
  return getTableDefinition(tableName);
} 