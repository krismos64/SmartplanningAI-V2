# 13 août 2026, à propos, guides, fil d'Ariane et purge du code mort

| Champ | Valeur |
|---|---|
| Ticket | SP-575, ouvert après relecture de Christophe au navigateur |
| Documents produits | aucun |
| Documents modifiés | `a-propos/AboutContent.tsx`, `(about)/components/ValueCard.tsx`, `(about)/data.ts`, `guides/components/GuideContent.tsx`, `VideoSection.tsx`, `PublicPageShell.tsx`, `AuthSidePanel.tsx`, `AuthLayoutClient.tsx`, `ContactPageContent.tsx`, `tarifs/PricingPageContent.tsx`, `SectorContent.tsx`, `SectorsHubContent.tsx`, `GuidesHubContent.tsx`, `(landing)/data/index.ts`, `sitemap.ts`, `a11y.spec.ts`, `README.md`, `.claude/rules/seo-content.md` |
| Documents supprimés | 12 composants sans appelant, 2592 lignes |
| Contrôles | type-check vert, 3163 tests unitaires (188 fichiers), 26 specs publiques dont 11 axe-core, build de production, mesures relevées au navigateur sur le prototype et le rendu réel |
| Jira | SP-575 |
| PR | [#73](https://github.com/krismos64/SmartplanningAI-V2/pull/73), draft, CI verte au second run |
| Mémoire | `ou-en-est-le-projet` et `refonte-publique-angles-morts` à mettre à jour |

## Ce qui a été fait

Quatre passes, toutes déclenchées par une relecture au navigateur, puis une
purge du code mort.

### `/a-propos` n'avait pas le rythme d'aplats du prototype

La page vivait en crème d'un bout à l'autre. Comparée au prototype, section par
section au navigateur, quatre écarts :

- Hero sur crème là où le prototype pose un aplat bleu nuit
- **Manifeste absent** : le prototype en fait son geste central, un aplat lime
  pleine largeur avec le texte en grand corps gras à gauche et l'illustration à
  droite. La version SP-574 le rendait en prose grise sur crème
- Valeurs en trois cartes blanches à icône, contre trois aplats alternés crème,
  bleu franc et corail sous un filet de 5 px
- Bande réseaux en cartes crème peu distinctes du fond, contre bleu nuit

Les icônes des cartes de valeurs disparaissent : le prototype n'en pose aucune,
et elles ajoutaient un repère de plus à lire sur une carte qui porte déjà un
rang et un titre.

### Sur le bleu franc, seul le blanc pur passe

La carte bleue de la série des valeurs a demandé une mesure. Les deux tokens de
texte disponibles échouent tous les deux :

- `content-on-dark`, le crème : **4,13:1**
- `content-on-vivid`, le bleu nuit : **3,54:1**

Le blanc pur donne 4,86:1, seul au-dessus du seuil AA. La carte prend donc
`text-white` en dur, comme `BentoCard` le fait déjà sur ce même aplat. C'est la
seule teinte de la palette où le token attendu ne convient pas, ce qui est
maintenant écrit dans `seo-content.md`.

**Prouvé par mutation** : en repassant la carte en `content-on-vivid`, axe
rougit sur `color-contrast` à 3,54:1, puis redevient vert après restauration.

### Les pages guide empilaient tout dans une colonne

`/guides/[slug]` rendait hero, sommaire et prose dans une colonne centrée de
48 rem, sans rupture d'aplat ni repérage possible dans un guide de neuf
sections.

Reprise de la grille du prototype : hero bleu nuit, puis sommaire collant à
gauche (256 px) et prose à droite (672 px), sections séparées par un filet. Sous
`lg` la grille retombe en une colonne, cibles tactiles à 44 px.

Le hub `/guides` avait déjà été repris le 13 août, il n'a pas bougé.

### La section vidéo faisait le double du prototype

**1325 px contre 672.** Elle posait le lecteur en pleine largeur sur bleu nuit,
suivi de trois arguments (« Interface intuitive », « Tout en un », « Résultats
concrets ») absents du prototype et redondants avec la section des valeurs
montée juste avant.

Repassée en deux colonnes sur crème, texte à gauche et lecteur à droite :
**633 px**. Les trois arguments sont retirés, ce qui laisse `videoFeatures` sans
consommateur.

### Le fil d'Ariane occupait une bande pour rien

Il vivait dans 112 px de retrait sur du crème, au-dessus du hero, où il flottait
seul en gris sans rapport avec la palette. Le prototype n'en porte aucun.

Le supprimer coûterait le `BreadcrumbList` que Google affiche sous les
résultats. Il est donc **posé dans le hero lui-même**, en petites capitales de
11 px : liens en crème, chevrons corail, page courante en lime. Contrastes sur
bleu nuit, 7,71:1, 5,41:1 et 13,88:1.

Les sept pages de contenu ouvrent toutes sur un hero bleu nuit, d'où le défaut
`onDark` de `breadcrumbTone`. La prop existe pour une page qui ouvrirait sur
crème, où le lime deviendrait illisible. Les heros perdent la moitié de leur
retrait haut, que le fil porte désormais.

### Deux centrages verticaux qui se cumulaient sur `/register`

Le texte du panneau gauche commençait à 490 px du haut quand la carte du
formulaire commençait à 190.

Le panneau était en `lg:justify-center`, dans une colonne dont la hauteur vient
du formulaire voisin : 1329 px sur `/register` pour un contenu de 500. La
colonne du formulaire était en `items-center`, ce qui produisait l'effet inverse
sur `/login`, où la carte descendait de 37 px.

**Les deux moitiés ne pouvaient pas s'aligner tant que l'une se centrait et
l'autre non.** Les deux passent en alignement haut. Écart mesuré à 0 px sur les
deux pages.

Mon premier correctif ne traitait que le panneau gauche : c'est le test
d'alignement qui a révélé les 37 px restants sur `/login`. Sans lui, le travail
partait à moitié fait.

### 2592 lignes de code mort

Balayage systématique des composants sans appelant, en suivant les imports
réels et non le seul nom de fichier. Douze fichiers n'étaient référencés que par
leur propre barrel, signature du code mort, aucun n'avait bougé depuis six à
huit mois hors corrections de lint, aucun ne portait de test.

| Fichier | Lignes |
|---|---|
| `AvailabilitiesList` | 494 |
| `FormDatePicker` | 293 |
| `FormSelect` | 232 |
| `SchedulesList` | 221 |
| `FormDialog` | 216 |
| `FormTextarea` | 214 |
| `ConfirmDialog` | 204 |
| `LoadingOverlay` | 164 |
| `SkeletonCard` | 150 |
| `SkeletonTable` | 135 |
| `SkeletonText` | 94 |
| `PricingCard` | 111 |

Le dossier `modals/` disparaît entièrement, son barrel ne réexportait plus que
les deux fichiers supprimés.

Côté registres, la refonte avait laissé trois champs orphelins : `videoFeatures`
et son type, le champ `icon` de `values`, et les champs `gradient` et `color` de
`values` et `targets`, qui portaient encore des classes Tailwind brutes d'avant
la refonte.

## Ce qui n'a pas été fait, et pourquoi

**Une dizaine d'exports sans consommateur dans `src/lib`** : `requireAuth`,
`withRoleProtection`, `canAccessCompany`, `apiError`, plus quelques utilitaires
de cache et de formatage. Ils forment une couche d'autorisation cohérente, et un
`grep` ne voit pas un appel dynamique. Y toucher demande son propre ticket, pas
un nettoyage d'accompagnement. `resetRateLimitCache` et `getRateLimitCacheSize`
sortent de la liste, ils servent aux tests.

**Aucune illustration ajoutée.** Question posée par Christophe, tranchée après
mesure : le prototype ne porte aucune illustration hors logo, captures produit
et la photo du manifeste. `/guides`, `/solutions`, `/tarifs` et les pages
secteur n'ont que le logo. L'identité repose sur les aplats et la typographie,
pas sur l'image, et une illustration générée se repère. Le manque réel est
ailleurs, les pages secteur vendent « planning restaurant » sans jamais montrer
un planning de restaurant : ce sont des captures produit qu'il faudrait, pas des
illustrations.

**Le « 28 templates » du README** n'a pas été corrigé. Il y a 22 fichiers pour
32 fonctions de template : le chiffre ne correspond ni à l'un ni à l'autre, mais
on ne sait pas ce qu'il comptait, et le deviner vaut moins que le laisser.

## Mesures

Comparaison entre la production (`smartplanning.fr`, ancienne version) et la
refonte locale, relevée au navigateur sur la landing :

| | Production | Refonte |
|---|---|---|
| `rounded-` | 136 | 25 |
| Dégradés | 36 | **0** |
| Variantes `dark:` | 212 | **0** |
| Halos `blur-` | 22 | 0 |
| H2 | 8 | 13 |
| Mots | 1198 | 1270 |

Les 212 variantes `dark:` tombées à zéro mesurent la règle « pas de mode sombre
côté public » réellement tenue, et pas seulement écrite.

Poids après refonte : landing **167 kB**, `/a-propos` **187 kB** (191 avant le
retrait des trois arguments vidéo), hubs et pages secteur 185 à 186 kB,
`/contact` 226 kB, la plus lourde à cause de react-hook-form.

## PR #73, et le seul test que la CI a fait tomber

Branche poussée, PR #73 ouverte en draft, 68 commits. **Premier passage de la
CI sur ces commits**, après trois journées de travail sans aucun retour
d'intégration.

Un seul test rouge sur 113 : `auth.spec.ts` attendait un titre « Bon retour ! »
sur `/login`. Le panneau éditorial dit « Bon retour » puis « dans votre
équipe. » en italique depuis SP-574, qui a refondu les pages
d'authentification. Le spec n'avait jamais tourné depuis ce changement.

**C'est le test qui était périmé, pas la page.** L'assertion devient une regex
souple sur « Bon retour », comme celle que `middleware-rbac.spec.ts` utilise
déjà au même endroit et qui, elle, passait. Deux specs vérifiaient le même
titre, l'un souple et l'autre exact : seul le second est tombé.

Second run vert sur les quatre jobs, lint et type-check, tests unitaires, E2E
critiques, build.

Deux pièges rencontrés en vérifiant le correctif en local :

- `playwright.ci.config.ts` ne réutilise pas un serveur existant, contrairement
  à la config par défaut. Il faut couper le serveur de dev avant
- Le `.next` était corrompu (`routesManifest.dataRoutes is not iterable`) pour
  avoir laissé un serveur de dev tourner pendant un build. `rm -rf .next` puis
  rebuild. C'est exactement le défaut que `CLAUDE.md` décrit, rencontré pour de
  vrai
- Le test SP-526 échoue en local faute d'un compte seedé avec
  `emailVerified = null`, et passait en CI. Différence d'environnement, pas
  régression : vérifié dans les logs du premier run avant de conclure

## Mergé, déployé, clôturé

PR #73 sortie du draft et mergée en **merge commit** (`d1620df`) plutôt qu'en
squash : les 69 commits restent lisibles dans l'historique de `main`, chaque
décision de design et chaque contraste mesuré avec eux. Le dépôt sert de
vitrine technique, un squash aurait effacé ce raisonnement.

CI verte sur `main`, puis CD vert en 5 min 17. **Vérifié en production** plutôt
que supposé : dix pages en 200, et les marqueurs de la refonte réellement
servis, 0 dégradé contre 36, 0 variante `dark:` contre 212, 25 `rounded-`
contre 136. Manifeste lime présent sur `/a-propos`, fil d'Ariane sur
`bg-public-surface-dark` avec son `BreadcrumbList`, ancienne bande crème
disparue.

### SP-575 n'existait pas dans Jira

Découvert en ouvrant le projet pour clore les tickets : soixante-neuf commits,
le journal, le README et la règle SEO référençaient tous SP-575, sans que le
ticket ait jamais été créé. **Un `SP-XXX` inventé ne déclenche aucune erreur**,
ni au commit, ni au hook de traçabilité.

Créé a posteriori avec la description complète du travail, puis clos. Les onze
tickets SP-565 à SP-575 sont désormais Terminé(e), chacun avec un commentaire
de clôture.

### Branches, trier par diff réel et non par `--merged`

Onze branches locales et trois références distantes supprimées, chacune
vérifiée par ses commits absents de `main` et non par son diff : les diffs
affichaient des milliers de lignes, mais c'était du retard sur `main`, pas du
travail à sauver. Seule `docs/journal-deploiement-sp563` portait deux commits
absents, dont le contenu était déjà sur `main` sous un autre SHA.

Reste `main` et `backup-main-20251203`, gardé comme filet de sécurité.

Deux pièges : GitHub avait déjà supprimé les branches des PRs #70 et #71 à leur
merge, les références locales étaient périmées (`git remote prune`). Et
`git push --delete` a renvoyé une **« Internal Server Error »** sur la branche
de refonte, incident de plateforme et non problème de droits :
`gh api -X DELETE repos/.../git/refs/heads/<branche>` a fonctionné.

### Sitemap, six dates en retard

Relevé en vérifiant la documentation après coup : `/contact` était daté du
12 août alors que le fil d'Ariane l'a modifiée le 13, et les cinq pages légales
du 11 alors que `LegalSection` a changé le 13, les liens y passant d'un
soulignement au survol à un soulignement permanent (défaut axe
`link-in-text-block`, 2,3:1). Les six dates alignées sur le 13.

Le piège : `git log -1 -- <fichier>` renvoie la date du commit de merge et non
celle du dernier changement réel. Il faut `--no-merges`.

## Ce qui reste ouvert

1. **Whitelist E2E** : les 26 specs publiques, dont 11 audits axe, ne tournent
   ni en CI ni ailleurs qu'en local et en nightly. Arbitrage revenu à chaque
   session depuis le 7 août, jamais tranché
2. **Exports morts de `src/lib`**, voir plus haut, demande son ticket
3. **Captures produit sur les pages secteur**, le vrai manque visuel identifié
4. **Nightly** : les runs des 12 et 13 août échouaient sur deux tests de
   `sector-pages.spec.ts` qui tournaient contre l'ancien `main`. Les deux
   passent sur le code mergé, à confirmer au prochain run plutôt qu'à supposer
5. **Liens entrants**, toujours le goulot réel : 2730 impressions pour 71 clics,
   position moyenne 21,4. La refonte améliore la conversion des visiteurs qui
   arrivent, elle n'en fait pas venir davantage
