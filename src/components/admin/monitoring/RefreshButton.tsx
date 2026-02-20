'use client'

/**
 * RefreshButton - Bouton de rafraichissement pour pages Server Component
 *
 * Utilise router.refresh() pour re-fetcher les donnees serveur
 * sans navigation complete. Feedback visuel via animation spin.
 *
 * @ticket SP-471
 */

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RefreshButtonProps {
  /** Label accessible du bouton */
  label?: string
}

export function RefreshButton({
  label = 'Rafraîchir',
}: RefreshButtonProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 800)
  }, [router])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      aria-label={isRefreshing ? 'Rafraîchissement en cours...' : label}
    >
      <RefreshCw
        className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      {isRefreshing ? 'Rafraîchissement...' : label}
    </Button>
  )
}
