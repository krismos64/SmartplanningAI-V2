'use client'

/**
 * VideoSection Component
 *
 * Video de presentation, direction editoriale SP-571 : cadre decale
 * plutot que halo et anneaux pulsants.
 *
 * Ramenee a la mise en page du prototype en SP-575 : texte a gauche,
 * lecteur a droite sur fond creme, la ou la section posait la video en
 * pleine largeur sur bleu nuit et culminait a 1325 px, contre 672 au
 * prototype. Les trois arguments qui suivaient le lecteur sont retires,
 * absents du prototype et redondants avec la section des valeurs montee
 * juste avant. `videoFeatures` n'a plus de consommateur.
 *
 * Reste un Client Component : l'iframe YouTube n'est montee qu'apres un
 * clic, ce qui evite d'embarquer le lecteur au chargement de la page.
 *
 * Utilisee uniquement par /a-propos, malgre son emplacement dans
 * (landing)/components, ou elle est restee depuis SP-285.
 *
 * Le rang du label est une prop et non une constante : il depend de la place
 * de la section dans la page qui la monte, pas de la section elle-meme. Il
 * etait fige a 5 alors que /a-propos la rend en quatrieme position.
 *
 * @see SP-571 - Tarifs, a-propos et pages legales
 * @see SP-574 - Numerotation des sections
 * @see SP-575 - Video a la mise en page du prototype
 */

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'

interface VideoSectionProps {
  /** Rang du label dans la page qui monte la section */
  index?: number
}

export function VideoSection({ index = 4 }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section
      id="demo"
      aria-labelledby="demo-title"
      className="bg-public-surface-subtle py-20 lg:py-24"
    >
      <div className="container-custom">
        {/* Texte a gauche, lecteur a droite : au prototype la section tient
            en 672 px de haut, la vidéo occupant une colonne et non toute la
            largeur. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <div>
            <SectionLabel index={index}>Vidéo de présentation</SectionLabel>

            <DisplayTitle
              as="h2"
              id="demo-title"
              accent="en quelques minutes."
              className="mt-8 text-public-content"
            >
              SmartPlanning,
            </DisplayTitle>

            <p className="mt-6 font-geist text-lg leading-relaxed text-public-content-muted">
              Visualisez en 2 minutes le fonctionnement de SmartPlanning au
              quotidien.
            </p>
          </div>

          {/* Lecteur : miniature tant que la lecture n'est pas demandee */}
          <div>
            <p className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-geist text-[0.625rem] uppercase tracking-[0.16em] text-public-content-muted">
              <span className="font-semibold text-public-accent">
                Présentation
              </span>
              <span>Vidéo produit · YouTube</span>
            </p>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 bg-public-brand-surface"
              />

              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {isPlaying ? (
                  <iframe
                    src="https://www.youtube.com/embed/Drd2_9te5LM?autoplay=1"
                    title="SmartPlanning, vidéo de présentation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <>
                    <Image
                      src="/images/video-promotionnelle.webp"
                      alt="SmartPlanning, vidéo de présentation"
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
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
                      aria-label="Lancer la vidéo de présentation"
                      className="absolute inset-0 flex items-center justify-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-public-highlight"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-public-highlight-surface transition-transform hover:scale-105">
                        <Play
                          aria-hidden="true"
                          className="h-7 w-7 translate-x-0.5 fill-public-content-on-vivid text-public-content-on-vivid"
                        />
                      </span>
                      <span className="bg-public-surface-dark px-3 py-2 font-geist text-[0.625rem] font-bold uppercase tracking-[0.14em] text-public-content-on-dark">
                        Regarder la démo
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
