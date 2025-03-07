import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/types/supabase";

export interface TableAction {
  id: string;
  label: string;
  action: string;
  onClick?: (row: any) => void;
}

export interface TableColumn {
  id: string;
  type: 'checkbox' | 'text' | 'computed' | 'badge' | 'icon-text' | 'actions' | 'number' | 'boolean' | 'date' | 'json';
  title?: string;
  sticky?: boolean;
  maxWidth?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  nowrap?: boolean;
  options?: Record<string, any>;
  compute?: {
    fields: string[];
    format: string;
  };
}

export interface TableOptions {
  selectable?: boolean;
  actions?: TableAction[];
  title?: string;
  description?: string;
}

export interface TableConfig {
  name: string;
  description: string;
  columns: TableColumn[];
  filters: Array<{
    column: string;
    type: 'text' | 'faceted';
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
    useOptionsFromColumn?: boolean;
  }>;
  options?: TableOptions;
}

export const defaultTableConfig: TableConfig = {
  name: "Default Table",
  description: "A default table configuration",
  columns: [
    {
      id: "select",
      type: "checkbox",
      sticky: true
    },
    {
      id: "name",
      type: "text",
      title: "Name",
      enableSorting: true,
      sticky: true
    },
    {
      id: "email",
      type: "text",
      title: "Email",
      enableSorting: true
    },
    {
      id: "role",
      type: "badge",
      title: "Role",
      enableSorting: true,
      options: {
        admin: "bg-red-500/20 text-red-700 dark:text-red-400",
        user: "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      }
    },
    {
      id: "status",
      type: "badge",
      title: "Status",
      enableSorting: true,
      options: {
        active: "bg-green-500/20 text-green-700 dark:text-green-400",
        inactive: "bg-gray-500/20 text-gray-700 dark:text-gray-400"
      }
    },
    {
      id: "actions",
      type: "actions",
      title: "Actions"
    }
  ],
  filters: []
};

export function generateColumnsFromConfig<T extends Record<string, any>>(
  config: TableConfig,
  onAction?: (action: string, row: T) => void
): ColumnDef<T>[] {
  return config.columns.map(column => {
    if (column.type === 'checkbox') {
      return {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<T>;
    }

    const baseColumn: ColumnDef<T> = {
      accessorKey: column.id as keyof T,
      header: ({ column: tableColumn }) => (
        <DataTableColumnHeader column={tableColumn} title={column.title || column.id} />
      ),
      cell: ({ row }) => {
        const value = row.getValue(column.id);
        
        if (column.compute) {
          const computedValue = column.compute.fields
            .map(field => String(row.original[field as keyof T] || ''))
            .join(' ');
          return computedValue.trim() || 'N/A';
        }
        
        if (column.options) {
          switch (column.type) {
            case 'text':
              return String(value || 'N/A');
            case 'badge':
              return (
                <span className={`px-2 py-1 rounded-full ${column.options[value as keyof typeof column.options]}`}>
                  {String(value || 'N/A')}
                </span>
              );
            case 'icon-text':
              return (
                <div className="flex items-center space-x-2">
                  {column.options[value as keyof typeof column.options]}
                  <span>{String(value || 'N/A')}</span>
                </div>
              );
            default:
              return 'N/A';
          }
        }

        // Handle arrays and objects by converting to string
        if (Array.isArray(value) || (value && typeof value === 'object')) {
          return JSON.stringify(value);
        }

        return String(value || 'N/A');
      },
    };

    if (column.maxWidth) {
      baseColumn.size = column.maxWidth;
    }

    if (column.enableSorting) {
      baseColumn.sortingFn = (rowA, rowB) => {
        const valueA = (rowA.getValue(column.id) as string) || '';
        const valueB = (rowB.getValue(column.id) as string) || '';
        return valueA.localeCompare(valueB);
      };
    }

    if (column.enableHiding) {
      baseColumn.enableHiding = true;
    }

    if (column.nowrap) {
      baseColumn.cell = ({ row }) => {
        const value = row.getValue(column.id);
        return (
          <div className="whitespace-nowrap">
            {Array.isArray(value) || (value && typeof value === 'object') 
              ? JSON.stringify(value)
              : String(value || 'N/A')}
          </div>
        );
      };
    }

    return baseColumn;
  });
}

export function getActionHandlers(config: TableConfig) {
  if (!config.options?.actions) return [];

  return config.options.actions.map(action => ({
    label: action.label,
    onClick: (row: any) => {
      switch (action.action) {
        case 'copyId':
          const primaryKeyField = config.columns.find(col => col.id === 'id')?.id || 'id';
          navigator.clipboard.writeText(String(row[primaryKeyField] || ''));
          break;
        case 'viewDetails':
          console.log('View details', row);
          break;
        case 'edit':
          console.log('Edit', row);
          break;
      }
    }
  }));
} 