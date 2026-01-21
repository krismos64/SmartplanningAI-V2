'use client'

/**
 * ContactSection Component
 *
 * @ticket SP-287
 * @description Section contact sur la landing page
 */

import { Mail, Clock, MapPin } from 'lucide-react'
import { SectionHeader } from '../SectionHeader'
import { ContactForm } from '@/components/public/ContactForm'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'

// Informations de contact
const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@smartplanning.fr',
    href: 'mailto:contact@smartplanning.fr',
  },
  {
    icon: MapPin,
    label: 'Localisation',
    value: 'France',
    href: null,
  },
  {
    icon: Clock,
    label: 'Disponibilité',
    value: '24/24 par email, réponse sous 24h',
    href: null,
  },
]

export function ContactSection() {
  return (
    <section id="contact" className="relative py-24 lg:py-32">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="container-custom relative">
        {/* Header */}
        <SectionHeader
          badge="Contact"
          badgeIcon={<Mail className="h-4 w-4" />}
          color="cyan"
          title="Une question ?"
          titleHighlight="Contactez-nous"
          description="Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans la mise en place de SmartPlanning."
        />

        {/* Content Grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Contact Info */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {contactInfo.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeInUp}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    <item.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <p className="mb-1 text-sm text-white/60">{item.label}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-lg font-medium text-white transition-colors hover:text-cyan-400"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-lg font-medium text-white">
                      {item.value}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Response time */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-sm text-emerald-300">
                <span className="font-medium">Réponse rapide</span> — Nous
                répondons généralement sous 24h ouvrées
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8 lg:p-10"
          >
            <h3 className="mb-6 text-xl font-semibold text-white">
              Envoyez-nous un message
            </h3>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
