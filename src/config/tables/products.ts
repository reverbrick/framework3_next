import { generateTableConfigFromSupabase } from '@/utils/supabase-to-table-config'

const productsTable = {
  name: 'Products',
  schema: 'public',
  columns: [
    {
      name: 'id',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'name',
      type: 'text',
      is_nullable: false,
    },
    {
      name: 'description',
      type: 'text',
      is_nullable: true,
    },
    {
      name: 'price',
      type: 'int8',
      is_nullable: false,
    },
    {
      name: 'category',
      type: 'enum',
      is_nullable: false,
      enums: ['electronics', 'clothing', 'books', 'food', 'other'],
    },
    {
      name: 'status',
      type: 'enum',
      is_nullable: false,
      enums: ['in_stock', 'out_of_stock', 'discontinued'],
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

export const productsTableConfig = generateTableConfigFromSupabase(productsTable, {
  description: 'Manage your product catalog here.',
  excludeColumns: ['created_at', 'updated_at'],
  customColumns: [
    {
      id: 'formattedPrice',
      type: 'computed',
      title: 'Price',
      compute: {
        fields: ['price'],
        format: '$${price / 100}',
      },
    },
  ],
}) 