import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-testid="skeleton"
      className={cn('sp-skeleton rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
