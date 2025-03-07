import { IconShield, IconUserShield, IconUsersGroup, IconCash } from '@tabler/icons-react'
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { TableConfig, TableColumn } from "@/utils/table-config-utils";

type ColumnType = {
  name: string;
  type: string;
  isNullable: boolean;
  format?: string;
  enum?: Record<string, string>;
  references?: string;
};

const SPECIAL_COLUMNS: Record<string, Partial<TableColumn>> = {
  id: {
    type: 'text',
    enableSorting: true,
    enableHiding: true,
  },
  created_at: {
    type: 'text',
    enableSorting: true,
    enableHiding: true,
  },
  updated_at: {
    type: 'text',
    enableSorting: true,
    enableHiding: true,
  },
};

const TYPE_MAPPINGS: Record<string, { type: TableColumn['type']; config?: Partial<TableColumn> }> = {
  text: { type: 'text' },
  varchar: { type: 'text' },
  int8: { type: 'text' },
  int4: { type: 'text' },
  bool: { type: 'text' },
  timestamp: { type: 'text' },
  date: { type: 'text' },
  jsonb: { type: 'text' },
  enum: { type: 'badge' },
};

const generateColumnConfig = (column: ColumnType): TableColumn => {
  // Check if it's a special column
  const specialConfig = SPECIAL_COLUMNS[column.name];
  if (specialConfig) {
    return {
      id: column.name,
      title: column.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      type: 'text',
      ...specialConfig,
    };
  }

  // Get base configuration from type mapping
  const baseConfig = TYPE_MAPPINGS[column.type] || { type: 'text' };

  const config: TableColumn = {
    id: column.name,
    title: column.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    type: baseConfig.type,
    enableSorting: true,
    enableHiding: true,
    ...baseConfig.config,
  };

  // Handle enum types
  if (column.type === 'enum' && column.enum) {
    config.options = Object.entries(column.enum).reduce((acc, [key, value]) => {
      acc[key] = {
        label: String(value),
        value: key,
      };
      return acc;
    }, {} as Record<string, any>);
  }

  // Handle foreign key references
  if (column.references) {
    config.type = 'text';
    config.enableSorting = false;
  }

  return config;
};

const generateFilterConfig = (column: ColumnType) => {
  // Don't generate filters for certain columns
  if (['id', 'created_at', 'updated_at'].includes(column.name)) {
    return null;
  }

  if (column.type === 'enum') {
    return {
      column: column.name,
      type: 'faceted' as const,
      useOptionsFromColumn: true,
    };
  }

  if (['text', 'varchar'].includes(column.type)) {
    return {
      column: column.name,
      type: 'text' as const,
      placeholder: `Filter by ${column.name}...`,
    };
  }

  return null;
};

export const generateTableConfig = (
  tableName: string,
  description: string,
  columns: ColumnType[],
  options?: {
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
): TableConfig => {
  try {
    const {
      excludeColumns = [],
      includeSelect = true,
      includeActions = true,
      customColumns = [],
      customFilters = [],
    } = options || {};

    const tableColumns: TableColumn[] = [];
    const tableFilters = [];

    // Add select column if needed
    if (includeSelect) {
      tableColumns.push({
        id: 'select',
        type: 'checkbox',
        sticky: true,
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Process each column
    columns
      .filter(col => !excludeColumns.includes(col.name))
      .forEach(column => {
        const columnConfig = generateColumnConfig(column);
        tableColumns.push(columnConfig);

        const filterConfig = generateFilterConfig(column);
        if (filterConfig) {
          tableFilters.push(filterConfig);
        }
      });

    // Add custom columns
    tableColumns.push(...customColumns);

    // Add actions column if needed
    if (includeActions) {
      tableColumns.push({
        id: 'actions',
        type: 'actions',
      });
    }

    // Add custom filters
    tableFilters.push(...customFilters);

    return {
      name: tableName,
      description,
      columns: tableColumns,
      filters: tableFilters,
    };
  } catch (error: any) {
    handleSupabaseError(error, { 
      context: `table configuration generation for ${tableName}`,
      fallbackMessage: `Failed to generate table configuration for ${tableName}. Please check your configuration.`
    });
    return {
      name: tableName,
      description,
      columns: [],
      filters: [],
    };
  }
}; 