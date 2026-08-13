# 13 août 2026, la landing rapprochée du prototype

| Champ | Valeur |
|---|---|
| Ticket | SP-574, point 2 laissé ouvert par la session du 12 août |
| Documents produits | `src/components/public/__tests__/section-numbering.test.ts`, `src/app/(landing)/components/sections/TickerSection.tsx`, `src/components/public/mockups/MiniWeek.tsx`, `src/app/(landing)/components/sections/SecuritySection.tsx` |
| Documents modifiés | `RoleDemosSection.tsx`, `FeaturesSection.tsx`, `MobileSection.tsx`, `HowItWorksSection.tsx`, `BenefitsSection.tsx`, `VideoSection.tsx`, `a-propos/AboutContent.tsx`, `PlanningMockup.tsx`, `HeroSection.tsx`, `LandingPageContent.tsx`, `tailwind.config.ts`, `sections/index.ts`, `RoleDemosSection.tsx`, `(landing)/data/index.ts`, `FeaturesSection.tsx`, `BentoCard.tsx`, `PricingSection.tsx`, `LegalSection.tsx`, `a11y.spec.ts`, `FAQSection.tsx`, `ContactSection.tsx`, `sitemap.ts`, `tarifs/PricingPageContent.tsx`, `SectorsHubContent.tsx`, `GuidesHubContent.tsx`, `SectorContent.tsx`, `styles.ts` |
| Contrôles | type-check vert, 3163 tests unitaires (188 fichiers), 22 specs publiques dont 7 axe-core, build de production, rangs et dimensions relevés au navigateur |
| Jira | SP-574, neuf commentaires : clôture du point 2, maquette du hero, bandeau défilant, section des rôles, section produit, section tarifs, bande sécurité, page /tarifs, hubs et pages secteur |
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

## Quatrième partie : la section des rôles

Christophe a demandé que la section « pour chaque rôle » ressemble au
prototype, plus compacte et plus simple. Mesure : **1466 px de haut contre
555**, presque trois fois plus.

L'écart venait de trois blocs que le prototype ne porte pas. Un titre de
section avec son chapô, la vidéo en pleine largeur sous le texte au lieu d'être
à côté, et cinq points clés par rôle listés dessous.

### Deux arbitrages soumis à Christophe

**Les cinq points clés sont retirés**, soit 15 lignes de texte indexable sur
les trois rôles. Ils ne servaient que cette section : aucun JSON-LD, aucun test,
absents de `llms.txt`. Le contenu qu'ils portent, audit, RGPD, import CSV, est
déjà couvert par les pages secteur et les guides, qui sont les pages réellement
classées sur ces requêtes. La landing ne l'est pas. Le champ `highlights` reste
dans les données.

**Le h2 porte le titre du rôle actif** et non plus un titre de section fixe.
« Une vue claire de l'entreprise » plutôt que « SmartPlanning s'adapte à chaque
rôle » : il change avec l'onglet, reste unique à tout instant, et dit quelque
chose de concret. Vérifié après coup, la page garde un seul h1, une hiérarchie
de titres cohérente et aucun identifiant dupliqué.

Deux champs ajoutés aux données, `headline` et `pitch`, repris des formulations
du prototype. `description` reste en place, le JSON-LD des vidéos l'utilise.

### Un piège ARIA évité de justesse

En sortant le `SectionLabel` du bloc des onglets, je l'avais d'abord placé
**dans** le conteneur `role="tablist"`. Ce rôle n'admet que des éléments `tab`
parmi ses enfants : un paragraphe y aurait cassé le motif. Corrigé avant
vérification, le label vit dans la colonne et le `tablist` ne contient que les
trois boutons.

Le motif tablist est conservé intégralement, navigation par flèches comprise.
Vérifié au clic et au clavier : `aria-selected` suit la sélection, le panneau
change, `ArrowRight` déplace le focus et la sélection ensemble.

### Mesures

| | Prototype | Avant | Après |
|---|---|---|---|
| Hauteur | 555 px | 1466 px | **550 px** |

Landing inchangée à 167 kB. Les 7 specs axe-core restent vertes.

## Cinquième partie : la section produit

Christophe l'a trouvée moins réussie que celle du prototype. La structure était
pourtant déjà la bonne, grille bento et aplats francs compris : l'écart tenait
à quatre détails, tous mesurés sur le DOM du prototype.

**La grande carte laissait environ 300 px de vide** sous son texte. Elle est
deux fois plus haute que ses voisines pour équilibrer la grille, et rien ne
remplissait cet espace. Le prototype y pose une bande de cinq jours. `MiniWeek`
la porte, construite en DOM comme `PlanningMockup`, donc aucune requête image,
et entièrement `aria-hidden` : les horaires illustrent le propos sans rien
apporter comme information.

**Son titre était au même corps que celui de ses voisines**, alors qu'elle
domine la grille. Passé à 3xl/4xl contre xl/2xl.

**La quatrième carte éditoriale manquait**, un aplat corail sur la largeur de
la colonne principale qui ferme le bloc avant la grille régulière.
`FEATURED_COUNT` passe de 3 à 4, et la grille adopte le rapport 1,25 / 0,75 du
prototype au lieu de deux colonnes égales.

**Les filets faisaient 4 px au lieu de 5.** À 4 px un filet se lit comme une
bordure, à 5 il devient un marqueur graphique.

### Un trou introduit par ma propre correction

Passer `FEATURED_COUNT` à 4 a laissé 7 entrées dans la grille régulière au lieu
de 8. La règle de comblement ne traitait que le reste de 2 : avec un reste de 1,
deux cellules restaient vides sur la dernière ligne. Le fond de la grille étant
teinté, elles se lisaient comme un trou beige. La règle traite désormais les
deux cas.

### Ce qui n'a pas été repris

Le prototype réécrit les intitulés, « Construisez le planning à la vitesse du
terrain » là où le registre porte « Espaces dédiés ». On porte son identité
visuelle et jamais son contenu, règle du projet. Les 11 modules sont conservés
contre 6 au prototype : les réduire supprimerait du texte indexable sans gain
visuel, la grille les absorbant sans peine.

Le vide résiduel de la carte principale vient de sa description, plus courte
que celle du prototype. C'est du contenu et non de la mise en page.

### Vérification collatérale

`BentoCard` sert aussi `PricingSimulator`, le filet de 5 px touche donc
`/tarifs`. Page contrôlée au rendu, aucune régression.

Fausse alerte au passage : `/tarifs` a renvoyé un 500 pendant les
vérifications. Cause trouvée dans le log, un `npm run build` lancé pendant que
le serveur de dev tournait, les deux se disputant `.next`. Rien à voir avec le
code, 200 après redémarrage.

| | Prototype | Avant | Après |
|---|---|---|---|
| Carte principale | 767 x 502 | 753 x 398, vide en pied | 753 x 398, remplie |
| Cartes latérales | 460 x 245 | 452 x 193 | 452 x 193 |

Landing inchangée à 167 kB.

## Sixième partie : la section tarifs, et deux défauts d'accessibilité

Christophe préfère la version du prototype, plus simple et compacte, sans
simulateur en landing. **1365 px contre 518.** Après comparaison, son avis se
défend sur trois points concrets.

**Le prix apparaissait trois fois dans le même écran** : dans le titre (2,90 €),
dans le simulateur (29,00 €), dans la carte (2,90 € encore). La répétition
dilue au lieu d'appuyer.

**Deux CTA concurrents** menaient au même endroit, « Essayer 21 jours » et
« Démarrer l'essai gratuit », côte à côte.

**La landing dupliquait `/tarifs`**, refaite à la passe 5 précisément pour
porter le simulateur. Cette page avait déjà vu `PricingCard` retirée pour ce
même motif de répétition du prix : le diagnostic valait aussi ici.

La section redevient un **Server Component**, elle était `'use client'` pour la
seule raison qu'elle portait l'effectif saisi.

Rien ne se perd, vérifié avant de supprimer. Le JSON-LD `Offer` vit dans
`StructuredData.tsx` et déclare le prix aux moteurs indépendamment. Le message
destiné aux équipes de plus de 50 employés, qui pousse vers `/contact`, existe à
l'identique sur `/tarifs`. Le page object E2E des tarifs cible déjà `/tarifs`.

Résultat **531 px** contre 518 au prototype, un seul CTA, parcours vérifié au
clic jusqu'au simulateur.

### Un échec axe qui en cachait deux autres

Le spec des pages légales a rougi pendant la vérification. Trois fausses pistes
avant la bonne, et deux défauts réels au bout.

J'ai d'abord cru à un flake : vert en isolation, rouge en suite. Puis à une
compilation à la demande du serveur de dev, **hypothèse fausse**, l'échec se
reproduisant sur un build de production. `git stash` a montré qu'il était
**antérieur à mon travail**.

Le premier message que j'avais lu, un contraste de 1,59:1, venait d'un run en
cache et m'a fait chercher une couleur qui n'existait pas. Le vrai relevé
donnait 3,88:1 sur un encadré « Important ».

**Défaut 1, le spec mesurait trop tôt.** Le conteneur `.legal-content` est animé
par Framer Motion, qui anime en JavaScript sans consulter
`prefers-reduced-motion` : l'émulation ajoutée le 12 août ne le couvre pas. Un
instant après `networkidle`, il reste à `opacity: 0`, et axe lit un bleu nuit
`#0f1b2d` comme `#757980`. En suite complète la machine est plus chargée,
l'animation traîne, et la mesure tombe pendant le fondu. Le spec attend
désormais la fin de l'apparition.

Première tentative trop large : attendre que **tous** les éléments soient
stables expire sur ceux qu'on laisse volontairement transparents, et faisait
échouer `/tarifs` en plus. L'attente cible le conteneur animé.

**Défaut 2, révélé par le premier correctif.** Les liens des pages légales
n'étaient soulignés qu'au survol. Un lien posé dans un paragraphe ne peut pas se
distinguer par la seule couleur, son contraste avec le texte voisin ne valant
que 2,3:1 (règle axe `link-in-text-block`). Trois occurrences dans
`LegalSection`, soulignées en permanence.

Ce second défaut vivait derrière le premier : tant que le spec échouait sur le
contraste, axe n'allait pas plus loin. Un audit qui rougit au hasard ne masque
pas seulement du bruit, il masque de vrais défauts.

**22 specs vertes sur trois passages consécutifs**, contre un échec
reproductible avant. Landing inchangée à 167 kB.

## Septième partie : la bande sécurité

Le prototype porte au rang 07 une bande sécurité en aplat lime que la version
réelle n'avait pas. Christophe l'a demandée avec **le visuel du prototype mais
un contenu simplifié**, sans jargon, pour rassurer un client sur ses données.

Le visuel est repris tel quel : deux colonnes 1,05 / 0,95, grand titre à gauche,
trois garanties en filets à droite.

### Pourquoi le contenu du prototype ne pouvait pas être repris

Il s'adresse à un développeur : « chiffrement HTTPS/TLS », « mots de passe
hachés avec bcrypt », « isolation par entreprise », « les actions sensibles sont
journalisées ». Exact, et illisible pour le lecteur réel de cette page, qui
dirige une TPE et se demande si les données de ses salariés sont en sécurité.

Les trois garanties passent de « Isolation / Accès / Traçabilité » à **« Vos
données / Qui voit quoi / En cas de doute »**, et disent ce que cela change pour
lui plutôt que comment c'est implémenté. Le titre passe de « Les données de
chaque entreprise restent dans leur périmètre » à « Vos données RH restent chez
vous ».

Aucun terme technique conservé sauf ISO 27001 et RGPD, deux repères qu'un
dirigeant connaît et cherche.

### Chaque affirmation est vérifiable

Une page publique engage, rien n'y est promis que le produit ne tienne. Les
faits ont été vérifiés dans le dépôt avant rédaction : l'hébergement OVHcloud en
France et la certification ISO 27001 figurent déjà dans la FAQ et les mentions
légales, les garanties d'accès support dans l'article 9 des CGU, export et
suppression dans la politique de confidentialité.

### Le garde-fou a servi

Insérer une section au rang 7 décale Tarifs, FAQ et Contact. Le test de
numérotation écrit ce matin **a rougi sur l'ajout non déclaré**, en nommant les
sections dont le rang ne suivait plus. Exactement ce pour quoi il a été écrit,
quelques heures après.

`PAGE_LAST_MODIFIED.home` passe au 13 août, la landing ayant changé. `llms.txt`
liste les pages et non leurs sections, `llms-full` est généré depuis les
registres secteurs et guides : ni l'un ni l'autre n'est concerné, vérifié.

**607 px** contre 630 au prototype. Audit axe ciblé sur la section : zéro
violation, texte bleu nuit sur lime à 13,90:1. Landing inchangée à 167 kB.

## Huitième partie : la page /tarifs

Christophe préfère la page du prototype. **3776 px contre 3042**, même découpage
en cinq sections mais chacune plus haute et moins tenue. Quatre corrections.

**Le hero était fade** : fond crème, titre sur une ligne, 324 px. Il passe sur
aplat bleu nuit avec un titre sur deux lignes, et fait désormais **560 px**,
exactement le prototype. C'est la correction qui change le plus la page :
l'entrée posait zéro contraste.

**L'en-tête du simulateur** portait un titre display et un chapô qui
expliquaient un mécanisme que le curseur montre de lui-même, tout en repoussant
l'élément interactif hors du premier écran. Réduit à une ligne. `#simulator-title`
est conservé, le page object E2E le cible.

**La liste des inclus** vivait sous son titre sur toute la largeur. Elle passe à
droite, rapport 0,8 / 1,2 du prototype, et son chapô disparaît : « toutes les
fonctionnalités sont comprises » redisait le titre que la liste prouve.

**Le titre de FAQ** tenait sur trois lignes, sa colonne étant bornée à 24rem.
Passée au même rapport, et l'accent déplacé pour couper en deux lignes.

### Un défaut d'alignement trouvé au rendu

Avec 13 entrées dont deux passent sur deux lignes, les filets des deux colonnes
se décalaient progressivement et la grille se lisait de travers. Invisible dans
le code, évident sur la capture. Corrigé par une hauteur de ligne uniforme calée
sur l'entrée la plus longue.

### Vérifications propres à cette page

Les huit sélecteurs du page object E2E (`e2e/pages/pricing.page.ts`) ont été
contrôlés un par un sur la page rendue, tous présents, 13 items dans la liste.
Aucun spec ne l'utilise aujourd'hui, mais il reste dans le dépôt et doit rester
valide.

`PAGE_LAST_MODIFIED.tarifs` passe au 13 août.

**Signalé, hors périmètre :** `PricingCard` n'a plus aucun appelant depuis son
retrait de la landing à la passe précédente. Seul le barrel l'exporte encore.
Le commentaire d'en-tête de `/tarifs`, qui la présentait comme servant toujours
la landing, est corrigé.

| | Prototype | Avant | Après |
|---|---|---|---|
| Page | 3042 px | 3776 px | **3690 px** |
| Hero | 560 px | 324 px | **560 px** |

`/tarifs` inchangée à 200 kB, 22 specs publiques vertes dont son audit axe.

## Neuvième partie : les hubs et les pages secteur

Christophe a trouvé `/solutions` et les pages d'article bien meilleures sur le
prototype. Diagnostic : **les deux hubs avaient totalement échappé à la
refonte**, comme le formulaire de contact et les pages auth avant eux.

Marqueurs sans ambiguïté : titre centré avec accent `text-blue-600` brut,
cartes blanches à bordure fine, badges arrondis à icône, CTA en encart centré à
bouton arrondi. L'identité d'avant SP-565, intacte.

Les pages secteur, elles, **étaient bien refondues**. Seul leur hero restait sur
crème, sans contraste à l'entrée de page.

### Une constante partagée restée en arrière

`HIGHLIGHT_TEXT_CLASSES_PUBLIC` valait `text-blue-600`, une couleur Tailwind
brute. Son commentaire expliquait qu'elle existait pour retirer la variante
`dark:` de la version privée, mais personne n'avait remplacé la couleur par un
token.

Le garde-fou des tokens `public-*` ne pouvait pas la voir : `text-blue-600` est
une classe parfaitement valide, simplement hors palette. C'est exactement le
motif de `PRIMARY_BUTTON_CLASSES`, corrigée pour la même raison le 12 août.
Passée à `public-brand-on-light`, de même valeur : le changement est structurel,
pas visuel.

### Ce qui a été porté

Hero sur aplat bleu nuit et cartes en aplats vifs à filet noir sur les deux
hubs, maillage croisé en filets, CTA en bandeau corail pleine largeur. Le hero
des pages secteur suit, avec CTA lime et intro métier sur deux colonnes.

**Un écart assumé avec le prototype :** sa troisième carte est jaune, teinte
absente de la palette publique. Elle prend le crème contrasté plutôt que le bleu
franc, sur lequel seul le blanc tient (4,88:1) : le bleu nuit n'y passe pas et
la série perdrait sa couleur de texte commune. Étendre la palette pour une seule
carte serait disproportionné.

### Les audits ajoutés ont trouvé mon propre défaut

Les deux hubs n'avaient **aucun audit axe**. Je les ai ajoutés, et ils ont
immédiatement rougi sur un défaut que je venais d'introduire :
`content-on-vivid/80` sur la date des cartes tombe à **4,29:1** sur le corail,
contre 5,41 sans opacité.

La règle du projet interdit l'opacité sur les aplats vifs. Je l'ai enfreinte
dans les deux hubs, et c'est l'audit ajouté dans la même passe qui l'a
rattrapée. Sans lui, le défaut partait en production.

**24 specs publiques vertes**, dont 9 audits axe contre 7. Aucune spec renommée
ni supprimée, la whitelist CI reste inchangée, et ces specs n'y sont toujours
pas.

Les dates des registres ne bougent pas : seule la présentation change, les
modifier signalerait à tort un contenu réécrit à Google.

## Prochaine étape

Les trois autres points du 12 août restent ouverts, inchangés :

1. **La whitelist E2E de la CI ne couvre pas les specs `landing/`**. Arbitrage
   jamais pris, revenu à chaque session depuis le 7 août
2. **61 commits non poussés** (mesuré par `git rev-list --count main..HEAD`), la CI n'a jamais tourné sur la refonte
3. **SP-574 passera à Terminé au merge**, avec SP-565 à SP-573
