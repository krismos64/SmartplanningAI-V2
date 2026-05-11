'use client'

/**
 * RoleDemosSection Component
 *
 * Section démos vidéo par rôle (Directeur / Manager / Employé) avec
 * un système d'onglets : une seule iframe YouTube chargée à la fois.
 *
 * @description Permet aux visiteurs de s'identifier au rôle qui les concerne
 * et de visualiser concrètement ce que SmartPlanning leur apporte au quotidien.
 */

import { useState } from 'react'
import Image from 'next/image'
import { Play, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  motion,
  FramerAnimatePresence,
  fadeInUp,
  staggerContainer,
} from '@/lib/animations'
import { roleDemos, type RoleDemo } from '../../data'
import { SectionHeader, SectionLogo, SECTION_COLORS } from '../index'

export function RoleDemosSection() {
  const [activeRoleId, setActiveRoleId] = useState<RoleDemo['id']>('director')
  const [isPlaying, setIsPlaying] = useState(false)

  const activeRole = (roleDemos.find((demo) => demo.id === activeRoleId) ??
    roleDemos[0]) as RoleDemo
  const colors = SECTION_COLORS[activeRole.badgeColor]

  const handleRoleChange = (id: RoleDemo['id']) => {
    setActiveRoleId(id)
    setIsPlaying(false)
  }

  return (
    <section
      id="role-demos"
      className="bg-gradient-to-b from-transparent via-violet-950/10 to-transparent py-24 lg:py-32"
    >
      <div className="container-custom">
        <SectionHeader
          badge="Démos par rôle"
          color="violet"
          title="Voyez SmartPlanning"
          titleHighlight="selon votre rôle"
          description="Trois démonstrations courtes pour comprendre concrètement ce que SmartPlanning vous apporte au quotidien, selon votre poste dans l'entreprise."
          marginBottom="mb-12 lg:mb-16"
        />

        {/* Tabs de sélection du rôle */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mb-10 flex max-w-3xl flex-col gap-3 sm:flex-row sm:gap-4"
          role="tablist"
          aria-label="Sélection du rôle utilisateur"
        >
          {roleDemos.map((demo) => {
            const isActive = demo.id === activeRoleId
            return (
              <motion.button
                key={demo.id}
                variants={fadeInUp}
                onClick={() => handleRoleChange(demo.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`role-panel-${demo.id}`}
                id={`role-tab-${demo.id}`}
                className={cn(
                  'group relative flex flex-1 items-center gap-3 rounded-xl border bg-card/50 p-4 text-left transition-all',
                  isActive
                    ? 'border-transparent shadow-lg'
                    : 'border-border/50 hover:border-primary/30'
                )}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Gradient actif */}
                {isActive && (
                  <motion.span
                    layoutId="active-role-bg"
                    className={cn(
                      'absolute inset-0 rounded-xl bg-gradient-to-br opacity-10',
                      demo.color
                    )}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}

                <div
                  className={cn(
                    'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
                    demo.color
                  )}
                >
                  <demo.icon
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </div>

                <div className="relative">
                  <p className="font-semibold text-foreground">{demo.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {demo.tagline}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Panneau actif : vidéo + highlights */}
        <FramerAnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            id={`role-panel-${activeRole.id}`}
            role="tabpanel"
            aria-labelledby={`role-tab-${activeRole.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10"
          >
            {/* Vidéo */}
            <div className="relative">
              {/* Glow */}
              <div
                className={cn(
                  'absolute -inset-4 rounded-3xl bg-gradient-to-r opacity-20 blur-2xl',
                  activeRole.color
                )}
              />

              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="relative aspect-video w-full">
                  {!isPlaying ? (
                    <>
                      {/* Thumbnail dégradé + logo */}
                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-br',
                          activeRole.color
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a]/80 via-[#0f0f2a]/70 to-[#1a1a3a]/80" />
                      <Image
                        src="/images/logo-sp.png"
                        alt={`SmartPlanning — Démo ${activeRole.label}`}
                        width={400}
                        height={260}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90 drop-shadow-2xl sm:w-[360px] md:w-[420px]"
                      />

                      {/* Badge rôle */}
                      <div className="absolute left-4 top-4 z-10">
                        <span
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md',
                            colors.border,
                            colors.bg,
                            colors.text
                          )}
                        >
                          <activeRole.icon
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Espace {activeRole.label}
                        </span>
                      </div>

                      {/* Bouton play */}
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center"
                        aria-label={`Lancer la démo ${activeRole.label}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative"
                        >
                          <div
                            className={cn(
                              'absolute inset-0 animate-ping rounded-full bg-gradient-to-br opacity-30',
                              activeRole.color
                            )}
                          />
                          <div
                            className={cn(
                              'absolute -inset-4 rounded-full bg-gradient-to-br opacity-20 blur-xl',
                              activeRole.color
                            )}
                          />
                          <div
                            className={cn(
                              'relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl sm:h-24 sm:w-24',
                              activeRole.color
                            )}
                          >
                            <Play className="h-8 w-8 fill-white text-white sm:h-10 sm:w-10" />
                          </div>
                        </motion.div>
                      </button>
                    </>
                  ) : (
                    <iframe
                      src={`https://www.youtube.com/embed/${activeRole.videoId}?autoplay=1`}
                      title={`Démo SmartPlanning — Espace ${activeRole.label}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="flex flex-col gap-6">
              <div>
                <p
                  className={cn(
                    'mb-2 text-sm font-medium uppercase tracking-wider',
                    colors.text
                  )}
                >
                  {activeRole.tagline}
                </p>
                <h3 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                  Espace{' '}
                  <span
                    className={cn(
                      'bg-gradient-to-r bg-clip-text text-transparent',
                      colors.gradient
                    )}
                  >
                    {activeRole.label}
                  </span>
                </h3>
                <p className="text-muted-foreground">
                  {activeRole.description}
                </p>
              </div>

              <ul className="space-y-3">
                {activeRole.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <CheckCircle2
                      className={cn('mt-0.5 h-5 w-5 shrink-0', colors.text)}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground/90 sm:text-base">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </FramerAnimatePresence>

        <SectionLogo />
      </div>
    </section>
  )
}
