"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { DataTableLoading } from "@/components/data-table-loading";
import { PageLayout } from "@/components/layout/page-layout";
import { createClient } from "@/utils/supabase/client";
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { 
  ServerSideTableState, 
  getDefaultTableState, 
  getSupabasePaginationParams,
  validatePageSize,
  calculatePageCount
} from "@/utils/table/server-side-utils";
import { generateColumnsFromConfig, TableConfig } from "@/utils/table-config-utils";
import { generateAndSaveTableDefinition } from "@/utils/table/table-definition-utils";
import { generateTableConfigFromDefinition } from "@/utils/table/supabase-to-table-config";

interface TableClientProps {
  tableName: string;
}

export default function TableClient({ tableName }: TableClientProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableConfig, setTableConfig] = useState<TableConfig | null>(null);
  const [tableState, setTableState] = useState<ServerSideTableState>(getDefaultTableState());
  const [pageCount, setPageCount] = useState(0);
  const supabase = createClient();

  // Initialize table definition and configuration
  useEffect(() => {
    const initializeTable = async () => {
      try {
        // First, ensure we have a table definition
        const definitionSuccess = await generateAndSaveTableDefinition(tableName);
        if (!definitionSuccess) {
          handleSupabaseError(new Error('Failed to generate table definition'), {
            context: "initializing table",
            fallbackMessage: "Failed to initialize table configuration."
          });
          return;
        }

        // Generate table configuration from the definition
        const config = await generateTableConfigFromDefinition(tableName, {
          description: `View and manage ${tableName}`,
          includeSelect: true,
          includeActions: true,
        });

        if (!config) {
          handleSupabaseError(new Error('Failed to generate table configuration'), {
            context: "initializing table",
            fallbackMessage: "Failed to generate table configuration."
          });
          return;
        }

        setTableConfig(config);
      } catch (error: any) {
        handleSupabaseError(error, {
          context: "initializing table",
          fallbackMessage: "An unexpected error occurred while initializing the table."
        });
      }
    };

    initializeTable();
  }, [tableName]);

  const columns = useMemo(() => {
    if (!tableConfig) return [];
    return generateColumnsFromConfig<any>(tableConfig, (action: string, row: any) => {
      console.log('Action:', action, 'Row:', row);
    });
  }, [tableConfig]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get pagination parameters
        const { from, to, orderBy } = getSupabasePaginationParams(
          tableState.pageIndex,
          tableState.pageSize,
          tableState.sorting
        );

        // Get total count first
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (countError) {
          handleSupabaseError(countError, {
            context: "counting records",
            fallbackMessage: "Failed to count records."
          });
          return;
        }

        if (count !== null) {
          setPageCount(calculatePageCount(count, tableState.pageSize));
        }

        // Build the query
        let query = supabase
          .from(tableName)
          .select('*')
          .range(from, to);

        // Apply sorting if any
        if (orderBy.length > 0) {
          orderBy.forEach(sort => {
            query = query.order(sort.column, { ascending: sort.ascending });
          });
        }

        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          handleSupabaseError(error, { 
            context: "loading data",
            fallbackMessage: "Failed to load data. Please try again later."
          });
          return;
        }

        setData(data || []);
      } catch (error) {
        handleSupabaseError(error as Error, { 
          context: "loading data",
          fallbackMessage: "An unexpected error occurred while loading data."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, tableState, tableName]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setTableState(prev => ({
      ...prev,
      pageIndex: newPageIndex,
      pageSize: validatePageSize(newPageSize)
    }));
  };

  const handleSortingChange = (sorting: any) => {
    setTableState(prev => ({
      ...prev,
      sorting,
      pageIndex: 0 // Reset to first page when sorting changes
    }));
  };

  return (
    <PageLayout 
      title={tableConfig?.name || tableName}
      description={tableConfig?.description || `View and manage ${tableName}`}
    >
      {loading ? (
        <DataTableLoading message={`Loading ${tableName}...`} />
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <DataTable 
            data={data} 
            columns={columns}
            pageCount={pageCount}
            pageIndex={tableState.pageIndex}
            pageSize={tableState.pageSize}
            onPaginationChange={handlePaginationChange}
            onSortingChange={handleSortingChange}
          />
        </div>
      )}
    </PageLayout>
  );
} 