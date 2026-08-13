/**
 * TickerSection - Bandeau defilant sous le hero
 *
 * Aplat lime pleine largeur qui fait defiler les domaines couverts par le
 * produit, separes par des puces corail. Repris du prototype (SP-574), ou il
 * assure la transition entre le hero bleu nuit et la section produit creme.
 *
 * Server Component : l'animation est purement CSS, aucun JavaScript n'est
 * envoye au client.
 *
 * Accessibilite. Le bandeau porte un `aria-label` et sa liste est lisible
 * par une technologie d'assistance, mais le second exemplaire du contenu est
 * `aria-hidden` : il n'existe que pour la continuite visuelle de la boucle et
 * serait annonce deux fois sinon.
 *
 * `motion-reduce:animate-none` arrete le defilement pour qui a demande moins
 * d'animations. Le contenu reste alors entierement lisible, le premier
 * exemplaire remplissant deja la largeur.
 *
 * @see SP-574 - Hero, bandeau defilant du prototype
 */

/**
 * Domaines couverts, dans l'ordre du prototype. Ils reprennent les modules
 * reels du produit, pas une liste d'arguments : le bandeau annonce le
 * perimetre fonctionnel.
 */
const ITEMS = [
  'Plannings',
  'Congés',
  'Équipes',
  'Tâches',
  'Incidents',
  'Messagerie',
  'Exports',
  'Notifications',
] as const

/**
 * Un exemplaire de la liste, qui mesure environ 1150 px.
 *
 * Rendu quatre fois : la translation de -50 % ramene la seconde moitie
 * exactement la ou la premiere commencait, ce qui donne une boucle sans
 * couture, a condition que cette moitie couvre l'ecran. Deux exemplaires
 * suffisaient jusqu'a 1150 px de large et laissaient un vide de 286 px
 * traverser un ecran de 1440. Quatre couvrent 2300 px par moitie.
 *
 * Le prototype n'en rend qu'un et translate de -20 %, ce qui laisse ce vide
 * visible.
 */
function TickerRun({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center">
          {item}
          <span aria-hidden="true" className="mx-[26px] text-public-accent">
            ●
          </span>
        </li>
      ))}
    </ul>
  )
}

export function TickerSection() {
  return (
    <section
      aria-label="Domaines couverts par SmartPlanning"
      className="flex h-[3.625rem] items-center overflow-hidden bg-public-highlight-surface font-geist text-sm font-extrabold uppercase tracking-[0.06em] text-public-content-on-vivid"
    >
      <div className="flex min-w-max animate-ticker-scroll motion-reduce:animate-none">
        <TickerRun />
        <TickerRun hidden />
        <TickerRun hidden />
        <TickerRun hidden />
      </div>
    </section>
  )
}
