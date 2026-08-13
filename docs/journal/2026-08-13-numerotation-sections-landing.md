# 13 août 2026, numérotation des sections publiques

| Champ | Valeur |
|---|---|
| Ticket | SP-574, point 2 laissé ouvert par la session du 12 août |
| Documents produits | `src/components/public/__tests__/section-numbering.test.ts` |
| Documents modifiés | `RoleDemosSection.tsx`, `FeaturesSection.tsx`, `MobileSection.tsx`, `HowItWorksSection.tsx`, `BenefitsSection.tsx`, `VideoSection.tsx`, `a-propos/AboutContent.tsx` |
| Contrôles | type-check vert, 3163 tests unitaires (188 fichiers), 22 specs publiques dont 7 axe-core, rangs relevés au navigateur |
| Jira | SP-574, commentaire de clôture du point 2 |
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

## Prochaine étape

Les trois autres points du 12 août restent ouverts, inchangés :

1. **La whitelist E2E de la CI ne couvre pas les specs `landing/`**. Arbitrage
   jamais pris, revenu à chaque session depuis le 7 août
2. **28 commits non poussés**, la CI n'a jamais tourné sur la refonte
3. **SP-574 passera à Terminé au merge**, avec SP-565 à SP-573
