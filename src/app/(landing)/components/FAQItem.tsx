'use client'

/**
 * FAQItem Component
 * Expandable FAQ item with animation
 */

import { motion, AnimatePresence } from 'framer-motion'
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
      className="cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/10"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-white/50" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-white/60">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
