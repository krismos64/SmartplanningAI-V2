'use client'

/**
 * VideoSection Component
 *
 * Video de presentation, direction editoriale SP-571 : aplat bleu nuit,
 * cadre decale plutot que halo et anneaux pulsants.
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
 */

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { videoFeatures } from '../../data'

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
      className="bg-public-surface-dark py-20 lg:py-28"
    >
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
          <SectionLabel index={index} tone="onDark">
            Vidéo de présentation
          </SectionLabel>

          <div>
            <DisplayTitle
              as="h2"
              id="demo-title"
              accent="en action."
              tone="onDark"
              className="text-public-content-on-dark"
            >
              Découvrez SmartPlanning
            </DisplayTitle>

            <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/80">
              Visualisez en 2 minutes le fonctionnement de SmartPlanning au
              quotidien.
            </p>
          </div>
        </div>

        {/* Lecteur : miniature tant que la lecture n'est pas demandee */}
        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-3 bg-public-accent-surface"
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
                  sizes="(min-width: 1024px) 80vw, 100vw"
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
        <ul className="mt-4 grid gap-px bg-public-border-on-dark sm:grid-cols-3">
          {videoFeatures.map((feature) => (
            <li
              key={feature.id}
              className="bg-public-surface-dark p-6 sm:p-8"
            >
              <h3 className="font-geist font-semibold text-public-content-on-dark">
                {feature.title}
              </h3>
              <p className="mt-2 font-geist text-sm leading-relaxed text-public-content-on-dark/75">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
