# 11 août 2026, pages secteur et guides en Server Components

| Champ | Valeur |
|---|---|
| Ticket | SP-570, septième des neuf tickets de la refonte visuelle publique, le plus sensible |
| Documents produits | `src/components/public/FaqAccordion.tsx`, `src/components/public/PublicPageShell.tsx` |
| Documents modifiés | `SectorContent.tsx`, `SectorsHubContent.tsx`, `GuideContent.tsx`, `GuidesHubContent.tsx`, `LandingHeader.tsx`, plus 5 fichiers touchés uniquement par le retrait de `isScrolled` |
| Contrôles | `type-check` vert, `npm run test` 3151 tests verts sur 184 fichiers, `npm run build` réussi, JSON-LD identique octet par octet, 53 fragments de contenu vérifiés présents |
| Jira | SP-570 commenté |
| Mémoire | rien de non dérivable du code, pas de fiche |

## La règle, tenue

Aucun fichier `data/` ni `StructuredData.tsx` modifié, vérifié par `git status`.
C'est ce qui garantit que le texte, les mots-clés, les metadata et le JSON-LD
sont préservés par construction.

## Ce qui a débloqué le passage en Server Components

Ces pages étaient `'use client'` pour deux raisons seulement : suivre le scroll
afin de colorer le header, et porter l'état de l'accordéon de FAQ.

Le premier motif avait disparu sans qu'on le remarque. Depuis SP-569, le fond du
header est opaque en permanence : `isScrolled` ne pilotait plus qu'un écart de
4 px de padding, au prix de rendre **chaque page publique cliente**. La prop est
retirée du header et de ses neuf appelants.

Le second est isolé dans `FaqAccordion`, seul îlot client de ces pages.

`PublicPageShell` apparaît au passage : le scope de thème, le lien d'évitement,
le header, le fil d'Ariane et le pied de page étaient répétés à l'identique sur
quatre pages.

## Ce qui a été mesuré

| Route | Avant | Après |
|---|---|---|
| `/solutions/[slug]` | 200 kB | **186 kB** |
| `/guides/[slug]` | 198 kB | **186 kB** |
| `/solutions` | 198 kB | 188 kB |
| `/guides` | 198 kB | 188 kB |

**Preuves de non-régression**, capturées avant modification puis comparées :

- JSON-LD **identique octet par octet** sur `/solutions`,
  `/solutions/planning-restaurant`, `/guides` et
  `/guides/faire-un-planning-equipe`
- **53 fragments de contenu** extraits des registres (questions, réponses,
  descriptions, bénéfices, titres), tous présents dans le HTML rendu, aucun
  absent
- Les 6 FAQ du secteur et les 5 du guide rendues côté serveur, réponses dans le
  DOM avec `aria-hidden`
- 43 garde-fous de contenu verts : 800+ mots par secteur, 1200+ par guide,
  réponse directe contenant « 2,90 », aucun concurrent nommé

Accessibilité : 0 défaut de contraste sur les deux pages auditées, un seul `h1`,
hiérarchie H1 vers H3 correcte, 9 ancres de sommaire toutes valides, aucun
débordement horizontal à 390 px.

## Les écarts

**Cinq fichiers hors périmètre ont été touchés.** `AboutContent`,
`PricingPageContent`, `AuthLayoutClient`, `LegalPageLayout` et
`LandingPageContent` relèvent d'autres tickets, mais passaient tous `isScrolled`
au header. Retirer la prop imposait de les mettre à jour, sinon le build cassait.
La modification s'y limite au retrait de la prop et de l'état devenu inutile :
aucun changement d'habillage.

À noter pour SP-571 : `AboutContent` et `PricingPageContent` n'ont plus d'état du
tout, ils pourront devenir des Server Components sans travail supplémentaire.

**La mesure du volume de texte est trompeuse.** Le comptage brut de mots dans le
HTML est passé de 2949 à 4231 sur la page secteur, ce qui ne signifie pas que du
contenu a été ajouté : la page embarque simplement moins de payload JavaScript
que ma commande comptait comme des mots. La vérification qui fait foi est celle
des 53 fragments, comparés un à un au registre.

## Prochaine étape

SP-571, tarifs, à-propos et pages légales. Deux de ces fichiers sont déjà prêts à
passer en Server Components.

Reste ensuite SP-572, la vérification finale, avec le sitemap, `llms.txt`, la
whitelist E2E et Lighthouse, avant la PR groupée.

Quatorze commits en attente de push.
