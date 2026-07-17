'use client'

/**
 * FAQItem Component
 * Expandable FAQ item with animation
 */

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}

export function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div
      className="cursor-pointer rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-border"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>
      {/* Reponse toujours presente dans le DOM (SSR/SEO), animee par height.
          Un montage conditionnel la rendrait invisible aux crawlers (SP-552). */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
        aria-hidden={!isOpen}
      >
        <p className="mt-4 text-muted-foreground">{answer}</p>
      </motion.div>
    </div>
  )
}
