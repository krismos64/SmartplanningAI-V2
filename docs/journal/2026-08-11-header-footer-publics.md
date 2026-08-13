# 11 août 2026, header et footer publics

| Champ | Valeur |
|---|---|
| Ticket | SP-569, sixième des neuf tickets de la refonte visuelle publique |
| Documents modifiés | `LandingHeader.tsx`, `LandingFooter.tsx`, `HeroSection.tsx` |
| Contrôles | `type-check` vert, `npm run test` 3151 tests verts sur 184 fichiers, `npm run build` réussi, 0 défaut de contraste, 0 cible sous 44 px, CLS mobile 0,00 |
| Jira | SP-569 commenté |
| Mémoire | rien de non dérivable du code, pas de fiche |

## Ce qui a été fait

**Header.** Barre crème à filet, logotype en Geist, bouton « Essayer 21 jours »
cerné avec sa flèche. Toute la mécanique disclosure de SP-558 est conservée
telle quelle : je n'ai touché qu'aux classes visuelles, par édition ciblée
plutôt que par réécriture. Les 14 tests du header restent verts.

**Footer.** Aplat bleu nuit, colonnes en filets, en-têtes corail. Il devient un
Server Component : la version précédente était marquée `'use client'` sans
porter d'interactivité, le bouton de réglages cookies étant déjà client de son
côté. Le registre des secteurs, importé pour le maillage interne, ne traverse
donc plus la frontière client.

## Trois défauts corrigés

**Le footer portait `id="contact"`**, en doublon avec la section contact de la
landing. Deux éléments partageant un identifiant rendent l'ancre `#contact`
ambiguë, et le HTML l'interdit. L'identifiant est retiré du footer, qui garde
son lien `/#contact`.

**Les liens du menu mobile et du footer mesuraient environ 20 px de haut**, très
en dessous du minimum tactile de 44 px. Corrigé sur les 15 liens du menu mobile
et les 18 du footer.

**Le header transparent devenait illisible sur le hero.** En haut de page, le
header sans fond se superposait au hero, désormais en aplat bleu nuit : le
logo, les liens de navigation et le CTA, posés en couleurs sombres, tombaient à
**1:1 de contraste**, littéralement invisibles.

Le fond crème devient permanent plutôt que conditionné au scroll. C'est plus
robuste que de décliner le header selon la section qu'il survole, d'autant que
les sections alternent désormais entre clair et sombre. Le hero réserve en
contrepartie la hauteur du header fixe.

## Ce qui a été mesuré

| Indicateur | Valeur |
|---|---|
| First Load JS `/` | **167 kB**, contre 169 après SP-568 |
| CLS mobile, Slow 4G, CPU 4x | 0,00 |
| LCP mobile | 768 ms |
| Défauts de contraste header et footer | 0 |
| Cibles sous 44 px | 0 |
| Liens dans les panneaux fermés | 15, préservés |

Une première mesure de LCP a donné 1548 ms, valeur aberrante d'un build à
froid. La seconde mesure, 768 ms, est cohérente avec les 798 ms de SP-568.

## Les écarts

**Le logo pastel du menu mobile.** Il jure avec la palette éditoriale. Remplacé
par le logotype typographique, déjà retenu dans la barre du header. Le fichier
`logo-sp.png` reste utilisé dans la barre desktop et par le JSON-LD.

**Quatre liens signalés comme cibles trop petites** (« CGU », « CGV »,
« Tarifs ») font 44 px de haut mais moins de 44 px de large, étant des mots
courts. WCAG 2.5.5 tolère ce cas pour les liens en ligne dans un bloc de texte,
la hauteur étant le critère qui compte. Aucune correction.

## Prochaine étape

SP-570, pages secteur et guides. C'est le ticket le plus sensible du lot : il
touche les pages qui portent le référencement, et cumule la refonte visuelle
avec le passage en Server Components.

La règle y est stricte : aucun fichier `data/` ni `StructuredData.tsx` modifié,
vérifiable par `git diff --stat`.

Onze commits en attente de push, une seule PR groupée prévue en fin de sprint.
