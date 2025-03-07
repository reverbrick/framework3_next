export type TableColumnType = 
  | "number" 
  | "boolean" 
  | "text" 
  | "checkbox" 
  | "date" 
  | "json" 
  | "computed" 
  | "badge" 
  | "icon-text" 
  | "actions";

export interface TableColumn {
  id: string;
  name: string;
  type: TableColumnType;
  isNullable: boolean;
  defaultValue?: string | null;
  comment?: string | null;
}

export interface TableConfig {
  name: string;
  description: string;
  columns: TableColumn[];
  filters?: {
    id: string;
    name: string;
    type: "text" | "number" | "date" | "select";
    options?: string[];
  }[];
} 