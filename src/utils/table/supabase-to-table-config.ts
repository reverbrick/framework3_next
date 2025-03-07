import { generateTableConfig } from './generate-table-config'
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { createClient } from "@/utils/supabase/client";
import { TableDefinition, SupabaseColumn } from './table-definition-utils';
import { Database } from "@/types/supabase";
import { TableColumn } from '@/utils/table-config-utils';

type SupabaseType = keyof Database['public']['Tables'][keyof Database['public']['Tables']]['Row'][keyof Database['public']['Tables'][keyof Database['public']['Tables']]['Row']]

const mapSupabaseType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'string':
      return 'text'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'date':
      return 'date'
    case 'json':
      return 'json'
    case 'enum':
      return 'badge'
    default:
      return 'text'
  }
}

const convertSupabaseColumn = (column: SupabaseColumn) => {
  const result = {
    name: column.name,
    type: mapSupabaseType(column.type),
    isNullable: column.is_nullable,
  } as const

  if (column.enums) {
    return {
      ...result,
      type: 'badge',
      enum: column.enums.reduce((acc, value) => {
        acc[value] = value.charAt(0).toUpperCase() + value.slice(1)
        return acc
      }, {} as Record<string, string>),
    }
  }

  if (column.references) {
    return {
      ...result,
      type: 'text',
      references: column.references,
    }
  }

  return result
}

export async function generateTableConfigFromDefinition(
  tableName: string,
  options: {
    description: string
    excludeColumns?: string[]
    includeSelect?: boolean
    includeActions?: boolean
    customColumns?: TableColumn[]
    customFilters?: Array<{
      column: string
      type: 'text' | 'faceted'
      placeholder?: string
      options?: Array<{ label: string; value: string }>
      useOptionsFromColumn?: boolean
    }>
  }
) {
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
    const columns = definition.columns || [];
    const convertedColumns = columns.map(convertSupabaseColumn).filter((col: { name: string; type: string }) => {
      // Filter out any columns that don't have a name or type
      return col.name && col.type;
    });

    // If no columns were converted, return null
    if (convertedColumns.length === 0) {
      console.warn(`No valid columns found for table ${tableName}`);
      return null;
    }

    return generateTableConfig(tableName, options.description, convertedColumns, options);
  } catch (error: any) {
    handleSupabaseError(error, { 
      context: `Supabase table configuration generation for ${tableName}`,
      fallbackMessage: `Failed to generate table configuration from Supabase for ${tableName}. Please check your configuration.`
    });
    return null;
  }
}

// Example usage with Supabase CLI generated types:
/*
import { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type UserTable = Tables['users']['Row']

// Convert Supabase table definition to our format
const usersTable: SupabaseTable = {
  name: 'Users',
  schema: 'public',
  columns: [
    {
      name: 'id',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'username',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'status',
      type: 'enum',
      is_nullable: false,
      enums: ['active', 'inactive', 'invited', 'suspended'],
    },
    // ... other columns
  ],
}

// Generate table config
const tableConfig = generateTableConfigFromSupabase(usersTable, {
  description: 'Manage your users and their roles here.',
  excludeColumns: ['created_at', 'updated_at'],
  customColumns: [
    {
      id: 'fullName',
      type: 'computed',
      title: 'Name',
      maxWidth: 36,
      compute: {
        fields: ['first_name', 'last_name'],
        format: '${first_name} ${last_name}',
      },
    },
  ],
})
*/ 