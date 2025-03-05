export interface TableColumn {
  id: string;
  type: 'checkbox' | 'text' | 'computed' | 'badge' | 'icon-text' | 'actions';
  title?: string;
  sticky?: boolean;
  maxWidth?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  nowrap?: boolean;
  options?: Record<string, any>;
  compute?: {
    fields: string[];
    format: string;
  };
}

export interface TableConfig {
  table: {
    columns: TableColumn[];
  };
}

export const defaultTableConfig: TableConfig = {
  table: {
    columns: [
      {
        id: "select",
        type: "checkbox",
        sticky: true
      },
      {
        id: "name",
        type: "text",
        title: "Name",
        enableSorting: true,
        sticky: true
      },
      {
        id: "email",
        type: "text",
        title: "Email",
        enableSorting: true
      },
      {
        id: "role",
        type: "badge",
        title: "Role",
        enableSorting: true,
        options: {
          admin: "bg-red-500/20 text-red-700 dark:text-red-400",
          user: "bg-blue-500/20 text-blue-700 dark:text-blue-400"
        }
      },
      {
        id: "status",
        type: "badge",
        title: "Status",
        enableSorting: true,
        options: {
          active: "bg-green-500/20 text-green-700 dark:text-green-400",
          inactive: "bg-gray-500/20 text-gray-700 dark:text-gray-400"
        }
      },
      {
        id: "actions",
        type: "actions",
        title: "Actions"
      }
    ]
  }
}; 