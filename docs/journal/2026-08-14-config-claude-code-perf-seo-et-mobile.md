# 14 août 2026, configuration Claude Code, polices, SEO et navigation mobile

| Champ              | Valeur                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ticket             | Aucun. Session d'exploration partie d'une question sur la configuration Claude Code, puis six correctifs enchaînés sur demande                                                                                                                                                                                                                                                                                                       |
| Documents produits | `.claude/scripts/hook-etat-session.sh`, `.claude/scripts/hook-verif-mecanique.sh`, `.claude/skills/revue-pre-pr/SKILL.md`, `.claude/agents/public-content-reviewer.md`, `src/app/page-last-modified.ts`                                                                                                                                                                                                                              |
| Documents modifiés | `CLAUDE.md`, `.claude/README.md`, `.claude/settings.json`, `layout.tsx`, `(public)/fonts.ts`, `page.tsx`, `StructuredData.tsx`, `(about)/tarifs/StructuredData.tsx`, `(about)/a-propos/page.tsx`, `(sectors)/solutions/page.tsx`, `SectorsHubContent.tsx`, les trois fichiers de données secteur, `types.ts`, `sitemap.ts`, `LandingFooter.tsx`, `LandingHeader.tsx`, `sectors.test.ts`, `sitemap.test.ts`, `LandingHeader.test.tsx` |
| Contrôles          | type-check vert, Prettier conforme, 3192 tests unitaires sur 190 fichiers, 26 specs publiques dont 7 audits axe-core WCAG AA, Lighthouse mobile sur 5 pages de production, mesures au navigateur aux trois points de rupture                                                                                                                                                                                                         |
| Jira               | Aucun ticket, exploration hors ticket assumée par Christophe. Les huit commits ne portent aucune clé SP-XXX                                                                                                                                                                                                                                                                                                                          |
| Mémoire            | `claude-code-config` réécrite, `ou-en-est-le-projet` mise à jour                                                                                                                                                                                                                                                                                                                                                                     |

## Ce qui a été fait

Six commits, 26 fichiers, 944 insertions. Aucun n'était prévu au départ : la
session est partie d'une question sur la configuration Claude Code et a dérivé
sur les mesures qui en sont sorties.

### Configuration Claude Code (`5d6f09b`)

La configuration existante était déjà mûre. Ce qui manquait n'était pas du
contenu mais des **mécanismes** : trois consignes écrites nulle part vérifiées.

`hook-etat-session.sh`, sur `SessionStart`, pose l'état de départ dans le
contexte. `CLAUDE.md` demandait de lire la dernière entrée de journal en début
de session sans qu'aucun mécanisme ne l'applique. Ce hook a une propriété
qu'aucun autre ne partage : son stdout est injecté comme contexte visible. Le
premier jet déversait le tableau de métadonnées de l'entrée, dont la ligne
« Documents modifiés » fait 400 caractères ; filtré au profit de la prose, qui
porte le pourquoi.

`hook-verif-mecanique.sh`, sur `PostToolUse`, **vérifie** deux pièges au lieu de
les rappeler, parce qu'ils se constatent sans jugement : un spec absent du
`testMatch` de la CI, et un export non-async dans un fichier `'use server'`.
Tous deux documentés trois fois dans `rules/` et survenus quand même. Mesuré
contre les 29 fichiers `'use server'` du dépôt : aucun faux positif, et rouge
sur un cas fautif construit.

S'y ajoutent le skill `revue-pre-pr`, l'agent `public-content-reviewer` et
`includeCoAuthoredBy: false`, qui rend structurelle la règle git n°1.

### Polices (`3bed5db`)

Audit Lighthouse mobile sur la production : LCP de 4,4 s sur `/tarifs` et les
pages secteur, 4,6 s sur `/login`. Cinq polices préchargées en priorité haute,
88 Kio, dont **aucune n'est peinte sur une page publique**.

Le layout racine précharge sur toutes les routes (confirmé via Context7). Inter
et Rajdhani y étaient déclarées, donc les polices du back-office partaient
devant pendant que Geist attendait la résolution du CSS.

**Inter était morte** : sa variable `--font-inter` n'était consommée par aucune
règle CSS ni classe Tailwind. 48 Kio préchargés en priorité haute sur chaque
page, pour un texte que personne ne peignait.

Résultat mesuré, même machine, `git stash` pour rebâtir l'ancien code :

| Page      | LCP avant | LCP après |
| --------- | --------- | --------- |
| Accueil   | 5,0 s     | 4,0 s     |
| `/tarifs` | 4,2 s     | 3,6 s     |
| Secteur   | 4,5 s     | 3,5 s     |

1 police préchargée (28 Kio) au lieu de 5 (88 Kio).

### SEO et GEO (`cfcf8bc`)

Audit complet sur la production. La structure était saine : 17 URL toutes en
200, JSON-LD valide, réponse citable en moins de 100 mots sur les 9 pages de
contenu, et **1103 mots servis en SSR à GPTBot, ClaudeBot, PerplexityBot et
Googlebot à l'identique**, ce qui est la condition première du GEO.

Trois défauts mineurs corrigés : description d'accueil à 209 caractères
(tronquée vers 160 par Google), deux titles au-delà de 60 une fois le template
`| SmartPlanning` ajouté, et `dateModified` absent de `/tarifs` et de l'accueil.

Les dates viennent désormais de `src/app/page-last-modified.ts`, lu par le
sitemap **et** par les composants `StructuredData`. Les deux canaux disaient la
même chose sans jamais se parler.

### Cartes du hub `/solutions` (`d6f5414`)

Les cartes affichaient `sector.intro[0]`, le premier paragraphe entier de la
page de destination : 88, 87 et 104 mots. Le visiteur lisait le texte sur le
hub puis retombait dessus à l'identique après avoir cliqué.

Nouveau champ `teaser`, 24 à 26 mots, sur le modèle des `excerpt` côté guides,
dont le hub rendait déjà bien. Rendu mesuré, titre et date compris : 88 → 39,
87 → 40, 104 → 41 mots.

### Footer mobile (`6169cd9`)

Mesuré au navigateur : **1424 px, soit 1,69 écran** de téléphone. La grille
déclarait `md:grid-cols-2 lg:grid-cols-4` mais aucune colonne sous 768 px.

Les 44 px de cible tactile n'ont pas été touchés : ils représentent 792 px sur
18 liens, c'est le premier réflexe quand on cherche de la hauteur et c'est
exactement ce qu'il ne faut pas rogner. La hauteur vient de la mise en colonnes.

Résultat : **1424 px → 940 px**, desktop inchangé (4 colonnes de 268 px).

### Menu mobile (`f849d2d`)

13 liens de même taille, même graisse et même couleur : rien ne distinguait
« Tarifs » de « BTP et chantiers », et les deux boutons d'action sortaient de
l'écran. Les trois pages secteur retirées du menu, `/solutions` menant au hub
qui les liste. Chevron corail sur les hubs, liens secondaires sur une ligne.

15 liens → 12, aucun hors écran.

## Les écarts

**Deux chantiers proposés puis retirés après vérification.** Le maillage des
guides d'abord : le comptage montrait 19 liens entrants contre 36 pour les
secteurs, et la conclusion « les guides sont sous-maillés » était fausse. Les
secteurs sont dans le header **et** le footer, présents sur 17 pages, ce qui
double mécaniquement leur compte sans qu'aucune page ne les recommande
davantage. Les guides ont les liens qui comptent, ceux placés dans le contenu.
Le travail proposé (croiser les guides, lier depuis les pages secteur) était
déjà fait.

**Les liens secteur restent dans le footer**, contrairement à ce qui était
envisagé en séance. Ce sont les liens de maillage SP-552, et un test E2E vérifie
que le footer pointe vers la page secteur. Les retirer aurait coûté le maillage
sur les 17 pages, pas seulement en mobile.

**Le CTA du menu garde son couple de couleurs.** Une teinte inédite aurait
demandé une mesure de contraste ; `highlight-surface` / `content-on-vivid` sert
déjà une vingtaine d'aplats publics et passe les audits. Le CTA gagne en
présence par la taille et la graisse.

**Trois tests réparés, dont deux qui ne testaient plus rien.** Le test du
sitemap disait l'ancienne règle du hub et rougissait. Sa première réécriture
passait **même en cassant le code**, le `Math.max` retombant sur la date des
pages filles. Le test du header, lui, visait les trois libellés de secteur et a
survécu à leur retrait sans rien signaler : il les trouvait dans le panneau
desktop, monté en permanence dans le DOM pour le maillage. Les trois nouveaux
garde-fous sont **prouvés par mutation**, cassés volontairement puis restaurés.

**Deux fausses pistes.** Un bloc JSON-LD signalé « invalide » venait d'une regex
débordant sur le script Next.js suivant, le même symptôme apparaissant en
production sur du code intact. Et un `routesManifest.dataRoutes is not
iterable` venait d'un `.next` corrompu par un `pkill`, réglé par un build depuis
zéro.

## Livraison

Les commits sont restés locaux pendant toute la session, à la demande explicite
de Christophe, puis poussés en fin de session. **PR #76 mergée, déployée et
vérifiée en production le 14 août.**

CI verte sur la branche puis sur `main`, quatre jobs dont les E2E. CD vert sur
les trois étapes, image, migrations et déploiement VPS. Conteneur
`smartplanning-app` en `healthy`.

Vérifié sur `smartplanning.fr` après déploiement, et non déduit du statut du
workflow : 1 preload de police au lieu de 5, descriptions et titles aux
longueurs corrigées, `dateModified` présent sur `/` et `/tarifs`, cartes du hub
à 39, 40 et 41 mots, `/solutions` daté du 14 août au sitemap quand ses pages
filles restent au 11, menu mobile à 12 liens sans aucun hors écran, footer à
940 px, et les trois liens secteur toujours dans le footer.

**Le gain de LCP ne se transpose pas tel quel en production.** La page secteur
gagne nettement, 4,4 s à 2,9 s et un score de 83 à 95. L'accueil et `/tarifs`,
non : trois passes sur l'accueil donnent 3,2 s, 4,2 s puis 3,2 s, une dispersion
du même ordre que l'écart mesuré. Une passe unique n'y prouve donc rien. Ce qui
est structurel et non sujet à mesure, c'est le passage de 5 polices préchargées
à 1. Les Core Web Vitals de la Search Console, calculés sur le trafic réel sur
28 jours, trancheront mieux que Lighthouse.

## Prochaine étape

Deux sujets restent ouverts, aucun n'est un défaut :

- **CSS bloquant**, 22 Kio inutilisés sur 25 transférés. C'est `globals.css`
  (1748 lignes), le CSS de l'application privée servi sur les pages publiques
  par le layout racine. La purge Tailwind est correcte : le corriger demande de
  découper l'architecture CSS entre public et privé, ce qui est une refonte et
  mérite son propre ticket.
- **Position moyenne des guides** en Search Console, à lire avant tout nouveau
  travail de contenu. Le levier mesuré reste le taux de clic en position 21,4,
  pas le volume de pages.
