"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { createClient } from "@/utils/supabase/client";
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { generateAndSaveTableDefinition } from "@/utils/table/table-definition-utils";
import { generateTableConfigFromDefinition } from "@/utils/table/supabase-to-table-config";
import { DataTableWrapper } from '@/components/data-table-wrapper';
import { DataTableLoading } from "@/components/data-table-loading";
import { TableConfig } from "@/utils/table-config-utils";

interface TableClientProps {
  tableName: string;
  tableDescription: string;
}

export default function TableClient({ tableName, tableDescription }: TableClientProps) {
  const [tableConfig, setTableConfig] = useState<TableConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(tableName);
  const [displayDescription, setDisplayDescription] = useState(tableDescription);
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

        // Get the table definition to get the display name and description
        const { data: definition, error: definitionError } = await supabase
          .from('table_definitions')
          .select('name, description')
          .eq('table_name', tableName)
          .single();

        if (definitionError) {
          handleSupabaseError(definitionError, {
            context: "fetching table definition",
            fallbackMessage: "Failed to fetch table definition."
          });
          return;
        }

        if (definition) {
          setDisplayName(definition.name || tableName);
          setDisplayDescription(definition.description || tableDescription);
        }

        // Generate table configuration from the definition
        const config = await generateTableConfigFromDefinition(tableName, {
          description: tableDescription,
          includeSelect: true,
          includeActions: true,
        });

        if (!config) {
          throw new Error('Failed to generate table configuration');
        }

        setTableConfig(config);
      } catch (error: any) {
        console.error('Error initializing table:', error);
        setError(error.message || 'Failed to initialize table');
      } finally {
        setLoading(false);
      }
    };

    initializeTable();
  }, [tableName, tableDescription]);

  if (loading) {
    return (
      <PageLayout title={displayName} description={displayDescription}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading {displayName}...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={displayName} description={displayDescription}>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading table</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!tableConfig) {
    return (
      <PageLayout title={displayName} description={displayDescription}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No configuration available for {displayName}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={displayName} description={displayDescription}>
      <DataTableWrapper config={tableConfig} tableName={tableName} />
    </PageLayout>
  );
} 