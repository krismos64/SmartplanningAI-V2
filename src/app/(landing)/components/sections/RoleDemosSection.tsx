'use client'

/**
 * RoleDemosSection Component
 *
 * Demos video par role, direction editoriale SP-568 : aplat bleu nuit,
 * liste d'onglets en filets plutot que cartes a degrades.
 *
 * Mise en page reprise du prototype en SP-574. Elle tenait sur 1466 px de
 * haut contre 555 au prototype, en empilant un titre de section, un chapo,
 * la video en pleine largeur puis cinq points cles. Trois blocs supprimes,
 * et le texte passe a cote de la video au lieu d'etre au-dessus.
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
 * Le h2 porte desormais le titre du role actif et non un titre de section
 * fixe : il change avec l'onglet, reste unique a tout instant, et dit
 * quelque chose de concret plutot que d'annoncer la section.
 *
 * Les cinq points cles par role ont ete retires, decision prise avec
 * Christophe : le prototype ne les porte pas, et ce contenu est deja
 * couvert par les pages secteur et les guides, qui sont les pages reellement
 * classees sur ces requetes. `highlights` reste dans les donnees.
 *
 * @see SP-568 - Landing, sections basses
 * @see SP-574 - Section des roles a la mise en page du prototype
 */

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
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
      className="bg-public-surface-dark py-20 lg:py-28"
    >
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-[17.5rem_1fr] lg:items-center lg:gap-16">
          {/* Colonne des onglets, precedee du label de section.
              Le label est hors du `tablist` : ce role n'admet que des
              elements `tab` parmi ses enfants. */}
          <div>
            <SectionLabel index={2} tone="onDark" className="mb-10">
              Pour chaque rôle
            </SectionLabel>

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
                      'flex min-h-[3.5rem] items-center gap-4 border-b border-public-border-on-dark py-4 text-left font-geist transition-[color,padding] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark',
                      isActive
                        ? 'pl-2 text-public-highlight'
                        : 'text-public-content-on-dark/75 hover:text-public-content-on-dark'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="text-[0.625rem] tabular-nums opacity-70"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg font-semibold">{demo.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Panneau actif : texte et video cote a cote, dans le rapport
              0.7 / 1.3 du prototype. */}
          <div
            id={`role-panel-${activeRole.id}`}
            role="tabpanel"
            aria-labelledby={`role-tab-${activeRole.id}`}
            tabIndex={0}
            className="grid gap-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-4 focus-visible:ring-offset-public-surface-dark lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-14"
          >
            <div>
              <p className="font-geist text-xs uppercase tracking-[0.1em] text-public-content-on-dark/75">
                {activeRole.tagline}
              </p>

              <h2
                id="role-demos-title"
                className="mt-4 font-geist text-3xl font-bold leading-[1.05] tracking-[-0.045em] text-public-content-on-dark sm:text-4xl"
              >
                {activeRole.headline}
              </h2>

              <p className="mt-6 font-geist text-base leading-relaxed text-public-content-on-dark/80">
                {activeRole.pitch}
              </p>

              <Link
                href="/register"
                className="mt-6 inline-flex items-center gap-2 font-geist text-base font-semibold text-public-content-on-dark underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark"
              >
                Découvrir cet espace
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Video : miniature tant que la lecture n'est pas demandee */}
            <div>
              <p className="mb-3 flex items-baseline justify-between gap-4 font-geist text-xs uppercase tracking-[0.1em]">
                <span className="text-public-highlight">
                  Espace {activeRole.label}
                </span>
                <span className="hidden text-public-content-on-dark/60 sm:inline">
                  Vidéo produit
                </span>
              </p>

              <div className="relative">
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
                        sizes="(min-width: 1024px) 45vw, 100vw"
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
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-public-highlight-surface transition-transform hover:scale-105">
                          <Play
                            aria-hidden="true"
                            className="h-6 w-6 translate-x-0.5 fill-public-content-on-vivid text-public-content-on-vivid"
                          />
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
