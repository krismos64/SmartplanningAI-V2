/**
 * Hook pour le compteur total de messages non-lus
 *
 * @ticket SP-505
 */

'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { onNewMessage } from '@/hooks/use-message-stream'

const SWR_KEY = 'messaging-unread-total'
const REFRESH_INTERVAL = 60000

async function fetchUnreadCount(): Promise<number> {
  try {
    const res = await fetch('/api/messages/unread')
    if (!res.ok) return 0
    const data = (await res.json()) as { total: number }
    return data.total
  } catch {
    return 0
  }
}

export function useUnreadCount() {
  const { data, isLoading, mutate } = useSWR<number, Error>(
    SWR_KEY,
    fetchUnreadCount,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: true,
      fallbackData: 0,
    }
  )

  // Incrémenter quand un nouveau message SSE arrive
  useEffect(() => {
    const unsubscribe = onNewMessage(() => {
      void mutate((current) => (current ?? 0) + 1, false)
    })
    return unsubscribe
  }, [mutate])

  return {
    totalUnread: data ?? 0,
    isLoading,
    mutate,
  }
}
