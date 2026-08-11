# Contenu public, SEO et GEO

Charger ce fichier avant de toucher : `src/app/(sectors)/`, `src/app/(guides)/`,
la landing, le header ou le footer public, `src/app/sitemap.ts`,
`src/app/robots.ts`, `public/llms*.txt`, ou tout texte visible par un visiteur
non connecté.

Le contenu public sert deux canaux d'acquisition : la recherche classique et la
citation par les assistants IA. Les deux imposent des contraintes différentes,
détaillées ici.

## Registres data-driven

Les pages secteur (`src/app/(sectors)/solutions/data/`) et les guides
(`src/app/(guides)/guides/data/`) sont pilotés par des registres.

Ajouter une page = **1 fichier de données + 1 ligne au registre**. Le sitemap, le
footer, `generateStaticParams` et les garde-fous de tests suivent
automatiquement. Ne pas créer de route à la main.

SSG strict : `dynamicParams = false`.

Chaque famille de contenu a son hub : `/solutions` pour les secteurs,
`/guides` pour les guides. Une famille sans page parente laisse un 404 sur le
segment intermédiaire, ce qui affaiblit les pages filles au crawl. C'est le
défaut corrigé par SP-563, `/solutions` ayant vécu trois mois en 404 pendant
que ses trois pages filles étaient indexées.

## Mesurer avant de produire une page

Umami ne suffit pas pour une question de visibilité search : il ne compte que
les visiteurs qui acceptent le tracking et n'ont pas de bloqueur. Sur les mêmes
pages en août 2026, il montrait 40 vues quand la Search Console en comptait
2730 impressions, soit un facteur 40.

Avant de proposer une page supplémentaire, lire la Search Console : impressions,
clics et position moyenne par page. Une position au-delà de 15 signifie que le
contenu existant n'est pas encore classé, et qu'une page de plus ne changera pas
le résultat. Le levier est alors l'autorité de domaine.

## Aucun concurrent nommé

Le contenu public ne cite jamais un concurrent nominativement. Positionnement
autonome, décision produit assumée.

Verrouillé par une assertion CI dans `sectors.test.ts` et `guides.test.ts`.

Piège connu : le motif de détection attrape « planning congé ». Reformuler
plutôt que d'affaiblir l'assertion.

## Structure GEO

Pour être cité par un assistant, une page doit répondre avant de convaincre.

- **Réponse directe et citable dans les 100 premiers mots**, prix inclus pour les
  pages secteur
- **FAQ** avec schéma `FAQPage`
- **Dates de fraîcheur réelles**, et `dateModified` en JSON-LD

## FAQItem, la réponse reste dans le DOM

L'accordéon anime une hauteur et bascule `aria-hidden`. La réponse est
**toujours** présente dans le DOM.

Un montage conditionnel la rendrait invisible aux crawlers et aux assistants,
annulant tout l'intérêt du schéma `FAQPage`.

Même principe pour les panneaux de la navbar : `inert` à l'état fermé, liens
toujours présents.

## Navigation

Une nouvelle page publique s'ajoute au header (`LandingHeader`) **et** au footer.

La liste des guides du header est tenue à la main, c'est un Client Component. Un
test la confronte au registre : il échouera si tu ajoutes un guide sans mettre à
jour le header.

## `llms.txt` et `llms-full.txt`

Dans `public/`, à mettre à jour à **chaque** nouvelle page publique.

Orthographe française complète, accents compris. Jamais de concurrent.

## Sitemap

Dates réelles dans `PAGE_LAST_MODIFIED` (`src/app/sitemap.ts`). Toute PR qui
modifie une page publique met à jour sa date.

Jamais `new Date()` : un `lastmod` qui bouge à chaque build est ignoré par
Google.

## Rédaction

Jamais de tiret cadratin ni demi-cadratin (— ou –) dans le contenu produit ou la
documentation : marqueur de texte généré. Deux-points, virgule, parenthèses ou
point selon le contexte.

Cette règle est prospective. Ne pas corriger rétroactivement le contenu déjà
publié, sauf demande explicite. Exception : dans l'interface visible par les
utilisateurs finaux, corriger un cadratin repéré, l'impact est produit et non
seulement rédactionnel.

Orthographe française complète partout, accents et diacritiques compris. Les
identifiants techniques restent en ASCII.
