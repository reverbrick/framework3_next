'use client';

import { useMemo } from 'react';
import { ColumnDef, Table, Row } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MoreHorizontalIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { TableConfig, TableAction, TableColumn } from '@/utils/table-config-utils';

export function useTableColumns<T>(config: TableConfig | null): ColumnDef<T>[] {
  const router = useRouter();

  return useMemo(() => {
    if (!config) return [];
    
    const columns: ColumnDef<T>[] = [];

    // Add selection column if selectable is true
    if (config.options?.selectable) {
      columns.push({
        id: "select",
        header: ({ table }: { table: Table<T> }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<T> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Add data columns
    config.columns.forEach((column: TableColumn) => {
      // Skip hidden columns
      if (column.enableHiding === false) return;

      const columnDef: ColumnDef<T> = {
        accessorKey: column.id as keyof T,
        header: ({ column: tableColumn }) => (
          <DataTableColumnHeader column={tableColumn} title={column.title || column.id} />
        ),
        cell: ({ row }) => {
          try {
            const value = row.getValue(column.id);
            
            // Use custom render function if provided
            if (column.compute) {
              const computedValue = column.compute.fields
                .map((field: string) => String(row.original[field as keyof T] || ''))
                .join(' ');
              return computedValue.trim() || 'N/A';
            }

            // Default rendering based on type
            switch (column.type) {
              case 'date':
                if (!value) return "N/A";
                try {
                  return new Date(value as string).toLocaleDateString();
                } catch {
                  return "Invalid Date";
                }
              case 'boolean':
                return value ? "Yes" : "No";
              default:
                return value || "N/A";
            }
          } catch (error) {
            console.error(`Error rendering cell for column ${column.id}:`, error);
            return "Error loading data";
          }
        },
        size: column.maxWidth,
        enableHiding: column.enableHiding ?? true,
        enableSorting: column.enableSorting ?? true,
      };

      columns.push(columnDef);
    });

    // Add actions column if needed
    if (config.options?.actions?.length) {
      columns.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const actions = config.options?.actions || [];
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {actions.map((action: TableAction) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => action.onClick?.(row.original)}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
      });
    }

    return columns;
  }, [config, router]);
} 