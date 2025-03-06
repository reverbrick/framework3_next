'use client'

import { IconRocket } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'

export default function ComingSoon() {
  return (
    <Main>
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <IconRocket className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold">Coming Soon</h1>
        <p className="text-muted-foreground">
          We're working hard to bring you something amazing. Stay tuned!
        </p>
        <Button variant="outline" className="mt-4">
          Get Notified
        </Button>
      </div>
    </Main>
  )
} 