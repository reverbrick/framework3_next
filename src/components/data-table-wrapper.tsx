'use client';

import { TableConfig } from '@/utils/table-config-utils';
import { DataTable } from '@/components/data-table';
import { DataTableLoading } from '@/components/data-table-loading';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { useState, useMemo, useEffect } from 'react';
import { ServerSideTableState, getDefaultTableState } from '@/utils/table-state';
import { createClient } from '@/utils/supabase/client';
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { generateColumnsFromConfig } from '@/utils/table-config-utils';

interface DataTableWrapperProps {
  config: TableConfig;
  tableName: string;
}

export function DataTableWrapper({ config, tableName }: DataTableWrapperProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableState, setTableState] = useState<ServerSideTableState>(getDefaultTableState());
  const [pageCount, setPageCount] = useState(0);
  const supabase = createClient();

  const columns = useMemo(() => {
    return generateColumnsFromConfig(config);
  }, [config]);

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setTableState((prev: ServerSideTableState) => ({
      ...prev,
      pageIndex,
      pageSize,
    }));
  };

  const handleSortingChange = (sorting: { id: string; desc: boolean }[]) => {
    setTableState((prev: ServerSideTableState) => ({
      ...prev,
      sorting,
    }));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // First check if the table exists
        const { error: tableCheckError } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (tableCheckError) {
          console.error('Table check error:', tableCheckError);
          if (tableCheckError.code === '42P01') { // Table does not exist
            throw new Error(`Table "${tableName}" does not exist in the database`);
          }
          throw tableCheckError;
        }

        // Get only the columns we want to display
        const columnIds = config.columns.map(col => col.id);
        console.log('Fetching columns:', columnIds);
        
        let query = supabase
          .from(tableName)
          .select('*', { count: 'exact' });

        // Apply sorting
        if (tableState.sorting.length > 0) {
          const { id, desc } = tableState.sorting[0];
          query = query.order(id, { ascending: !desc });
        }

        // Apply pagination
        const start = tableState.pageIndex * tableState.pageSize;
        const end = start + tableState.pageSize - 1;
        query = query.range(start, end);

        const { data, error, count } = await query;

        if (error) {
          console.error('Query error:', error);
          handleSupabaseError(error, {
            context: `fetching data from table "${tableName}"`,
            fallbackMessage: "Failed to fetch data from the table."
          });
          throw error;
        }

        // Filter the data to only include the columns we want
        const filteredData = data?.map(row => {
          const filteredRow: any = {};
          columnIds.forEach(id => {
            filteredRow[id] = row[id];
          });
          return filteredRow;
        }) || [];

        console.log('Fetched data:', filteredData);
        setData(filteredData);
        setPageCount(Math.ceil((count || 0) / tableState.pageSize));
      } catch (error: any) {
        console.error('Error fetching data:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setError(error.message || 'Failed to fetch data from the table');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tableName, tableState.pageIndex, tableState.pageSize, tableState.sorting, config.columns]);

  if (loading) {
    return <DataTableLoading message={`Loading ${config.name}...`} />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
  );
} 