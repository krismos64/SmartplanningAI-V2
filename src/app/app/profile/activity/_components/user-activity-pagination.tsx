'use client'

/**
 * Pagination pour la timeline d'activité utilisateur
 *
 * @ticket SP-463
 */

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface UserActivityPaginationProps {
  page: number
  totalPages: number
  total: number
}

export function UserActivityPagination({
  page,
  totalPages,
  total,
}: UserActivityPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newPage > 1) {
        params.set('page', String(newPage))
      } else {
        params.delete('page')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} sur {totalPages} ({total} entrée{total > 1 ? 's' : ''})
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
