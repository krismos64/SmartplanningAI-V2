# 12 août 2026, reprise de la refonte publique : token mort, section mobile, page contact

| Champ | Valeur |
|---|---|
| Ticket | SP-574, reprise des écarts constatés sur la refonte SP-565 à SP-573 |
| Documents produits | `src/app/(about)/contact/{page,ContactPageContent,StructuredData}.tsx`, `src/app/(landing)/components/sections/MobileSection.tsx`, `src/components/public/mockups/MobileMockup.tsx`, `src/components/public/__tests__/public-tokens.test.ts` |
| Documents modifiés | `LandingHeader.tsx`, `SectorContent.tsx`, `ContactSection.tsx`, `ContactForm.tsx`, `LandingPageContent.tsx`, `sitemap.ts`, `llms.txt`, `llms-full.content.ts`, `a11y.spec.ts`, `sitemap.test.ts`, plus 6 fichiers pour les liens |
| Contrôles | type-check vert, 3153 tests unitaires (185 fichiers), 18 specs publiques, 3 specs axe-core, build de production |
| Jira | aucun, SP-574 à créer |
| Mémoire | à écrire en fin de session |

## Ce qui a été fait

Trois écarts relevés par Christophe en relisant la refonte avant de pousser.

### Le CTA « Essayer 21 jours » illisible au survol

`hover:text-public-content-inverted` était écrit dans le code. Ce token
n'existe pas dans le groupe `public` de `tailwind.config.ts` : la classe ne
produisait aucune règle CSS. Au survol le fond passait bien en
`public-content` (ink 900) pendant que le texte restait sombre.

Trois occurrences, pas une : header desktop, header mobile, et le CTA de
chaque page secteur. Remplacé par `public-content-on-dark`, le token prévu
pour un texte sur aplat sombre, déjà utilisé par le footer et
`RoleDemosSection`.

Rien dans la chaîne de vérification ne pouvait l'attraper. Tailwind ne type
pas ses classes, et ni axe-core ni Lighthouse ne déclenchent les états de
survol. Un garde-fou (`public-tokens.test.ts`) confronte désormais les tokens
`public-*` écrits dans les sources à ceux déclarés dans la config. Vérifié par
mutation : en réintroduisant le défaut, le test rougit en nommant le fichier
et le token, puis restauré.

### La section « SmartPlanning vous suit »

Présente dans le prototype (section 03), jamais portée. Elle tient un argument
que la landing ne faisait nulle part : il n'y a rien à installer, l'employé
ouvre le navigateur de son téléphone.

L'illustration est une maquette de téléphone construite en DOM, comme
`PlanningMockup` : aucune requête image, rendu net à toute taille. Entièrement
`aria-hidden`, le texte de la section porte seul l'information.

Trois tokens corrigés en regardant le rendu réel plutôt qu'en supposant leurs
valeurs. `accent-surface` est un aplat corail vif et non un fond pâle, la
pastille d'avatar y demandait `content-on-vivid`. L'aplat d'épaisseur du
téléphone est passé en `brand-surface`, le prototype le montre bleu alors
qu'`accent` est corail. Sur l'aplat lime du jour de congé, `content-muted`
(ink 700) perdait trop de contraste.

### La page /contact

Le formulaire vivait en bas de la landing, à l'ancre `#contact`. Toutes les
autres familles de contenu ont leur page : le contact était la seule entrée du
footer à pointer vers un fragment, donc sans URL indexable ni titre propre.

Option retenue par Christophe parmi trois : page dédiée, et la section landing
devient un bloc d'appel qui y renvoie. Le formulaire n'existe qu'à un seul
endroit, pas de contenu dupliqué au crawl. Les 11 liens `#contact` du header,
du footer, de la FAQ, du CTA, des tarifs et de la 404 pointent sur `/contact`.
L'`id="contact"` reste sur la landing pour les anciens liens entrants.

Deux défauts trouvés en regardant la page rendue, pas le code.

Le formulaire ne s'affichait pas. `whileInView` avec `viewport: { once: true }`
ne s'armait jamais : sur la landing il était en bas de page et le scroll le
déclenchait toujours, sur une page courte où il est haut, l'observateur ne
partait pas. Il était présent dans le DOM à `opacity: 0`, avec ses quatre
champs. Passé en `animate`, qui joue au montage.

Le formulaire n'avait jamais été repris par la refonte : un seul token
`public-` dans tout le fichier. Bouton en dégradé bleu-cyan, champs arrondis
sur fond bleuté, icônes bleu clair, messages d'erreur en `red-400`. Repris aux
tokens publics, angles vifs et aplat franc comme les autres CTA.

## Les écarts

**Ma section mobile portait deux violations d'accessibilité**, aucune visible
à l'œil ni au type-check, toutes deux trouvées par axe-core.

Les `<dt>` et `<dd>` étaient enveloppés dans un `<div>`, que `<dl>` n'admet pas
(règles `dlitem` et `only-dlitems`). Le commentaire de `ContactSection`
portait déjà exactement cet avertissement, je ne l'avais pas appliqué.

La pastille d'avatar « LM » en crème sur bleu franc mesure **4,13:1**, sous le
seuil AA de 4,5. J'avais écrit 4,88:1 en commentaire, valeur qui vaut pour le
blanc pur et non pour le crème. Passée en bleu nuit sur crème avec un filet.

Ce second point confirme la règle du projet : un contraste se mesure avec
axe-core, jamais par un calcul écrit pour l'occasion. J'ai reproduit
l'erreur que la fiche mémoire décrit, en commentant une valeur au lieu de la
mesurer.

**Un titre en double** au premier rendu : le layout racine applique le
template `%s | SmartPlanning`, et j'avais écrit le suffixe dans le titre de
page. Corrigé en `Contact et support`.

**Le test de sitemap a rougi** sur l'URL manquante, ce qui est son rôle. La
liste attendue est explicite, elle force à déclarer toute nouvelle page.

## Mesures

| Page | First Load JS |
|---|---|
| `/` | 167 kB, inchangé |
| `/contact` | 226 kB |
| `/tarifs` | 202 kB |
| `/a-propos` | 191 kB |

La landing tient à 167 kB malgré la section ajoutée : la maquette en DOM ne
coûte aucune requête, et le formulaire parti compense le poids de la section.

`/contact` est la page publique la plus lourde, react-hook-form et Zod étant
tirés par `ContactForm`. Attendu pour une page qui porte un formulaire validé,
et c'est précisément le coût que la landing n'a plus à payer.

Accessibilité : 3 specs axe-core au vert, WCAG 2.1 AA, sur `/` en mode clair,
`/` en mode sombre et `/contact`. La spec `/contact` est nouvelle.

## Ce qui reste ouvert

1. **La whitelist E2E de la CI ne couvre pas les specs `landing/`**, page
   contact comprise. Arbitrage jamais pris, revenu à chaque session depuis le
   7 août. Inchangé ici volontairement, c'est une décision distincte
2. **Numérotation des sections de la landing incohérente** avec l'ordre de
   rendu : Hero 1, RoleDemos 3, Features 2, et `VideoSection` porte l'index 5
   sans être montée. La section mobile prend 3 comme dans le prototype, ce qui
   ajoute un doublon. Cosmétique, à reprendre d'un bloc
3. **Les 20 commits de la refonte plus les 5 de cette session ne sont pas
   poussés**, la CI n'a jamais tourné dessus
4. **SP-574 à créer dans Jira**, le travail a été fait sans ticket préalable
