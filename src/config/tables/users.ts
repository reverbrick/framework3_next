import { generateTableConfigFromSupabase } from '@/utils/supabase-to-table-config'
import { IconShield, IconUserShield, IconUsersGroup, IconCash } from '@tabler/icons-react'

const usersTable = {
  name: 'Users',
  schema: 'public',
  columns: [
    {
      name: 'id',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'username',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'first_name',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'last_name',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'email',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'phone_number',
      type: 'text',
      is_nullable: true,
    },
    {
      name: 'status',
      type: 'enum',
      is_nullable: false,
      enums: ['active', 'inactive', 'invited', 'suspended'],
    },
    {
      name: 'role',
      type: 'enum',
      is_nullable: false,
      enums: ['superadmin', 'admin', 'manager', 'cashier'],
    },
    {
      name: 'created_at',
      type: 'timestamp',
      is_nullable: false,
    },
    {
      name: 'updated_at',
      type: 'timestamp',
      is_nullable: false,
    },
  ],
}

export const usersTableConfig = generateTableConfigFromSupabase(usersTable, {
  description: 'Manage your users and their roles here.',
  excludeColumns: ['created_at', 'updated_at'],
  customColumns: [
    {
      id: 'fullName',
      type: 'computed',
      title: 'Name',
      maxWidth: 36,
      compute: {
        fields: ['first_name', 'last_name'],
        format: '${first_name} ${last_name}',
      },
    },
  ],
}) 