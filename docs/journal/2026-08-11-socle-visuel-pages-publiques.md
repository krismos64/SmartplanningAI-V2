# 11 août 2026, socle visuel des pages publiques

| Champ | Valeur |
|---|---|
| Ticket | SP-565, premier des huit tickets de la refonte visuelle publique (SP-565 à SP-572) |
| Documents produits | `src/styles/tokens/brand-public.ts`, `src/app/(public)/fonts.ts`, `src/components/public/SectionLabel.tsx`, `DisplayTitle.tsx`, `BentoCard.tsx`, `src/components/public/__tests__/DisplayTitle.test.tsx`, `src/styles/tokens/__tests__/brand-public.test.ts` |
| Documents modifiés | `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/styles/tokens/index.ts`, `src/components/public/index.ts` |
| Contrôles | `type-check` vert, `npm run test` 3149 tests verts sur 184 fichiers, `npm run build` réussi |
| Jira | SP-565 à SP-572 créés, SP-565 à commenter en fin de sprint |
| Mémoire | fiche sur le couplage typographique app privée / pages publiques |

## Le point de départ

Christophe a fait générer un prototype visuel des pages publiques
(`smartplanning-nouvelle-identite.krismos.chatgpt.site`, en `noindex`) et
demandait si le porter sur le site était possible sans perte SEO, GEO,
accessibilité ni performances.

Analyse du prototype sur ses sept pages : la direction visuelle est nettement
meilleure que l'actuelle, mais le porter tel quel coûterait cher.

| | Site actuel | Prototype |
|---|---|---|
| `/solutions/planning-restaurant` | environ 913 mots | 427 mots |
| Guide `faire-un-planning-equipe` | environ 982 mots | 504 mots |
| JSON-LD page secteur | WebPage, BreadcrumbList, FAQPage | SoftwareApplication seul |
| JSON-LD guide | Article, HowTo, FAQPage | SoftwareApplication seul |
| Mode sombre | 88 règles `dark:`, ThemeToggle | absent |
| Skip-link | présent | absent |
| Cibles tactiles sous 44 px | à mesurer | 35 sur 37 |

Le contenu du prototype ferait d'ailleurs rougir la CI : `sectors.test.ts` exige
800 mots minimum par secteur, `guides.test.ts` 1200 par guide, et une réponse
directe contenant « 2,90 ».

Conclusion retenue : porter l'identité visuelle sur l'architecture existante,
qui est meilleure que celle du prototype, plutôt que l'inverse. Découpage en
huit tickets, une PR chacun, SP-567 servant de point de sortie si la direction
ne convient pas.

## Ce qui a été fait

Le socle, sans toucher au contenu ni au rendu d'aucune page.

**Palette.** Les cinq aplats du prototype convertis en HSL, au format de
`colors.ts`. Chaque teinte porte des variantes de luminosité, et ce n'est pas
cosmétique : le corail 500 sur le crème ne donne que 2,71:1, sous le seuil AA,
alors que c'est exactement le titre signature du prototype (« Plus de clarté. »
en corail sur crème). La variante 700 monte à 4,74:1. Même constat pour le bleu
franc, 4,18:1 en 500 contre 4,65:1 en 600.

**Mode sombre.** Le prototype n'en a pas. La déclinaison est donc une décision
de conception, pas une transposition : le crème cède la place au bleu nuit, le
bleu nuit descend vers un noir plus profond, corail et lime restent les accents,
leur lisibilité sur fond sombre étant déjà acquise.

**Typographie.** Geist et Instrument Serif italique ajoutées comme familles
dédiées (`font-geist`, `font-editorial`).

**Primitives.** `SectionLabel`, `DisplayTitle` et `BentoCard`, en Server
Components. `DisplayTitle` accepte un niveau configurable et n'impose pas de
`h1` : le composant sert aussi les titres de section, et figer le niveau
casserait le plan sémantique que les moteurs et les lecteurs d'écran suivent.

**Test de contraste.** `brand-public.test.ts` recalcule les ratios depuis la
palette plutôt que de faire confiance aux valeurs notées à la main. Validé par
mutation : remettre `coral.500` en accent du mode clair fait rougir le test
« l'accent est lisible sur le fond courant ». Restauré et revérifié.

## Les écarts

**Geist n'a pas pu remplacer `font-sans` comme prévu.** Christophe avait validé
un basculement sur Geist. En préparant, j'ai trouvé que `font-sans` et
`font-display` sont partagées avec l'application privée : définies dans
`typography.ts`, injectées dans `tailwind.config.ts`, utilisées par 65 fichiers
de `src/app/app/` et `src/components/`, et `layout.tsx:268` applique
`font-rajdhani` au `<body>` entier.

Les basculer aurait repeint tout le back-office, hors du périmètre annoncé
(« le backend ne devrait pas être impacté, c'est uniquement le frontend des
pages publiques »). Arbitrage soumis à Christophe avant de coder, et validé :
Geist en famille dédiée aux pages publiques, le back-office garde Rajdhani.
Vérifié par `git diff` que `sans`, `display`, `rajdhani`, `mono` et `serif` sont
inchangées, et que la classe du `<body>` n'a pas bougé.

## Ce qui a été mesuré

Baseline avant refonte, référence pour SP-567 et SP-570 :

| Route | First Load JS |
|---|---|
| `/` | 176 kB |
| `/solutions/[slug]` | 206 kB |
| `/tarifs` | 207 kB |
| Partagé | 102 kB |

Mesures relevées sur la production pendant l'analyse : 627 kB de JavaScript et
1133 nœuds DOM sur la page d'accueil, contre 409 nœuds pour le prototype, qui
n'utilise ni Framer Motion ni IntersectionObserver. C'est le levier de
performance de SP-570.

Dette repérée au passage, traitée dans SP-566 : `landing.module.css` (271
lignes) n'est importé nulle part, et `public/images` pèse 12 Mo avec six PNG de
1,9 Mo et plus.

## Prochaine étape

SP-566, le nettoyage préalable, puis SP-567 qui porte le hero et rend la
direction visuelle jugeable. Le push et la PR sont groupés en fin de sprint.

Deux points restent ouverts : la déclinaison sombre n'a été validée que par le
calcul de contraste, elle demandera un contrôle visuel une fois une vraie page
refondue ; et le choix d'Instrument Serif comme serif signature mérite d'être
confronté au rendu réel sur le hero de SP-567.
