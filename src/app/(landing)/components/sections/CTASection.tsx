'use client'

/**
 * CTASection Component
 * Call to action section before footer
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from '@/lib/animations'

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 lg:p-20"
        >
          {/* Background Elements */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-400/20 blur-[120px]" />

          <div className="relative z-10 text-center text-white">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Prêt à transformer
              <br />
              votre gestion des plannings ?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
              Commencez dès maintenant à simplifier votre organisation avec
              SmartPlanning. Essai gratuit, sans engagement.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-14 bg-white px-8 text-base font-semibold text-blue-600 hover:bg-white/90"
                asChild
              >
                <Link href="/register">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="h-14 border-2 border-white bg-transparent px-8 text-base font-semibold text-white hover:bg-white hover:text-blue-600"
              >
                Demander une démo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
