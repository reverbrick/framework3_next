import { SortingState } from "@tanstack/react-table";

export interface ServerSideTableState {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
}

export interface ServerSideTableOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
}

// Map frontend column IDs to database column names
const columnMapping: Record<string, string> = {
  name: "First Name", // When sorting by name, sort by First Name
};

export function getServerSideTableState(
  pageIndex: number,
  pageSize: number,
  sorting: SortingState
): ServerSideTableState {
  return {
    pageIndex,
    pageSize,
    sorting,
  };
}

export function getSupabasePaginationParams(
  pageIndex: number,
  pageSize: number,
  sorting: SortingState
) {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  // Convert sorting state to Supabase order format
  const orderBy = sorting.map(sort => {
    // Get the actual database column name from the mapping
    const columnName = columnMapping[sort.id] || sort.id;
    return {
      column: columnName,
      ascending: sort.desc ? false : true
    };
  });

  return {
    from,
    to,
    orderBy,
  };
}

export function validatePageSize(
  pageSize: number,
  options: ServerSideTableOptions = {}
): number {
  const { defaultPageSize = 10, maxPageSize = 100 } = options;
  
  // Ensure page size is within bounds
  if (pageSize < 1) return defaultPageSize;
  if (pageSize > maxPageSize) return maxPageSize;
  
  return pageSize;
}

export function calculatePageCount(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}

export function getDefaultTableState(
  options: ServerSideTableOptions = {}
): ServerSideTableState {
  return {
    pageIndex: 0,
    pageSize: options.defaultPageSize || 10,
    sorting: [],
  };
} 