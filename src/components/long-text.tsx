import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface LongTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function LongText({ children, className, ...props }: LongTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isOverflown, setIsOverflown] = useState(false)

  useEffect(() => {
    if (checkOverflow(ref.current)) {
      setIsOverflown(true)
      return
    }

    setIsOverflown(false)
  }, [])

  if (!isOverflown)
    return (
      <div
        ref={ref}
        className={cn('truncate', className)}
        title={typeof children === "string" ? children : undefined}
        {...props}
      >
        {children}
      </div>
    )

  return (
    <>
      <div className='hidden sm:block'>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                ref={ref}
                className={cn('truncate', className)}
                title={typeof children === "string" ? children : undefined}
                {...props}
              >
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{children}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className='sm:hidden'>
        <Popover>
          <PopoverTrigger asChild>
            <div
              ref={ref}
              className={cn('truncate', className)}
              title={typeof children === "string" ? children : undefined}
              {...props}
            >
              {children}
            </div>
          </PopoverTrigger>
          <PopoverContent className={cn('w-fit')}>
            <p>{children}</p>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}

const checkOverflow = (textContainer: HTMLDivElement | null) => {
  if (textContainer) {
    return (
      textContainer.offsetHeight < textContainer.scrollHeight ||
      textContainer.offsetWidth < textContainer.scrollWidth
    )
  }
  return false
}
