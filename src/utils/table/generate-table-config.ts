import { IconShield, IconUserShield, IconUsersGroup, IconCash } from '@tabler/icons-react'

type SupabaseEnum = {
  [key: string]: string | number
}

type TableConfig = {
  name: string
  description: string
  columns: ColumnConfig[]
  filters: FilterConfig[]
}

type ColumnConfig = {
  id: string
  type: string
  title?: string
  sticky?: boolean
  maxWidth?: number
  enableSorting?: boolean
  enableHiding?: boolean
  nowrap?: boolean
  options?: Record<string, any>
  compute?: {
    fields: string[]
    format: string
  }
}

type FilterConfig = {
  column: string
  type: 'text' | 'faceted'
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  useOptionsFromColumn?: boolean
}

type ColumnType = {
  name: string
  type: string
  isNullable: boolean
  format?: string
  enum?: SupabaseEnum
  references?: string
}

const SPECIAL_COLUMNS = {
  id: {
    type: 'text',
    enableSorting: true,
    enableHiding: true,
  },
  created_at: {
    type: 'datetime',
    enableSorting: true,
    enableHiding: true,
  },
  updated_at: {
    type: 'datetime',
    enableSorting: true,
    enableHiding: true,
  },
}

const TYPE_MAPPINGS: Record<string, { type: string; config?: Partial<ColumnConfig> }> = {
  text: { type: 'text' },
  varchar: { type: 'text' },
  int8: { type: 'number' },
  int4: { type: 'number' },
  bool: { type: 'boolean' },
  timestamp: { type: 'datetime' },
  date: { type: 'date' },
  jsonb: { type: 'json' },
  enum: { type: 'badge' },
}

const generateColumnConfig = (column: ColumnType): ColumnConfig => {
  // Check if it's a special column
  const specialConfig = SPECIAL_COLUMNS[column.name as keyof typeof SPECIAL_COLUMNS]
  if (specialConfig) {
    return {
      id: column.name,
      title: column.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      ...specialConfig,
    }
  }

  // Get base configuration from type mapping
  const baseConfig = TYPE_MAPPINGS[column.type] || { type: 'text' }

  const config: ColumnConfig = {
    id: column.name,
    title: column.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    type: baseConfig.type,
    enableSorting: true,
    enableHiding: true,
    ...baseConfig.config,
  }

  // Handle enum types
  if (column.type === 'enum' && column.enum) {
    config.options = Object.entries(column.enum).reduce((acc, [key, value]) => {
      acc[key] = {
        label: String(value),
        value: key,
      }
      return acc
    }, {} as Record<string, any>)
  }

  // Handle foreign key references
  if (column.references) {
    config.type = 'relation'
    config.enableSorting = false
  }

  return config
}

const generateFilterConfig = (column: ColumnType): FilterConfig | null => {
  // Don't generate filters for certain columns
  if (['id', 'created_at', 'updated_at'].includes(column.name)) {
    return null
  }

  if (column.type === 'enum') {
    return {
      column: column.name,
      type: 'faceted',
      useOptionsFromColumn: true,
    }
  }

  if (['text', 'varchar'].includes(column.type)) {
    return {
      column: column.name,
      type: 'text',
      placeholder: `Filter by ${column.name}...`,
    }
  }

  return null
}

export const generateTableConfig = (
  tableName: string,
  description: string,
  columns: ColumnType[],
  options?: {
    excludeColumns?: string[]
    includeSelect?: boolean
    includeActions?: boolean
    customColumns?: ColumnConfig[]
    customFilters?: FilterConfig[]
  }
): TableConfig => {
  const {
    excludeColumns = [],
    includeSelect = true,
    includeActions = true,
    customColumns = [],
    customFilters = [],
  } = options || {}

  const tableColumns: ColumnConfig[] = []
  const tableFilters: FilterConfig[] = []

  // Add select column if needed
  if (includeSelect) {
    tableColumns.push({
      id: 'select',
      type: 'checkbox',
      sticky: true,
      enableSorting: false,
      enableHiding: false,
    })
  }

  // Process each column
  columns
    .filter(col => !excludeColumns.includes(col.name))
    .forEach(column => {
      const columnConfig = generateColumnConfig(column)
      tableColumns.push(columnConfig)

      const filterConfig = generateFilterConfig(column)
      if (filterConfig) {
        tableFilters.push(filterConfig)
      }
    })

  // Add custom columns
  tableColumns.push(...customColumns)

  // Add actions column if needed
  if (includeActions) {
    tableColumns.push({
      id: 'actions',
      type: 'actions',
    })
  }

  // Add custom filters
  tableFilters.push(...customFilters)

  return {
    name: tableName,
    description,
    columns: tableColumns,
    filters: tableFilters,
  }
} 