'use client'

/**
 * RoleDemosSection Component
 *
 * Demos video par role, direction editoriale SP-568 : aplat bleu nuit,
 * liste d'onglets en filets plutot que cartes a degrades.
 *
 * Reste un Client Component : le choix du role et la lecture de la video
 * portent un etat. Une seule iframe YouTube est chargee, et seulement
 * apres un clic, ce qui evite d'embarquer le lecteur au chargement.
 *
 * Accessibilite : le motif tablist / tab / tabpanel de la version
 * precedente est conserve, avec la navigation par fleches ajoutee en
 * SP-568, attendue par le motif ARIA. Les libelles etaient a 1.30:1 sur
 * l'ancien fond (mesure SP-567), ils passent sur l'aplat sombre.
 *
 * @see SP-568 - Landing, sections basses
 */

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { roleDemos, type RoleDemo } from '../../data'

export function RoleDemosSection() {
  const [activeRoleId, setActiveRoleId] = useState<RoleDemo['id']>('director')
  const [isPlaying, setIsPlaying] = useState(false)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const activeRole = (roleDemos.find((demo) => demo.id === activeRoleId) ??
    roleDemos[0]) as RoleDemo

  const handleRoleChange = (id: RoleDemo['id']) => {
    setActiveRoleId(id)
    // Repasse a la miniature : sans cela, l'iframe du role precedent
    // resterait affichee sous le nouvel onglet
    setIsPlaying(false)
  }

  /**
   * Navigation par fleches, exigee par le motif ARIA tablist : les fleches
   * deplacent la selection, Home et End vont aux extremites.
   */
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(event.key)) return

    event.preventDefault()
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % roleDemos.length
    if (event.key === 'ArrowLeft')
      next = (index - 1 + roleDemos.length) % roleDemos.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = roleDemos.length - 1

    const target = roleDemos[next]
    if (!target) return

    handleRoleChange(target.id)
    tabRefs.current[target.id]?.focus()
  }

  return (
    <section
      id="role-demos"
      aria-labelledby="role-demos-title"
      className="bg-public-surface-dark py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
          <SectionLabel index={3} tone="onDark">
            Pour chaque rôle
          </SectionLabel>

          <div>
            <DisplayTitle
              as="h2"
              id="role-demos-title"
              accent="à chaque rôle."
              tone="onDark"
              className="text-public-content-on-dark"
            >
              SmartPlanning s&rsquo;adapte
            </DisplayTitle>

            <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/80">
              Trois démonstrations courtes, selon votre poste dans
              l&rsquo;entreprise.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
          {/* Onglets */}
          <div
            role="tablist"
            aria-label="Sélection du rôle utilisateur"
            aria-orientation="vertical"
            className="flex flex-col"
          >
            {roleDemos.map((demo, index) => {
              const isActive = demo.id === activeRoleId
              return (
                <button
                  key={demo.id}
                  ref={(el) => {
                    tabRefs.current[demo.id] = el
                  }}
                  type="button"
                  role="tab"
                  id={`role-tab-${demo.id}`}
                  aria-selected={isActive}
                  aria-controls={`role-panel-${demo.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleRoleChange(demo.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    'flex min-h-[3.5rem] items-center gap-4 border-b border-public-border-on-dark py-5 text-left font-geist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark',
                    isActive
                      ? 'text-public-highlight'
                      : 'text-public-content-on-dark/75 hover:text-public-content-on-dark'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="text-xs tabular-nums opacity-70"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl font-semibold">{demo.label}</span>
                </button>
              )
            })}
          </div>

          {/* Panneau actif */}
          <div
            id={`role-panel-${activeRole.id}`}
            role="tabpanel"
            aria-labelledby={`role-tab-${activeRole.id}`}
            tabIndex={0}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-4 focus-visible:ring-offset-public-surface-dark"
          >
            <p className="font-geist text-xs uppercase tracking-[0.2em] text-public-highlight">
              {activeRole.tagline}
            </p>

            <h3 className="mt-4 font-geist text-2xl font-semibold text-public-content-on-dark sm:text-3xl">
              Espace {activeRole.label}
            </h3>

            <p className="mt-4 max-w-xl font-geist text-base leading-relaxed text-public-content-on-dark/80">
              {activeRole.description}
            </p>

            {/* Video : miniature tant que la lecture n'est pas demandee */}
            <div className="relative mt-8">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 bg-public-accent-surface"
              />
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeRole.videoId}?autoplay=1`}
                    title={`Démo SmartPlanning : Espace ${activeRole.label}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <>
                    <Image
                      src={activeRole.thumbnail}
                      alt={`SmartPlanning : démo ${activeRole.label}`}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      aria-label={`Lancer la démo ${activeRole.label}`}
                      className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-inset"
                    >
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-public-highlight-surface transition-transform hover:scale-105">
                        <Play
                          aria-hidden="true"
                          className="h-8 w-8 translate-x-0.5 fill-public-content-on-vivid text-public-content-on-vivid"
                        />
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Points cles */}
            <ul className="mt-8 divide-y divide-public-border-on-dark border-y border-public-border-on-dark">
              {activeRole.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 py-4">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 bg-public-accent-on-dark"
                  />
                  <span className="font-geist text-base text-public-content-on-dark/90">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
