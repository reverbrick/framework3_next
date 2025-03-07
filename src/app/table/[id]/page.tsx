import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import TableClient from "./table-client";
import { generateAndSaveTableDefinition } from "@/utils/table/table-definition-utils";

interface TablePageProps {
  params: {
    id: string;
  };
}

export default async function TablePage({ params }: TablePageProps) {
  const supabase = createClient();

  // Check if the table exists in the database
  const { data: tableDefinition, error: tableError } = await supabase
    .from('table_definitions')
    .select('table_name, columns')
    .eq('table_name', params.id)
    .single();

  if (tableError && tableError.code !== 'PGRST116') { // PGRST116 is "not found"
    notFound();
  }

  // If table doesn't exist, try to generate it
  if (!tableDefinition) {
    try {
      await generateAndSaveTableDefinition(params.id);
      return <TableClient tableName={params.id} />;
    } catch (error: any) {
      notFound();
    }
  }

  // If table exists but has null columns or empty columns array, return 404
  if (!tableDefinition.columns || tableDefinition.columns === null || tableDefinition.columns.length === 0) {
    notFound();
  }

  // If we get here, the table exists and has valid columns
  return <TableClient tableName={params.id} />;
} 