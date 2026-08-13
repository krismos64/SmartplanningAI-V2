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
 * Mise en page rapprochee du prototype en SP-574. Quatre ecarts corriges :
 * la grande carte laissait environ 300 px de vide sous son texte, son titre
 * etait au meme corps que celui de ses voisines alors qu'elle domine la
 * grille, la quatrieme carte editoriale manquait, et les filets faisaient
 * 4 px au lieu de 5.
 *
 * Le contenu du registre est conserve tel quel. Le prototype reecrit les
 * intitules (« Construisez le planning a la vitesse du terrain » la ou nous
 * avons « Espaces dedies ») : on porte son identite visuelle, jamais son
 * contenu, regle du projet.
 *
 * @see SP-567 - Landing, hero et sections hautes
 * @see SP-574 - Section produit a la mise en page du prototype
 */

import { cn } from '@/lib/utils'
import { BentoCard } from '@/components/public/BentoCard'
import { MiniWeek } from '@/components/public/mockups/MiniWeek'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { features } from '../../data'

/**
 * Les quatre premieres entrees occupent les blocs mis en avant du bento, les
 * suivantes remplissent la grille reguliere. Repartition portee ici plutot
 * que dans le registre : c'est une decision de mise en page, pas une
 * propriete du contenu.
 *
 * Quatre et non trois depuis SP-574 : le prototype pose une quatrieme carte
 * en aplat corail sur toute la largeur de la colonne principale, qui ferme
 * le bloc editorial avant la grille reguliere.
 */
const FEATURED_COUNT = 4

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

        {/* Blocs mis en avant.
            Rapport 1.25 / 0.75 releve sur le prototype : la carte
            principale domine nettement au lieu de partager la largeur. */}
        <div className="mt-16 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
          {featured[0] ? (
            <BentoCard tone="dark" index={1}>
              {/* `justify-between` pousse la mini-semaine en pied de carte :
                  c'est ce qui remplit la hauteur doublee. */}
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="flex flex-col gap-3">
                  <h3 className="max-w-[32rem] font-geist text-3xl font-bold leading-[1.1] tracking-[-0.04em] sm:text-4xl">
                    {featured[0].title}
                  </h3>
                  <p className="max-w-[35rem] text-base leading-relaxed">
                    {featured[0].description}
                  </p>
                </div>

                <MiniWeek />
              </div>
            </BentoCard>
          ) : null}

          <div className="grid gap-3">
            {featured.slice(1, 3).map((feature, index) => (
              <BentoCard
                key={feature.title}
                tone={index === 0 ? 'light' : 'brand'}
                index={index + 2}
              >
                <h3 className="font-geist text-xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed">
                  {feature.description}
                </p>
              </BentoCard>
            ))}
          </div>

          {/* Quatrieme carte, aplat corail sous la carte principale */}
          {featured[3] ? (
            <BentoCard tone="accent" index={4}>
              <h3 className="font-geist text-xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-2xl">
                {featured[3].title}
              </h3>
              <p className="max-w-[35rem] text-base leading-relaxed">
                {featured[3].description}
              </p>
            </BentoCard>
          ) : null}
        </div>

        {/* Grille reguliere */}
        <div className="mt-3 grid gap-px border border-public-border bg-public-border sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((feature, index) => (
            <BentoCard
              key={feature.title}
              tone="light"
              index={index + FEATURED_COUNT + 1}
              rule={false}
              // Les dernieres cartes s'etirent pour combler le rang quand le
              // total ne remplit pas la grille : le fond de la grille est
              // teinte, une cellule vide s'y lit comme un trou. Le reste
              // vaut 7 entrees depuis SP-574, ce qui laisse deux cellules
              // libres sur la derniere ligne.
              className={cn(
                index === rest.length - 1 &&
                  rest.length % 3 === 1 &&
                  'lg:col-span-3',
                index === rest.length - 1 &&
                  rest.length % 3 === 2 &&
                  'lg:col-span-2'
              )}
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
