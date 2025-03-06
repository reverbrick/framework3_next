'use client'

import { useState } from 'react'
import {
  IconAdjustmentsHorizontal,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { apps } from './data/apps'

const appText = new Map<string, string>([
  ['all', 'All Apps'],
  ['connected', 'Connected'],
  ['notConnected', 'Not Connected'],
])

export default function Apps() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState('all')

  return (
    <Main>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight">Apps</h2>
          <p className="text-muted-foreground">
            Manage your apps and their connections.
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="notConnected">Not Connected</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
          >
            {sort === 'asc' ? (
              <IconSortAscendingLetters className="h-4 w-4" />
            ) : (
              <IconSortDescendingLetters className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <div
            key={app.name}
            className="flex items-center space-x-4 rounded-lg border p-4"
          >
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{app.name}</p>
              <p className="text-sm text-muted-foreground">{app.desc}</p>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
        ))}
      </div>
    </Main>
  )
}
