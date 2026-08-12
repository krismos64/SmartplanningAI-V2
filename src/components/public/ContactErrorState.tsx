'use client'

/**
 * ContactErrorState Component
 *
 * @ticket SP-289
 * @description Affiche un état d'erreur animé avec shake effect
 *
 * Features:
 * - Animation shake à l'apparition
 * - Icône d'erreur animée
 * - Message d'erreur clair
 * - Bouton "Réessayer"
 * - Style Alert destructive (Shadcn)
 * - Accessibilité : role="alert"
 */

import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { XCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  errorContainerVariants,
  errorIconVariants,
} from '@/lib/animations/contact'
import { cn } from '@/lib/utils'

export interface ContactErrorStateProps {
  /** Message d'erreur à afficher */
  message: string
  /** Callback pour réessayer l'envoi */
  onRetry: () => void
  /** Classes CSS additionnelles */
  className?: string
}

export function ContactErrorState({
  message,
  onRetry,
  className,
}: ContactErrorStateProps) {
  const controls = useAnimation()
  const [hasShaken, setHasShaken] = useState(false)

  // Déclencher le shake une fois au montage
  useEffect(() => {
    const triggerShake = async () => {
      await controls.start('visible')
      if (!hasShaken) {
        await controls.start('shake')
        setHasShaken(true)
      }
    }
    void triggerShake()
  }, [controls, hasShaken])

  return (
    <motion.div
      variants={errorContainerVariants}
      initial="hidden"
      animate={controls}
      exit="exit"
      role="alert"
      className={cn('py-4', className)}
    >
      <Alert
        variant="destructive"
        className="rounded-none border-l-4 border-public-accent bg-public-surface-subtle text-public-content"
      >
        {/* Icône animée */}
        <motion.div
          variants={errorIconVariants}
          initial="hidden"
          animate="visible"
        >
          <XCircle className="h-5 w-5 text-public-accent" />
        </motion.div>

        <AlertTitle className="font-geist font-semibold text-public-content">
          Erreur lors de l&apos;envoi
        </AlertTitle>

        <AlertDescription className="mt-2 space-y-4">
          <p className="font-geist text-public-content-muted">{message}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="min-h-[2.75rem] rounded-none border border-public-content bg-transparent font-geist font-semibold text-public-content transition-colors hover:bg-public-content hover:text-public-content-on-dark"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}

export default ContactErrorState
