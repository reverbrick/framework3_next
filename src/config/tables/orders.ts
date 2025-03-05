import { generateTableConfigFromSupabase } from '@/utils/supabase-to-table-config'

const ordersTable = {
  name: 'Orders',
  schema: 'public',
  columns: [
    {
      name: 'id',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'user_id',
      type: 'text',
      is_nullable: false,
      references: 'users.id',
    },
    {
      name: 'total_amount',
      type: 'int8',
      is_nullable: false,
    },
    {
      name: 'status',
      type: 'enum',
      is_nullable: false,
      enums: ['pending', 'processing', 'completed', 'cancelled'],
    },
    {
      name: 'payment_status',
      type: 'enum',
      is_nullable: false,
      enums: ['unpaid', 'paid', 'refunded'],
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

export const ordersTableConfig = generateTableConfigFromSupabase(ordersTable, {
  description: 'Track and manage customer orders.',
  excludeColumns: ['created_at', 'updated_at'],
  customColumns: [
    {
      id: 'formattedAmount',
      type: 'computed',
      title: 'Total Amount',
      compute: {
        fields: ['total_amount'],
        format: '$${total_amount / 100}',
      },
    },
  ],
}) 