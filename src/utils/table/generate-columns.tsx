import { ColumnDef, Row, Table } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { IconShield, IconUserShield, IconUsersGroup, IconCash } from '@tabler/icons-react'
import { DataTableColumnHeader } from '@/components/data-table-column-header'
import { DataTableRowActions } from '@/components/data-table-row-actions'
import { TableColumn, defaultTableConfig } from './table-config'

export type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
  [key: string]: any
}

const ICONS = {
  IconShield,
  IconUserShield,
  IconUsersGroup,
  IconCash,
}

const generateColumnCell = (config: TableColumn) => {
  switch (config.type) {
    case 'checkbox':
      return ({ row }: { row: Row<User> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      )
    case 'text':
      return ({ row }: { row: Row<User> }) => {
        const value = row.getValue(config.id) as string
        const className = cn({
          'max-w-36': config.maxWidth === 36,
          'text-nowrap': config.nowrap,
        })
        return config.maxWidth ? (
          <LongText className={className}>{value}</LongText>
        ) : (
          <div className={className}>{value}</div>
        )
      }
    case 'computed':
      return ({ row }: { row: Row<User> }) => {
        if (!config.compute) return null
        const { fields, format } = config.compute
        const values = fields.reduce((acc, field) => {
          acc[field] = row.original[field as keyof User]
          return acc
        }, {} as Record<string, any>)
        const value = format.replace(/\${(\w+)}/g, (_, key) => values[key])
        return <LongText className={cn('max-w-36')}>{value}</LongText>
      }
    case 'badge':
      return ({ row }: { row: Row<User> }) => {
        const value = row.getValue(config.id) as string
        const badgeColor = config.options?.[value] as string
        return (
          <div className="flex space-x-2">
            <Badge variant="outline" className={cn('capitalize', badgeColor)}>
              {value}
            </Badge>
          </div>
        )
      }
    case 'icon-text':
      return ({ row }: { row: Row<User> }) => {
        const value = row.getValue(config.id) as string
        const option = config.options?.[value]
        if (!option) return null
        const Icon = ICONS[option.icon as keyof typeof ICONS]
        return (
          <div className="flex gap-x-2 items-center">
            {Icon && <Icon size={16} className="text-muted-foreground" />}
            <span className="capitalize text-sm">{option.label}</span>
          </div>
        )
      }
    case 'actions':
      return DataTableRowActions
    default:
      return ({ row }: { row: Row<User> }) => {
        const value = row.getValue(config.id)
        return <div>{String(value)}</div>
      }
  }
}

const generateColumnHeader = (config: TableColumn) => {
  if (config.type === 'checkbox') {
    return ({ table }: { table: Table<User> }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    )
  }

  if (!config.title) return null

  return ({ column }: { column: any }) => (
    <DataTableColumnHeader column={column} title={config.title!} />
  )
}

export const generateColumns = (): ColumnDef<User>[] => {
  return defaultTableConfig.table.columns.map((config) => {
    const column = {
      id: config.id,
      enableSorting: config.enableSorting !== false,
      enableHiding: config.enableHiding !== false,
    } as ColumnDef<User>

    // Add accessorKey for non-computed columns
    if (config.type !== 'computed' && config.type !== 'checkbox' && config.type !== 'actions') {
      ;(column as any).accessorKey = config.id
    }

    // Add header
    const header = generateColumnHeader(config)
    if (header) {
      column.header = header
    }

    // Add cell
    column.cell = generateColumnCell(config)

    // Add meta for sticky columns
    if (config.sticky) {
      column.meta = {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
          'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
          'sticky left-0 md:table-cell'
        ),
      }
    }

    // Add filter function for status and role
    if (config.id === 'status' || config.id === 'role') {
      column.filterFn = (row, id, value) => {
        return value.includes(row.getValue(id))
      }
    }

    return column
  })
} 