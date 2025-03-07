export interface ServerSideTableState {
  pageIndex: number;
  pageSize: number;
  sorting: { id: string; desc: boolean }[];
}

export function getDefaultTableState(): ServerSideTableState {
  return {
    pageIndex: 0,
    pageSize: 10,
    sorting: [],
  };
} 