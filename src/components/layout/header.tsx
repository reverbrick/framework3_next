'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
  session?: any
}

export const Header = ({
  className,
  fixed,
  children,
  session,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        fixed && 'fixed',
        className
      )}
      {...props}
    >
      <div className="container flex h-14 items-center">
        {session && (
          <>
            <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
            <Separator orientation='vertical' className='h-6' />
          </>
        )}
        {children}
      </div>
    </header>
  )
}

Header.displayName = 'Header'
