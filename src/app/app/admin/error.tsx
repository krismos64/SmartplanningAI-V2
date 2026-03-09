'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Admin] Error boundary caught:', error)
  }, [error])

  return <ErrorFallback error={error} resetErrorBoundary={reset} />
}
