/**
 * Badge compteur de messages non-lus pour la sidebar
 *
 * @description Composant isolé pour éviter de re-render toute la sidebar.
 *
 * @ticket SP-506
 */

'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useUnreadCount } from '@/hooks/use-unread-count'

export const MessagesBadge = memo(function MessagesBadge() {
  const { totalUnread } = useUnreadCount()

  if (totalUnread === 0) return null

  return (
    <Badge variant="default" size="sm" className="tabular-nums">
      {totalUnread}
    </Badge>
  )
})
