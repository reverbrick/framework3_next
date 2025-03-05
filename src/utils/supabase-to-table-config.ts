import { generateTableConfig } from './table-config'

type SupabaseType = 'text' | 'varchar' | 'int8' | 'int4' | 'bool' | 'timestamp' | 'date' | 'jsonb' | 'enum'

type SupabaseColumn = {
  name: string
  type: SupabaseType
  is_nullable: boolean
  format?: string
  enums?: string[]
  references?: string
}

type SupabaseTable = {
  name: string
  schema: string
  columns: SupabaseColumn[]
}

const mapSupabaseType = (type: SupabaseType): string => {
  switch (type) {
    case 'text':
    case 'varchar':
      return 'text'
    case 'int8':
    case 'int4':
      return 'number'
    case 'bool':
      return 'boolean'
    case 'timestamp':
      return 'datetime'
    case 'date':
      return 'date'
    case 'jsonb':
      return 'json'
    case 'enum':
      return 'enum'
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
      type: 'enum',
      enum: column.enums.reduce((acc, value) => {
        acc[value] = value.charAt(0).toUpperCase() + value.slice(1)
        return acc
      }, {} as Record<string, string>),
    }
  }

  if (column.references) {
    return {
      ...result,
      references: column.references,
    }
  }

  return result
}

export const generateTableConfigFromSupabase = (
  table: SupabaseTable,
  options: {
    description: string
    excludeColumns?: string[]
    includeSelect?: boolean
    includeActions?: boolean
    customColumns?: Array<{
      id: string
      type: string
      title?: string
      compute?: {
        fields: string[]
        format: string
      }
      [key: string]: any
    }>
    customFilters?: Array<{
      column: string
      type: 'text' | 'faceted'
      placeholder?: string
      options?: Array<{ label: string; value: string }>
      useOptionsFromColumn?: boolean
    }>
  }
) => {
  const columns = table.columns.map(convertSupabaseColumn)
  return generateTableConfig(table.name, options.description, columns, options)
} 