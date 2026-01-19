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
        className="border-red-500/50 bg-red-500/10 text-white"
      >
        {/* Icône animée */}
        <motion.div
          variants={errorIconVariants}
          initial="hidden"
          animate="visible"
        >
          <XCircle className="h-5 w-5 text-red-400" />
        </motion.div>

        <AlertTitle className="text-red-400">
          Erreur lors de l&apos;envoi
        </AlertTitle>

        <AlertDescription className="mt-2 space-y-4">
          <p className="text-white/80">{message}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
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
