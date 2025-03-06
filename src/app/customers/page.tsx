"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { DataTableLoading } from "@/components/data-table-loading";
import { PageLayout } from "@/components/layout/page-layout";
import { createClient } from "@/utils/supabase/client";
import { generateColumns } from "@/utils/table-utils";
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { Row } from "@tanstack/react-table";
import { Customer } from "@/types/customer";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const columns = useMemo(() => {
    return generateColumns<Customer>(
      [
        { key: "Customer Id", label: "ID", width: 100 },
        {
          key: "name",
          label: "Name",
          width: 200,
          render: (_: any, row: Customer) => {
            const firstName = row["First Name"] || "";
            const lastName = row["Last Name"] || "";
            return `${firstName} ${lastName}`.trim() || "N/A";
          },
          filterFn: (row: Row<Customer>, columnId: string, filterValue: string) => {
            const searchValue = filterValue.toLowerCase();
            const firstName = (row.original["First Name"] || "").toLowerCase();
            const lastName = (row.original["Last Name"] || "").toLowerCase();
            return firstName.includes(searchValue) || lastName.includes(searchValue);
          }
        },
        { key: "Email", label: "Email", width: 200 },
        { key: "Company", label: "Company", width: 200 },
        { key: "Country", label: "Country", width: 120 },
        { key: "City", label: "City", width: 150 },
        { key: "Phone 1", label: "Phone", width: 150 },
        { 
          key: "Website", 
          label: "Website",
          width: 200,
          render: (value: string | null) => 
            value ? (
              <a 
                href={value.startsWith('http') ? value : `https://${value}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {value}
              </a>
            ) : "N/A"
        },
        { 
          key: "Subscription Date", 
          label: "Subscription Date", 
          type: "date",
          width: 150 
        }
      ],
      {
        selectable: true,
        actions: [
          {
            label: "Copy ID",
            onClick: (row) => navigator.clipboard.writeText(row["Customer Id"] || "")
          },
          {
            label: "View Details",
            onClick: (row) => console.log("View details", row)
          },
          {
            label: "Edit",
            onClick: (row) => console.log("Edit", row)
          }
        ]
      }
    );
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*');
        
        if (error) {
          handleSupabaseError(error, { 
            context: "loading customers",
            fallbackMessage: "Failed to load customers. Please try again later."
          });
          return;
        }

        setCustomers(data || []);
      } catch (error) {
        handleSupabaseError(error as Error, { 
          context: "loading customers",
          fallbackMessage: "An unexpected error occurred while loading customers."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [supabase]);

  return (
    <PageLayout 
      title="Customers"
      description="Manage your customer relationships"
    >
      {loading ? (
        <DataTableLoading message="Loading customers..." />
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <DataTable data={customers} columns={columns} />
        </div>
      )}
    </PageLayout>
  );
} 