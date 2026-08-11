# 11 août 2026, sections basses de la landing

| Champ | Valeur |
|---|---|
| Ticket | SP-568, cinquième des neuf tickets de la refonte visuelle publique |
| Documents modifiés | `HowItWorksSection.tsx`, `PricingSection.tsx`, `FAQSection.tsx`, `FAQItem.tsx`, `CTASection.tsx`, `RoleDemosSection.tsx`, `ContactSection.tsx`, `DisplayTitle.tsx`, `SectionLabel.tsx`, `FeaturesSection.tsx`, `ContactForm.tsx`, `PricingCard.tsx`, `PricingSimulator.tsx`, `SectionHeader.tsx`, `(landing)/components/index.ts` |
| Contrôles | `type-check` vert, `npm run test` 3151 tests verts sur 184 fichiers, `npm run build` réussi, CLS mobile 0,00, 0 défaut de contraste, 0 cible sous 44 px |
| Jira | SP-568 commenté |
| Mémoire | rien de non dérivable du code, pas de fiche |

## Ce qui a été fait

Refonte des sections sous la ligne de flottaison : rôles, mise en route, tarifs,
FAQ, contact et appel à l'action.

Les aplats alternent : bleu nuit pour les démos par rôle, bleu franc pour les
tarifs, corail pour le CTA, fond clair pour le reste. Les cartes arrondies à
dégradés cèdent la place à des filets.

`HowItWorks` et `CTA` deviennent des Server Components, leurs animations passant
en CSS. `FAQ`, `Pricing`, `RoleDemos` et `Contact` restent clients : ils portent
un état réel, accordéon, simulateur, onglets et formulaire.

## Accessibilité : 28 défauts ramenés à 0

Le ticket héritait de 8 défauts de contraste et 5 cibles trop petites relevés en
SP-567. L'audit après refonte en a d'abord montré 28, la cause étant que
`PricingSimulator` et `PricingCard`, conçus pour un fond clair, se retrouvaient
posés sur l'aplat bleu.

| Élément | Avant | Après |
|---|---|---|
| Compteur du simulateur | 1,81:1 | conforme |
| Liens de la section tarifs | 3,64:1 | conforme |
| Bouton de `PricingCard` | 3,64:1 et 36 px | 17,28:1 et 44 px |
| « Réponse rapide » de Contact | 2,16:1 | conforme |
| Lien de confidentialité | 3,09:1 | conforme |
| Libellés des onglets de rôle | 1,30:1 | conforme |

Deux corrections structurelles au passage :

**`FAQItem` était une `<div>` avec `onClick`.** Ni focusable, ni actionnable au
clavier : l'accordéon était inutilisable sans souris. C'est désormais un
`<button>` avec `aria-expanded` et `aria-controls`. La réponse reste dans le
DOM, sa hauteur animée en CSS par `grid-template-rows` plutôt que par Framer
Motion.

**`RoleDemos` n'avait pas la navigation par flèches** qu'exige le motif ARIA
tablist. Ajoutée avec `Home`, `End` et un roving tabindex.

## Les écarts

**Le panneau clair dans la section tarifs.** `PricingSimulator` et `PricingCard`
servent aussi `/tarifs`, qui relève de SP-571. Les refondre ici aurait débordé
sur ce ticket. Un panneau clair portant `public-scope` a donc été posé à
l'intérieur de la section bleue : les composants gardent leur style d'origine et
restent lisibles.

**Deux tons manquaient aux primitives.** `DisplayTitle` n'avait que `onLight` et
`onDark` : sur l'aplat corail du CTA, l'accent corail était invisible. Ajout de
`onVivid`. `SectionLabel` n'avait pas de ton pour l'aplat bleu franc, où le lime
ne donne que 3,92:1 contre 4,88:1 pour le blanc. Ajout de `onBrand`.

**`VideoSection` n'est pas sur la landing.** Le ticket la listait, mais elle
n'est utilisée que par `/a-propos`. Laissée pour SP-571 plutôt que refondue à
moitié.

**Un trou dans la grille bento.** Huit cartes sur trois colonnes laissent une
cellule vide, rendue visible par le fond de grille teinté. La dernière carte
s'étend désormais sur deux colonnes quand le rang est incomplet.

`SECTION_VARIANT` n'avait plus aucun consommateur externe après la refonte : son
export a été retiré, la constante reste interne à `SectionHeader`.

## Ce qui a été mesuré

| Indicateur | Valeur |
|---|---|
| First Load JS `/` | 169 kB, inchangé |
| CLS mobile, Slow 4G, CPU 4x | 0,00 |
| LCP mobile | 798 ms |
| Défauts de contraste sur la page | 0 |
| Cibles sous 44 px | 0 |
| Débordement horizontal à 390 px | aucun |

Les 5 réponses de FAQ sont présentes dans le DOM à l'état fermé, avec
`aria-hidden`. L'ancre `#contact` est préservée.

## Prochaine étape

SP-569, header et footer publics. Le `ThemeToggle` n'a plus à y être conservé
depuis SP-573.

Reste ensuite SP-570, le ticket le plus sensible, qui touche les pages portant
le référencement.

Neuf commits en attente de push, une seule PR groupée prévue en fin de sprint.
