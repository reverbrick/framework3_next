export * from "./table/generate-columns";
export * from "./table/generate-table-config";
export * from "./table/supabase-to-table-config";

import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, ArrowUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { handleSupabaseError } from "@/utils/supabase-error-handler";

export interface ColumnConfig<T> {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  type?: 'string' | 'number' | 'boolean' | 'date';
  enableSorting?: boolean;
  enableHiding?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  filterFn?: (row: any, columnId: string, filterValue: string) => boolean;
  header?: (props: any) => React.ReactNode;
}

type TableOptions<T> = {
  selectable?: boolean;
  actions?: {
    label: string;
    onClick: (row: T) => void;
  }[];
};

export function generateColumns<T extends Record<string, any>>(
  columnConfigs: ColumnConfig<T>[],
  options: TableOptions<T> = {}
): ColumnDef<T>[] {
  try {
    // Check if we have any column configs
    if (!columnConfigs || columnConfigs.length === 0) {
      toast({
        variant: "destructive",
        title: "Table Configuration Error",
        description: "No columns were provided for the table. Please check your configuration.",
      });
      return [];
    }

    const columns: ColumnDef<T>[] = [];

    // Add selection column if selectable is true
    if (options.selectable) {
      columns.push({
        id: "select",
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
        size: 40,
      });
    }

    // Add data columns
    columnConfigs.forEach((config) => {
      // Skip hidden columns
      if (config.enableHiding !== undefined && !config.enableHiding) return;

      const column: ColumnDef<T> = {
        accessorKey: config.key,
        header: config.header || (({ column }) => {
          if (config.enableSorting !== undefined && !config.enableSorting) {
            return config.label;
          }
          return (
            <div className="flex w-full items-center">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 w-full justify-start"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                {config.label}
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </div>
          );
        }),
        cell: ({ row }) => {
          try {
            const value = row.getValue(config.key);
            
            // Use custom render function if provided
            if (config.render) {
              return config.render(value, row.original);
            }

            // Default rendering based on type
            switch (config.type) {
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
            console.error(`Error rendering cell for column ${config.key}:`, error);
            return "Error loading data";
          }
        },
        size: config.width,
        minSize: config.minWidth,
        maxSize: config.maxWidth,
        enableHiding: config.enableHiding !== false,
        enableSorting: config.enableSorting !== false,
      };

      // Add filter function if provided
      if (config.filterFn) {
        column.filterFn = config.filterFn;
      }

      columns.push(column);
    });

    // Add actions column if actions are provided
    if (options.actions?.length) {
      columns.push({
        id: "actions",
        cell: ({ row }) => {
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
                {options.actions && options.actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      try {
                        action.onClick(row.original);
                      } catch (error) {
                        console.error(`Error executing action ${action.label}:`, error);
                        toast({
                          variant: "destructive",
                          title: "Action Failed",
                          description: `Failed to execute ${action.label}. Please try again.`,
                        });
                      }
                    }}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 50,
        enableHiding: false,
        enableSorting: false,
      });
    }

    return columns;
  } catch (error: any) {
    handleSupabaseError(error, { 
      context: "table column generation",
      fallbackMessage: "Failed to generate table columns. Please check your configuration."
    });
    return [];
  }
} 