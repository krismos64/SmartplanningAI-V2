/**
 * FeaturesSection Component
 *
 * Grille bento asymetrique des fonctionnalites, direction editoriale SP-567.
 *
 * Server Component depuis SP-567. Deux changements de fond par rapport a la
 * version precedente :
 *
 * - L'animation Lottie du haut de section est retiree. `planning-animation.json`
 *   pesait 148 Ko importes statiquement dans le bundle, pour une decoration
 *   sans rapport avec le contenu de la section.
 * - Les cartes ne portent plus d'icone. Le prototype numerote les entrees et
 *   laisse le texte porter le sens, ce qui allege le rendu et supprime autant
 *   d'imports lucide-react.
 *
 * Les donnees viennent du registre `features` : leur contenu n'est pas
 * modifie, seul le rendu change.
 *
 * @see SP-567 - Landing, hero et sections hautes
 */

import { BentoCard } from '@/components/public/BentoCard'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { features } from '../../data'

/**
 * Les trois premieres entrees occupent les blocs mis en avant du bento, les
 * suivantes remplissent la grille reguliere. Repartition portee ici plutot
 * que dans le registre : c'est une decision de mise en page, pas une
 * propriete du contenu.
 */
const FEATURED_COUNT = 3

export function FeaturesSection() {
  const featured = features.slice(0, FEATURED_COUNT)
  const rest = features.slice(FEATURED_COUNT)

  return (
    <section id="features" className="bg-public-surface py-24 lg:py-32">
      <div className="container-custom">
        {/* En-tete de section */}
        <div className="grid gap-8 lg:grid-cols-[auto_1fr_20rem] lg:items-start">
          <SectionLabel index={3}>Le produit</SectionLabel>

          <DisplayTitle
            as="h2"
            id="features-title"
            accent="Plus de clarté."
            className="text-public-content lg:text-center"
          >
            Moins d&rsquo;outils.
          </DisplayTitle>

          <p className="font-geist text-lg leading-relaxed text-public-content-muted">
            SmartPlanning réunit les gestes quotidiens du manager et les
            informations dont l&rsquo;équipe a vraiment besoin.
          </p>
        </div>

        {/* Blocs mis en avant */}
        <div className="mt-16 grid gap-4 lg:grid-cols-2">
          {featured[0] ? (
            <BentoCard tone="dark" index={1} className="lg:row-span-2">
              <h3 className="font-geist text-2xl font-semibold sm:text-3xl">
                {featured[0].title}
              </h3>
              <p className="text-base leading-relaxed">
                {featured[0].description}
              </p>
            </BentoCard>
          ) : null}

          <div className="grid gap-4">
            {featured.slice(1).map((feature, index) => (
              <BentoCard
                key={feature.title}
                tone={index === 0 ? 'light' : 'brand'}
                index={index + 2}
              >
                <h3 className="font-geist text-xl font-semibold sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed">
                  {feature.description}
                </p>
              </BentoCard>
            ))}
          </div>
        </div>

        {/* Grille reguliere */}
        <div className="mt-4 grid gap-px bg-public-border sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((feature, index) => (
            <BentoCard
              key={feature.title}
              tone="light"
              index={index + FEATURED_COUNT + 1}
              rule={false}
              // La derniere carte comble le rang quand le total ne remplit
              // pas la grille : le fond teinte rendrait la cellule vide
              // visible comme un trou.
              className={
                index === rest.length - 1 && rest.length % 3 === 2
                  ? 'lg:col-span-2'
                  : undefined
              }
            >
              <h3 className="font-geist text-lg font-semibold">
                {feature.title}
                {feature.comingSoon ? (
                  <span className="ml-2 align-middle bg-public-accent-surface px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-public-content-on-vivid">
                    À venir
                  </span>
                ) : null}
              </h3>
              <p className="text-sm leading-relaxed text-public-content-muted">
                {feature.description}
              </p>
            </BentoCard>
          ))}
        </div>
      </div>
    </section>
  )
}
