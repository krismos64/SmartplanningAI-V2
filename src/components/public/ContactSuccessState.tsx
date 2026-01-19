'use client'

/**
 * ContactSuccessState Component
 *
 * @ticket SP-289
 * @description Affiche un état de succès animé après envoi du formulaire de contact
 *
 * Features:
 * - Animation checkmark SVG (cercle + coche)
 * - Message personnalisé avec le nom de l'utilisateur
 * - Bouton pour envoyer un autre message
 * - Accessibilité : role="status", aria-live="polite"
 *
 * ✅ Source : Context7 - Framer Motion SVG path animations
 */

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  successContainerVariants,
  successItemVariants,
  checkmarkCircleVariants,
  checkmarkTickVariants,
} from '@/lib/animations/contact'
import { cn } from '@/lib/utils'

export interface ContactSuccessStateProps {
  /** Nom de l'utilisateur pour personnaliser le message */
  name: string
  /** Callback pour réinitialiser le formulaire */
  onReset: () => void
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant SVG animé du checkmark (cercle + coche)
 */
function AnimatedCheckmark() {
  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className="mx-auto"
      initial="hidden"
      animate="visible"
    >
      {/* Cercle de fond */}
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        className="text-emerald-500"
        variants={checkmarkCircleVariants}
        style={{
          strokeLinecap: 'round',
        }}
      />
      {/* Coche */}
      <motion.path
        d="M24 42 L34 52 L56 30"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        className="text-emerald-500"
        variants={checkmarkTickVariants}
        style={{
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />
    </motion.svg>
  )
}

export function ContactSuccessState({
  name,
  onReset,
  className,
}: ContactSuccessStateProps) {
  return (
    <motion.div
      variants={successContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center space-y-6 py-8 text-center',
        className
      )}
    >
      {/* Checkmark animé */}
      <motion.div variants={successItemVariants}>
        <AnimatedCheckmark />
      </motion.div>

      {/* Message principal */}
      <motion.div variants={successItemVariants} className="space-y-2">
        <h3 className="text-2xl font-bold text-white">Merci {name} !</h3>
        <p className="text-lg text-emerald-400">
          Votre message a bien été envoyé.
        </p>
      </motion.div>

      {/* Sous-message */}
      <motion.p
        variants={successItemVariants}
        className="max-w-sm text-white/70"
      >
        Nous vous répondrons dans les 24-48h. Consultez votre boîte mail pour la
        confirmation.
      </motion.p>

      {/* Bouton reset */}
      <motion.div variants={successItemVariants}>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Envoyer un autre message
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default ContactSuccessState
