/**
 * Composant NotificationBell - Cloche avec dropdown
 *
 * @ticket SP-322, SP-323
 * @description Icône cloche avec badge compteur et dropdown menu avec liste de notifications
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotificationsCount } from '@/hooks/useNotificationsCount'
import { NotificationList } from './NotificationList'
import { cn } from '@/lib/utils'

// ============================================================================
// Animation variants
// ============================================================================

/** Animation de secousse (shake) pour nouvelles notifications */
const shakeVariants = {
  initial: { rotate: 0 },
  shake: {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
    },
  },
}

/** Animation d'apparition du badge */
const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// ============================================================================
// Component
// ============================================================================

export function NotificationBell() {
  const { count, isLoading, isError } = useNotificationsCount()
  const [isShaking, setIsShaking] = useState(false)
  const previousCountRef = useRef(count)
  const [isOpen, setIsOpen] = useState(false)

  // Déclencher l'animation shake quand le compteur augmente
  useEffect(() => {
    if (count > previousCountRef.current && previousCountRef.current !== 0) {
      setIsShaking(true)
      const timer = setTimeout(() => setIsShaking(false), 600)
      previousCountRef.current = count
      return () => clearTimeout(timer)
    }
    previousCountRef.current = count
    return undefined
  }, [count])

  // Formater le compteur (9+ si > 9)
  const displayCount = count > 9 ? '9+' : count.toString()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          data-testid="notification-bell-button"
        >
          <motion.div
            variants={shakeVariants}
            initial="initial"
            animate={isShaking ? 'shake' : 'initial'}
          >
            <Bell className="h-5 w-5" />
          </motion.div>

          {/* Badge compteur */}
          <AnimatePresence>
            {!isLoading && count > 0 && (
              <motion.div
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute -right-1 -top-1"
              >
                <Badge
                  variant="destructive"
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center p-0 text-xs',
                    count > 0 && 'animate-pulse'
                  )}
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="notification-badge"
                >
                  {displayCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {isLoading && (
            <Skeleton
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full"
              data-testid="notification-loading"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80"
        data-testid="notification-dropdown"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {count} non lue{count > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Liste des notifications (SP-323) */}
        {isError ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-destructive">
              Erreur lors du chargement
            </p>
          </div>
        ) : (
          <NotificationList onClose={() => setIsOpen(false)} />
        )}

        <DropdownMenuSeparator />

        {/* Footer avec lien vers la page complète */}
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-between"
            asChild
            data-testid="notification-view-all"
          >
            <Link href="/app/dashboard/notifications">
              Voir toutes les notifications
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
