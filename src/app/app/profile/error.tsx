'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Profile] Error boundary caught:', error)
  }, [error])

  return <ErrorFallback error={error} resetErrorBoundary={reset} />
}
