'use client'

/**
 * FAQSection Component
 * Frequently asked questions with accordion
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer } from '../../animations'
import { faqs } from '../../data'
import { FAQItem, SectionLogo } from '../index'

export function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  return (
    <section
      id="faq"
      className="bg-gradient-to-b from-transparent via-blue-950/10 to-transparent py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:sticky lg:top-32"
          >
            <motion.span
              variants={fadeInUp}
              className="mb-6 inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400"
            >
              FAQ
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
            >
              Questions{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                fréquentes
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mb-8 text-lg text-white/60"
            >
              Vous ne trouvez pas votre réponse ? Notre équipe est là pour vous
              aider.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
                asChild
              >
                <Link href="#contact">
                  Nous contacter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - FAQ Items */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <FAQItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === i}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <SectionLogo />
      </div>
    </section>
  )
}
