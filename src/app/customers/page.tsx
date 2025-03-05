"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { DataTable } from "@/components/data-table";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { generateColumns } from "@/utils/table-utils";
import { Row } from "@tanstack/react-table";

type Customer = {
  Index: number;
  "Customer Id": string | null;
  "First Name": string | null;
  "Last Name": string | null;
  Email: string | null;
  Company: string | null;
  City: string | null;
  Country: string | null;
  "Phone 1": string | null;
  "Phone 2": string | null;
  Website: string | null;
  "Subscription Date": string | null;
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

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
          throw error;
        }

        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">
              Manage your customer relationships
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <DataTable data={customers} columns={columns} />
        </div>
      </Main>
    </>
  );
} 