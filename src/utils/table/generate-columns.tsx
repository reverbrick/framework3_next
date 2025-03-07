import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";

export interface ColumnConfig {
  id: string;
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue?: string | null;
  comment?: string | null;
}

export function generateColumnsFromConfig(columns: ColumnConfig[]): ColumnDef<any>[] {
  return columns.map(column => ({
    accessorKey: column.id,
    header: ({ column: tableColumn }) => (
      <DataTableColumnHeader column={tableColumn} title={column.name} />
    ),
    cell: ({ row }) => {
      const value = row.getValue(column.id);
      return formatCellValue(value, column.type);
    },
  }));
}

function formatCellValue(value: any, type: string): string {
  if (value === null) return '';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'timestamp':
      return new Date(value).toLocaleString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'json':
      return JSON.stringify(value);
    default:
      return String(value);
  }
} 