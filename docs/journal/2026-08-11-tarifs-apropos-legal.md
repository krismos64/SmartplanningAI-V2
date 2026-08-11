# 11 août 2026, tarifs, à-propos et pages légales

| Champ | Valeur |
|---|---|
| Ticket | SP-571, huitième des neuf tickets de la refonte visuelle publique |
| Documents modifiés | `AboutContent.tsx`, `PricingPageContent.tsx`, `ValueCard.tsx`, `TargetCard.tsx`, `LegalPageLayout.tsx`, `LegalSection.tsx`, `VideoSection.tsx`, `styles.ts`, `(landing)/components/index.ts` |
| Documents supprimés | `ScrollIndicator.tsx`, `SectionHeader.tsx` |
| Contrôles | `type-check` vert, `npm run test` 3151 tests verts sur 184 fichiers, `npm run build` réussi, 0 défaut de contraste sur les trois familles de pages |
| Jira | SP-571 commenté |
| Mémoire | rien de non dérivable du code, pas de fiche |

## Ce qui a été fait

Dernier lot de refonte. Les pages restantes passent à l'identité éditoriale.

`AboutContent` devient un Server Component, comme `ValueCard`, `TargetCard` et
`LegalSection` : ces composants ne portaient plus d'état depuis le retrait de
`isScrolled` en SP-570, seules subsistaient des variantes d'apparition qui
tiraient Framer Motion dans le bundle.

`PricingPageContent` et `LegalPageLayout` restent clients : le simulateur de
tarif et le sommaire actif portent un état réel. La FAQ des tarifs passe par
`FaqAccordion`.

L'illustration `manager.webp` est retirée de la page à-propos, image générée du
même registre que celles déjà écartées en SP-567.

## Les identifiants E2E, préservés

`e2e/pages/pricing.page.ts` dépend de sept identifiants sur la page tarifs. Tous
vérifiés présents sur la page rendue après refonte : `#pricing-hero-title`,
`#simulator-title`, `#features-title`, `#faq-title`, et les `data-testid`
`pricing-hero-description`, `large-team-message`, `cta-register`.

À signaler : ce Page Object cherche par ailleurs
`[aria-label="Fonctionnalites incluses"]`, **sans accent**, alors que la page
rend « Fonctionnalités » avec accent. Ce sélecteur était déjà cassé avant la
refonte. Je ne l'ai pas corrigé ici, cela relève de SP-572 qui touche la suite
E2E.

## Les écarts

**`VideoSection` a été refondue dans ce ticket.** Elle vit dans
`(landing)/components/sections/` mais ne sert que `/a-propos`, comme SP-568
l'avait constaté. Elle relevait donc de ce lot.

**Le callout des pages légales tombait sous le seuil AA.** Ses trois variantes
posaient un texte coloré sur un fond teinté de la même teinte : 1,52:1 pour
« important », 2,21:1 pour « warning ». Remplacé par un filet coloré à gauche,
le texte se posant sur la surface courante.

**Le titre de la page à-propos débordait.** La ligne serif italique et le
sous-titre se chevauchaient. Chaque registre occupe désormais sa propre ligne.

## Code mort retiré

`ScrollIndicator` et `SectionHeader` n'avaient plus aucun consommateur après la
refonte des sections, seul le barrel les exportait encore. `BADGE_BASE_CLASSES`
non plus. Vérifié par `grep` avant suppression.

## Ce qui a été mesuré

| Route | First Load JS |
|---|---|
| `/a-propos` | 191 kB |
| `/tarifs` | 202 kB |
| `/solutions`, `/guides`, et leurs pages | **186 kB**, 160 B de code de route |

JSON-LD intact : `Offer`, `UnitPriceSpecification` et `QuantitativeValue` sur
les tarifs, `AboutPage` et `Organization` sur à-propos.

Aucun fichier `data/` ni `StructuredData.tsx` modifié. Le texte juridique des
cinq pages légales est inchangé, vérifié par `git diff` : seuls les composants
de mise en page ont bougé.

## Prochaine étape

SP-572, la vérification finale : `PAGE_LAST_MODIFIED` du sitemap, `llms.txt`,
whitelist E2E de `playwright.ci.config.ts`, Lighthouse sur trois pages, audit
WCAG complet, puis la PR groupée.

Le sélecteur E2E cassé signalé plus haut y sera corrigé.

Dix-sept commits en attente de push.
