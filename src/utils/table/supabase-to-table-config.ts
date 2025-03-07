import { TableConfig, TableColumn } from "../table-config-utils";
import { SupabaseColumn } from "@/types/table";
import { createClient } from "@/utils/supabase/client";
import { handleSupabaseError } from "@/utils/supabase-error-handler";

export function convertSupabaseToTableConfig(
  tableName: string,
  data: SupabaseColumn[],
  name: string,
  description: string
): TableConfig {
  const columns: TableColumn[] = data.map((col: SupabaseColumn) => {
    const type = mapSupabaseTypeToTableType(col.type);
    return {
      id: col.name,
      name: col.name,
      type,
      isNullable: col.is_nullable,
      defaultValue: col.default_value,
      comment: col.comment
    };
  });

  return {
    name,
    description,
    columns,
    filters: [] // Default empty filters array
  };
}

export async function generateTableConfigFromDefinition(
  tableName: string,
  options: {
    description: string;
    excludeColumns?: string[];
    includeSelect?: boolean;
    includeActions?: boolean;
    customColumns?: TableColumn[];
    customFilters?: Array<{
      column: string;
      type: 'text' | 'faceted';
      placeholder?: string;
      options?: Array<{ label: string; value: string }>;
      useOptionsFromColumn?: boolean;
    }>;
  }
): Promise<TableConfig | null> {
  try {
    const supabase = createClient();
    
    // Get table definition from our table_definitions table
    const { data: definition, error: definitionError } = await supabase
      .from('table_definitions')
      .select('*')
      .eq('table_name', tableName)
      .single();

    if (definitionError || !definition) {
      handleSupabaseError(definitionError || new Error('Table definition not found'), {
        context: `fetching table definition for ${tableName}`,
        fallbackMessage: "Failed to fetch table definition."
      });
      return null;
    }

    // Handle case where columns is null
    const columns = definition.columns as SupabaseColumn[] || [];
    const convertedColumns = columns.map(col => ({
      id: col.name,
      name: col.name,
      type: mapSupabaseTypeToTableType(col.type),
      isNullable: col.is_nullable,
      defaultValue: col.default_value,
      comment: col.comment
    })).filter(col => col.name && col.type);

    // If no columns were converted, return null
    if (convertedColumns.length === 0) {
      console.warn(`No valid columns found for table ${tableName}`);
      return null;
    }

    return {
      name: tableName,
      description: options.description,
      columns: convertedColumns,
      filters: [],
    };
  } catch (error: any) {
    handleSupabaseError(error, { 
      context: `Supabase table configuration generation for ${tableName}`,
      fallbackMessage: `Failed to generate table configuration from Supabase for ${tableName}. Please check your configuration.`
    });
    return null;
  }
}

function mapSupabaseTypeToTableType(supabaseType: string): TableColumn["type"] {
  switch (supabaseType.toLowerCase()) {
    case "integer":
    case "bigint":
    case "smallint":
    case "numeric":
    case "decimal":
    case "real":
    case "double precision":
      return "number";
    case "boolean":
      return "boolean";
    case "character varying":
    case "varchar":
    case "text":
    case "char":
      return "text";
    case "date":
    case "timestamp":
    case "timestamp with time zone":
    case "timestamp without time zone":
      return "date";
    case "json":
    case "jsonb":
      return "json";
    default:
      return "text"; // Default to text for unknown types
  }
} 