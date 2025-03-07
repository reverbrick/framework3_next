export type SupabaseColumn = {
  name: string;
  type: string;
  is_nullable: boolean;
  default_value?: string | null;
  comment?: string | null;
};

export type TableDefinition = {
  table_name: string;
  schema_name: string;
  columns: SupabaseColumn[];
  name?: string | null;
  description?: string | null;
}; 