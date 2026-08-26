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

**Afficher les colonnes CTR et Position, pas seulement clics et impressions.**
Elles sont décochées par défaut, et sans elles le diagnostic est impossible : un
CTR nul à la position 21 est normal, le même à la position 5 signale un titre
qui échoue. Ne pas conclure sur les deux colonnes visibles par défaut.

Mesures du 26 août 2026, sur 3 mois : 4860 impressions, 83 clics, CTR 1,7 pour
cent, position moyenne 18,4. La progression depuis le 11 août est réelle (2730
impressions, position 21,4) mais reste au-dessus du seuil.

Les requêtes métier sortent toutes autour de la position 21 : « logiciel planning
restauration » 261 impressions et 0 clic à la position 21,8, « planning
restauration » 224 impressions et 0 clic à la position 21,6. Réécrire un titre
n'y change rien, personne ne va en page 3.

Attention aussi aux impressions qui ne convertiront jamais : `planning.fr` (223)
et `plannings.fr` (80) sont des recherches de navigation vers un autre site.
Elles gonflent le total et tirent la position moyenne vers le bas.

## Les variantes de marque sont des requêtes distinctes

Google traite `smartplanning` et `smart planning` comme deux requêtes séparées.
Au 26 août 2026, la forme accolée sortait en position 6,5, la forme espacée en
position 41 sur 191 impressions.

La variante n'existait alors que dans un `alternateName` du JSON-LD, signal
faible réservé surtout au Knowledge Panel, et **nulle part dans le contenu
visible** : 56 occurrences accolées contre 2 espacées dans le HTML servi.

Une variante de marque doit vivre dans le contenu rendu, pas seulement dans les
métadonnées. Elle est portée par la meta description de l'accueil, une réponse
de la FAQ (qui alimente le `FAQPage`), les `alternateName` de l'`Organization`
et du `WebSite`, et les deux `llms*.txt`. Garde-fou dans
`__tests__/app/brand-variant.test.ts` : « Smart Planning » est une chaîne
valide, aucun scan ne verrait sa disparition.

Ne pas remanier le `<title>` ni le H1 pour y caser une variante : ils portent la
forme qui se classe déjà.

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

## FaqAccordion, la réponse reste dans le DOM

`src/components/public/FaqAccordion.tsx` est l'accordéon unique des pages
publiques depuis la refonte d'août 2026. Il anime une hauteur par
`grid-template-rows` en CSS et bascule `aria-hidden`. La réponse est
**toujours** présente dans le DOM.

Un montage conditionnel la rendrait invisible aux crawlers et aux assistants,
annulant tout l'intérêt du schéma `FAQPage`.

Le déclencheur est un `<button>` avec `aria-expanded` et `aria-controls`, pas
une `<div>` cliquable : sans cela l'accordéon est inutilisable au clavier.

Même principe pour les panneaux de la navbar : `inert` à l'état fermé, liens
toujours présents. `inert` plutôt qu'`aria-hidden` seul dès qu'un élément
focusable est masqué, sinon il reste atteignable à la tabulation.

## Identité visuelle des pages publiques

Refonte d'août 2026, SP-565 à SP-575. Trois règles à tenir sur toute page
publique, nouvelle ou modifiée.

**Pas de mode sombre.** Les pages publiques n'ont qu'un mode clair. Ne jamais y
écrire de variante `dark:`. L'application privée conserve le sien, avec ses
propres tokens.

**La classe `.public-scope` est obligatoire** sur le conteneur racine, ou via
`PublicPageShell` qui la porte déjà. Le `ThemeProvider` reste monté au layout
racine : sans cette classe, la page suit le thème de l'application et vire au
sombre chez un utilisateur qui l'a choisi.

**Tokens `public-*` uniquement**, définis dans `src/styles/tokens/brand-public.ts`.
Aucune opacité sur les aplats vifs : sur le bleu franc, le blanc plein ne donne
déjà que 4,88:1, sur le corail la limite tombe dès 80 %.

Corollaire mesuré en SP-575 : **sur le bleu franc, seul le blanc pur passe.**
`content-on-dark`, le crème, n'y donne que 4,13:1, et `content-on-vivid`, le
bleu nuit, 3,54:1, tous deux sous le seuil AA. Un aplat bleu prend donc
`text-white` en dur, comme le fait déjà `BentoCard`, et non le token de texte
commun aux autres aplats. C'est la seule teinte de la palette où le token
attendu ne convient pas.

Les primitives vivent dans `src/components/public/` : `PublicPageShell`,
`DisplayTitle`, `SectionLabel`, `BentoCard`, `FaqAccordion`. Les importer par
leur chemin exact, pas par le barrel `@/components/public`, qui réexporte
`ContactForm` et tire react-hook-form dans le bundle initial.

Les pages d'authentification (`src/app/(auth)/`) suivent la même identité
depuis SP-574 : `/login` et `/register` sont atteintes depuis le site public
et sont la dernière étape avant conversion. Leur layout porte `.public-scope`.

Leurs deux moitiés sont **alignées en haut**, jamais centrées verticalement.
Chaque colonne prend la hauteur de la plus grande, imposée par le formulaire :
un centrage y produit un décalage qui varie selon la longueur du formulaire,
300 px sur `/register` et 37 px sur `/login` avant SP-575.

### Le fil d'Ariane vit dans le hero

`PublicPageShell` pose le fil d'Ariane **dans l'aplat du hero**, pas dans une
bande à lui. Il occupait auparavant 112 px de retrait sur du crème, où il
flottait seul en gris.

Le supprimer coûterait le `BreadcrumbList` que Google affiche sous les
résultats : il reste donc rendu, en petites capitales de 11 px, liens en crème,
chevrons corail et page courante en lime.

Les sept pages de contenu ouvrent toutes sur un hero bleu nuit, d'où le défaut
`onDark` de `breadcrumbTone`. Une page qui ouvrirait sur crème doit passer
`onLight`, sinon le lime devient illisible sur fond clair. Le hero qui suit
porte un retrait haut réduit, le fil portant déjà l'écart sous le header fixe.

### Les constantes de style partagées se démodent en silence

`src/app/(landing)/components/styles.ts` porte des constantes de classes qui
servent plusieurs familles de pages. Deux y sont restées au style d'avant la
refonte, chacune découverte des semaines après :

- `PRIMARY_BUTTON_CLASSES` sert les hubs `/solutions` et `/guides` **et** les
  formulaires auth. Un bouton bleu arrondi y a survécu sur trois pages
  refondues, corrigé le 12 août.
- `HIGHLIGHT_TEXT_CLASSES_PUBLIC` valait `text-blue-600`, une couleur Tailwind
  brute et non un token. Corrigé le 13 août.

**Le garde-fou des tokens `public-*` ne peut rien contre ce défaut** :
`text-blue-600` est une classe parfaitement valide, simplement hors palette. Le
scan de classes hors-refonte ne regarde pas non plus les constantes, seulement
le JSX.

Avant de toucher une de ces constantes, suivre ses usages réels : elle sert
probablement plus de pages que son commentaire ne le dit, celui-ci ayant déjà
été périmé deux fois.

### Une page hors périmètre de ticket reste en l'état

Les deux hubs ont traversé toute la refonte sans être touchés, parce qu'aucun
ticket ne les nommait. Ils ont été repris le 13 août, avec les mêmes marqueurs
qu'au premier jour : titre centré, cartes blanches arrondies, badges à icône.

Après une refonte, parcourir les pages rendues une par une plutôt que se fier à
la liste des fichiers modifiés.

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
