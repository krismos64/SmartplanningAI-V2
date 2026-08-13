# 11 août 2026, hero et sections hautes de la landing

| Champ | Valeur |
|---|---|
| Ticket | SP-567, troisième des huit tickets de la refonte visuelle publique |
| Documents produits | `src/components/public/mockups/PlanningMockup.tsx` |
| Documents modifiés | `HeroSection.tsx`, `FeaturesSection.tsx`, `BenefitsSection.tsx`, `LandingPageContent.tsx`, `BentoCard.tsx`, `brand-public.ts`, `globals.css`, `tailwind.config.ts`, `brand-public.test.ts` |
| Contrôles | `type-check` vert, `npm run test` 3151 tests verts sur 184 fichiers, `npm run build` réussi, CLS mobile 0,00, audit contraste et cibles tactiles sans défaut sur les sections refondues |
| Jira | SP-567 commenté |
| Mémoire | fiche sur le barrel `@/components/public` et le coût du réexport |

## Ce qui a été fait

Première étape visible de la refonte : à la fin de ce ticket, la direction
visuelle est jugeable sur la page d'accueil.

**Hero.** Aplat bleu nuit, titre à deux registres (« Votre équipe avance. » en
Geist, « Tout reste clair. » en Instrument Serif italique corail), aperçu de
planning construit en DOM et CSS à la place de `logo-smartplanning.webp`. Le
composant redevient un Server Component : l'effet de parallaxe au scroll
(`useScroll`, `useTransform`) tirait Framer Motion dans le chemin critique.

**FeaturesSection.** Grille bento asymétrique. L'animation Lottie du haut de
section est retirée : `planning-animation.json` pesait 148 Ko importés
statiquement dans le bundle, pour une décoration sans rapport avec le contenu.

**BenefitsSection.** L'illustration « AVANT / AVEC SmartPlanning » est retirée.
Le texte porte seul la comparaison, ce qui est aussi ce que lisent les moteurs.

**AnimatedBackground** disparaît de la landing, les aplats portent le fond. Le
composant reste en place : huit autres pages publiques en dépendent jusqu'à
SP-568 et SP-571.

## Les écarts

**Deux tokens manquaient, révélés par le contrôle visuel.** Le socle de SP-565
définissait `surface-inverted` comme « l'inverse du fond courant », ce qui suit
le thème. Or le hero a besoin d'un fond bleu nuit **constant** : en mode sombre,
il virait au crème. Même défaut sur les aplats vifs, où `content` vire au crème
et rendait le bouton lime du hero illisible, mesuré à **1,06:1**.

Ajout de `surface-dark`, `content-on-dark` et `content-on-vivid`, tous
constants. Le bouton passe à 13,90:1. Le test de contraste couvre désormais ces
paires dans les deux modes, et a été validé par mutation : remettre un texte
thématique sur les aplats vifs fait rougir le cas « mode sombre » précisément.

C'est une erreur de conception de ma part sur SP-565, pas une découverte du
terrain : la distinction entre « inverse du thème » et « constant » aurait dû
être posée dès les tokens.

**Le barrel `@/components/public` coûtait 30 kB.** Le premier build après
refonte est monté à 203 kB contre 176 en baseline, alors que le ticket retirait
Lottie. Cause : les sections importaient les primitives depuis le barrel, qui
réexporte `ContactForm` et tirait react-hook-form, zod et framer-motion dans le
bundle initial. En important les primitives directement, le First Load JS
descend à 173 kB.

**Trois serveurs Next fantômes ont fausé le diagnostic.** Le contrôle visuel a
montré pendant un moment un hero crème alors que le source était correct : une
instance d'un build antérieur occupait le port 3001. Vérifier `lsof -ti:3001`
avant de conclure qu'un rendu ne correspond pas au code.

## Ce qui a été mesuré

| Indicateur | Avant | Après |
|---|---|---|
| First Load JS `/` | 176 kB | **173 kB** |
| CLS mobile | 0,09 avant SP-556 | **0,00** |
| LCP mobile, Slow 4G, CPU 4x | non mesuré | 773 ms |
| Contraste du CTA lime, mode sombre | 1,06:1 | **13,90:1** |

Audit d'accessibilité sur les trois sections refondues, dans les deux thèmes :
aucun échec de contraste, aucune cible sous 44 px, un seul `h1`, aucun
débordement horizontal à 390 px.

L'audit sur la page entière remonte huit échecs de contraste et cinq cibles
trop petites, tous localisés dans `RoleDemosSection`, `PricingSection` et
`ContactSection`. Ces sections relèvent de SP-568, ils y seront traités.

## Prochaine étape

SP-568, les sections basses de la landing, avec les défauts d'accessibilité
relevés ci-dessus à corriger au passage.

Point à traiter en SP-569 : `LandingPageContent` reste `'use client'` uniquement
pour passer `isScrolled` au header. Une fois le header refondu, la landing
pourra probablement redevenir un Server Component complet.

Cinq commits en attente de push. Une seule PR groupée est prévue en fin de
sprint, pour économiser les minutes GitHub Actions.
