# 13 août 2026, numérotation des sections, maquette du hero et bandeau défilant

| Champ | Valeur |
|---|---|
| Ticket | SP-574, point 2 laissé ouvert par la session du 12 août |
| Documents produits | `src/components/public/__tests__/section-numbering.test.ts`, `src/app/(landing)/components/sections/TickerSection.tsx` |
| Documents modifiés | `RoleDemosSection.tsx`, `FeaturesSection.tsx`, `MobileSection.tsx`, `HowItWorksSection.tsx`, `BenefitsSection.tsx`, `VideoSection.tsx`, `a-propos/AboutContent.tsx`, `PlanningMockup.tsx`, `HeroSection.tsx`, `LandingPageContent.tsx`, `tailwind.config.ts`, `sections/index.ts` |
| Contrôles | type-check vert, 3163 tests unitaires (188 fichiers), 22 specs publiques dont 7 axe-core, build de production, rangs et dimensions relevés au navigateur |
| Jira | SP-574, trois commentaires : clôture du point 2, maquette du hero, bandeau défilant |
| Mémoire | `refonte-publique-angles-morts` mise à jour |

## Ce qui a été fait

Les pastilles de `SectionLabel` affichent un rang qui doit suivre l'ordre de
lecture. La landing lisait **01, 03, 02, 03, 04, 05, 07, 08, 09** : une
inversion entre `RoleDemos` et `Features`, un doublon sur `03` introduit par la
section mobile ajoutée la veille, puis un trou sur `06` que le doublon avait
décalé.

Renumérotées sur l'ordre de montage réel dans `LandingPageContent`. La landing
lit désormais 01 à 09. `CTASection` reste sans label, c'est un bandeau d'action
final et non une section éditoriale.

### Le journal se trompait sur VideoSection

L'entrée du 12 août la disait « portant l'index 5 sans être montée ». Elle est
bien montée, sur `/a-propos` et non sur la landing, ce que son propre
commentaire d'en-tête documente depuis SP-571.

Le défaut était donc ailleurs, et jamais relevé : `/a-propos` lisait **01, 02,
03, 05, 04**. La vidéo y occupe la quatrième position avec un rang figé à 5, et
« Suivez-nous » venait après en 4.

Le rang de `VideoSection` devient une prop, avec 4 par défaut. Un rang dépend de
la place de la section dans la page qui la monte, pas de la section elle-même :
c'est cette confusion qui a produit le défaut, une constante en dur ne pouvant
pas suivre un déplacement.

### Un garde-fou, parce que rien ne pouvait voir ce défaut

L'index est un nombre écrit en dur dans chaque fichier de section, et la page
qui les monte ne le lit pas. Un réordonnancement laisse donc une numérotation
fausse sans que rien ne bronche : ni le type-check, un nombre restant un nombre,
ni axe-core, la pastille étant `aria-hidden` et décorative, ni un coup d'œil,
la suite ne sautant aux yeux qu'en parcourant la page entière.

`section-numbering.test.ts` lit l'ordre de montage dans la page, résout l'index
déclaré par chaque section, et exige une suite continue depuis 1. La liste des
sections y est explicite plutôt que déduite du JSX, sur le modèle de la liste
d'URL du test de sitemap : elle force à déclarer tout ajout.

Vérifié par mutation sur les quatre défauts, chacun rougissant sur la bonne
assertion : l'inversion d'origine, le doublon d'index, le rang figé de
`VideoSection`, et une section retirée du montage sans mise à jour de la liste.

## Les écarts

**Trois pastilles de plus que prévu.** Le point ouvert ne mentionnait que la
landing. `/a-propos` portait le même défaut depuis SP-571, invisible parce que
personne n'avait relu cette page en comptant.

**Rangs relevés au navigateur, pas seulement en test.** La leçon de la refonte
est que ses défauts se voyaient au rendu et pas dans le code. Une spec
temporaire a lu les pastilles réellement affichées, puis a été supprimée : la
landing donne `01 02 03 04 05 06 07 08 09`, `/a-propos` `01 02 03 04 05`.
`/tarifs` et `/contact` étaient déjà justes, comme les pages secteur et les
guides.

Aucune spec permanente ajoutée, donc la whitelist `testMatch` de la CI reste
inchangée.

## Seconde partie : la maquette du hero

Christophe a comparé le hero au prototype : l'illustration du planning y est
plus grande et ressort mieux. Mesures à l'appui, l'écart était net.

| | Prototype | Avant |
|---|---|---|
| Cadre | 703 x 347 | 560 x 217 |
| Hauteur de ligne | 78 px | 56 px |
| Ombre | bleu franc, 20/30 px sans flou | `shadow-2xl` diffus |
| Fond du cadre | crème | blanc |

Notre maquette était 20 % plus étroite et **37 % moins haute**, et elle
flottait au milieu du vide à droite du titre au lieu d'occuper l'espace.

**Trois causes, aucune évidente à la lecture du code.**

La typographie interne était sous-dimensionnée de bout en bout, de 0,6 à
0,65rem là où le prototype tient 0,5 à 0,8rem avec des lignes de 78 px. Portée
aux valeurs relevées sur son DOM, avatars de 31 px compris.

`lg:grid-cols-2` accordait 576 px à chaque colonne, quand le prototype donne
570 au texte et 703 à la maquette. Elle **déborde volontairement vers la
droite**, au-delà du conteneur. Reproduit par un rapport 1/1,16 et une marge
négative, contenue par l'`overflow-x-hidden` que la landing porte déjà.

L'habillage datait d'avant la refonte : fond blanc, `shadow-2xl` diffus,
teintes `blue-50` et `amber-50`. Le prototype pose le cadre sur le crème avec
l'ombre bleu franc décalée sans flou, motif de toute l'identité, et des pastels
plus saturés (`#dfe8ff`, `#fff0ad`) que les valeurs Tailwind délavaient.

Découverte au passage : les pastilles d'avatar du prototype sont en corail pâle
et lime, **les couleurs de l'identité publique** et non celles de
l'application. Le commentaire du composant justifiait des valeurs Tailwind
fixes par « ce sont les couleurs de l'application que le mockup représente ».
L'argument reste valable pour les créneaux, il ne l'était pas pour les avatars.

### Un défaut trouvé au rendu, pas à la mesure

La première version élargie mesurait bien 711 px en desktop, sans scroll
horizontal nulle part. Elle **cassait le mobile** : à 390 px, la grille à
quatre colonnes imposait une largeur minimale de 450 px qui poussait toute la
grille du hero, coupant « messagerie » et « équipes » dans le paragraphe et
faisant sortir le bouton du cadre.

Les mesures de largeur ne l'avaient pas vu, `scrollWidth` valant 390 grâce à
l'`overflow-x-hidden` qui masquait le débordement au lieu de le signaler. Seule
la capture d'écran l'a montré.

Corrigé par `min-w-0` sur les cellules, puis le troisième créneau masqué sous
`sm` : même contenu à quatre colonnes, les prénoms et horaires se lisaient
« Léa … » et « 09:00 - … ».

### Mesures

| Largeur | Cadre rendu | Scroll horizontal |
|---|---|---|
| 1440 | 711 x 329 | aucun |
| 1280 | 711 x 329 | aucun |
| 768 | 720 x 329 | aucun |
| 390 | 358 x 329 | aucun |

Contre 703 x 347 au prototype, soit 5 % près en hauteur.

**Landing inchangée à 167 kB.** La maquette est du DOM : l'agrandir ne coûte
aucune requête ni aucun octet de JavaScript. C'est l'argument qui avait motivé
son passage en DOM en SP-567, vérifié ici sur un changement d'échelle.

Les 7 specs axe-core restent vertes. La maquette étant `aria-hidden`, axe
n'audite pas ses contrastes, ce qui est cohérent : aucune information n'y est
portée par la seule couleur, le texte du hero porte tout.

## Troisième partie : le bandeau défilant

Le prototype pose une `<section class="ticker">` de 58 px en aplat lime entre
le hero bleu nuit et la section produit crème, faisant défiler les domaines
couverts séparés par des puces corail. Elle n'avait jamais été portée.

Valeurs relevées sur son DOM : hauteur 58 px, texte de 14 px en graisse 800
avec 0,06em d'interlettrage, puces corail à 26 px de marge.

### Deux écarts assumés avec le prototype

**Le défilement est plus rapide**, 92 px/s contre 13, à la demande de
Christophe.

**La boucle est sans couture.** Le prototype rend un seul exemplaire du contenu
et translate de `-20%`, ce qui laisse un vide traverser l'écran à chaque tour.
Ici le contenu est rendu quatre fois pour une translation de `-50%` : la moitié
parcourue ramène exactement au point de départ.

Deux exemplaires ne suffisaient pas, et la première mesure ne l'a pas montré.
Un exemplaire mesure 1154 px, donc deux couvrent 1154 px par moitié, soit
286 px de moins qu'un écran de 1440. Le défaut n'apparaît qu'en fin de boucle,
instant qu'une capture unique a une chance sur quatre de rater. Vérifié en
mesurant la couverture à cinq instants du cycle, dont le passage de boucle : le
contenu couvre la section à chacun.

### Accessibilité

Les trois exemplaires surnuméraires portent `aria-hidden` : sans cela le
lecteur d'écran annoncerait la liste quatre fois. Seul le premier est exposé,
sous l'`aria-label` « Domaines couverts par SmartPlanning ».

`motion-reduce:animate-none` arrête le défilement. **Prouvé par mesure** et non
supposé : sous `prefers-reduced-motion: reduce`, `animationName` passe à `none`
et le contenu reste entièrement lisible, le premier exemplaire remplissant déjà
la largeur. Le contraste du bleu nuit sur lime passe AA, les 7 specs axe-core
restent vertes.

**Landing inchangée à 167 kB**, la page passant de 3,94 à 3,96 kB : l'animation
est du CSS déclaré dans `tailwind.config.ts` et la section un Server Component
sans JavaScript client.

## Prochaine étape

Les trois autres points du 12 août restent ouverts, inchangés :

1. **La whitelist E2E de la CI ne couvre pas les specs `landing/`**. Arbitrage
   jamais pris, revenu à chaque session depuis le 7 août
2. **49 commits non poussés** (mesuré par `git rev-list --count main..HEAD`), la CI n'a jamais tourné sur la refonte
3. **SP-574 passera à Terminé au merge**, avec SP-565 à SP-573
