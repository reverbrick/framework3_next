import { usersTableConfig } from './users'
import { productsTableConfig } from './products'
import { ordersTableConfig } from './orders'

export const tableConfigs = {
  users: usersTableConfig,
  products: productsTableConfig,
  orders: ordersTableConfig,
} as const

export type TableName = keyof typeof tableConfigs 