# 12 août 2026, reprise de la refonte publique : token mort, section mobile, page contact

| Champ | Valeur |
|---|---|
| Ticket | SP-574, reprise des écarts constatés sur la refonte SP-565 à SP-573 |
| Documents produits | `src/app/(about)/contact/{page,ContactPageContent,StructuredData}.tsx`, `src/app/(landing)/components/sections/MobileSection.tsx`, `src/components/public/mockups/MobileMockup.tsx`, `src/components/public/__tests__/public-tokens.test.ts` |
| Documents modifiés | 19 commits au total : `LandingHeader.tsx`, `SectorContent.tsx`, `ContactSection.tsx`, `ContactForm.tsx`, `LandingPageContent.tsx`, les 7 pages `(auth)` et leurs 6 formulaires, `PricingSimulator.tsx`, `PricingCard.tsx`, `LegalPageLayout.tsx`, `LegalSection.tsx`, `emails/components/Footer.tsx`, `sitemap.ts`, `llms.txt`, `llms-full.content.ts`, `a11y.spec.ts`, `sitemap.test.ts`, `README.md`, `seo-content.md`, `hook-rappel-regles.sh` |
| Contrôles | type-check vert, 3160 tests unitaires (187 fichiers), 22 specs publiques, 7 specs axe-core, build de production |
| Jira | SP-574 créé, assigné, priorité High, « En cours ». Quatre commentaires, un par passe, avec les SHA et les contrôles |
| Mémoire | `token-tailwind-inexistant-echoue-en-silence` et `refonte-publique-angles-morts` créées, `ou-en-est-le-projet` et `MEMORY.md` mises à jour |

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
| `/login` et `/register` | 196 kB |
| `/tarifs` | 200 kB |
| `/a-propos` | 191 kB |

La landing tient à 167 kB malgré la section ajoutée : la maquette en DOM ne
coûte aucune requête, et le formulaire parti compense le poids de la section.

`/contact` est la page publique la plus lourde, react-hook-form et Zod étant
tirés par `ContactForm`. Attendu pour une page qui porte un formulaire validé,
et c'est précisément le coût que la landing n'a plus à payer.

Accessibilité : **7 specs axe-core** au vert, WCAG 2.1 AA, sur `/` en mode
clair, `/` en mode sombre, `/contact`, `/login`, `/register`, `/tarifs` et
`/cgu`. Cinq sont nouvelles.

## Seconde passe : proportions, login, register et CTA oubliés

Christophe a relevé deux points de plus en regardant le résultat.

### La maquette téléphone trop courte

Mesurée dans le navigateur sur les deux versions : le cadre faisait 352 x 449,
ratio **1,27**, quand le prototype tient 313 x 604, ratio **1,93**. Trop large
et trop court, il se lisait comme une tablette.

Deux corrections. Le cadre est borné à 19,5rem au lieu de 22, et le contenu
reprend les espacements relevés sur le DOM du prototype : 35 px de padding haut
d'écran, 25 px avant la liste des jours, 18 px sur le bloc du prochain créneau.
Résultat 312 x 564, ratio **1,81**.

Le conteneur extérieur passe à 26rem, plus large que le cadre : les étiquettes
flottantes se posaient sinon par-dessus le contenu et masquaient les pastilles
d'avatar.

### login et register jamais refondues

SP-573 les avait exclues explicitement du périmètre, « pages publiques mais
menant à l'application ». Décision revue avec Christophe : ce sont les deux
pages que le visiteur non connecté atteint depuis le site public, et la
dernière étape avant conversion. Le header et le footer refondus encadraient
une carte blanche arrondie à ombres portées.

Le layout `(auth)` porte désormais `.public-scope`. Il sert les 6 pages auth,
donc les 4 autres héritent du même habillage : cohérent, et non un
débordement de périmètre.

### Deux CTA de pages refondues avaient échappé à la refonte

Trouvé en suivant `PRIMARY_BUTTON_CLASSES`, utilisée par les formulaires auth
**et** par les hubs `/solutions` et `/guides`. La constante était restée le
bouton bleu arrondi à ombre d'avant la refonte. En la reprenant, les trois
endroits sont corrigés d'un coup.

Les hubs portaient en plus un bloc CTA en dégradé bleu translucide avec
`rounded-3xl`, des pastilles `bg-card/50` et un badge `bg-blue-500/10`,
contraires à la règle « aucune opacité sur les aplats ». Zéro classe
hors-refonte restante dans les deux hubs.

Deux specs axe-core ajoutées sur login et register, qui n'en avaient aucune.

## Troisième passe : emails, images et fidélité au prototype

### Un lien 404 dans les emails de fin d'essai

Le pied de page des emails portait « Gérer mes préférences email » vers
`/preferences-email`, une route qui n'a **jamais existé**. Aucun appelant ne
passant `unsubscribeUrl`, le repli était le seul chemin emprunté.

Les deux emails concernés sont `TrialEndingSoon` et `TrialExpired`, envoyés aux
prospects à J-1 et à expiration : la population que le projet cherche à
convertir. Corrigé vers `/app/settings/notifications`.

Le lien « Contact » du pied de page est rétabli au passage, il avait été retiré
parce que la route n'existait pas, ce que le commentaire du fichier
documentait.

Un test confronte désormais les URL du pied de page aux routes réelles de
`src/app`, groupes de routes compris. Vérifié par mutation. **Premier test sur
`emails/`**, ce dossier n'en avait aucun.

### Deux illustrations supprimées par la refonte

`avant-apres-sp.webp` sur la landing : SP-567 a retiré la référence en
réécrivant la section, jugeant l'image « marqueur de contenu généré », puis
SP-572 a supprimé le fichier devenu orphelin. Le nettoyage était logiquement
correct, il a entériné une perte de contenu. Restaurée depuis git.

Le commentaire de SP-567 annonçait 2,6 Mo : le WebP pèse **261 Ko**, la source
PNG ayant été convertie entre-temps.

`manager.webp` sur `/a-propos` : le fichier n'avait jamais été supprimé, seule
sa référence l'avait été en SP-571. Replacée aux côtés du texte de mission,
avec la légende du prototype.

Réserve signalée à Christophe : `avant-apres-sp` est visiblement générée,
personnages cartoon et couleurs saturées, exactement ce que SP-567 lui
reprochait. Elle détonne avec la sobriété de la refonte et mériterait d'être
refaite.

### login et register à l'identique du prototype

La passe précédente avait porté l'identité, pas la mise en page. Le prototype
**scinde l'écran en deux moitiés égales** : panneau bleu nuit éditorial à
gauche, panneau crème avec la carte du formulaire à droite.

Valeurs relevées sur le DOM du prototype : grille 50/50, ombre corail décalée
de 15 px et 17 px **sans flou**, angles à 2 px, bouton lime à texte bleu nuit.

Le contenu du panneau diffère entre les deux pages. Choisi sur le `pathname` :
un layout Next ne peut pas recevoir de props de ses pages, et un contexte pour
deux titres serait disproportionné.

`AUTH_BUTTON_CLASSES` sépare enfin le CTA des formulaires auth de
`PRIMARY_BUTTON_CLASSES`. Les deux avaient vécu confondus, c'est ce qui avait
laissé un bouton bleu arrondi sur les hubs longtemps après la refonte.

## Quatrième passe : balayage systématique des écrans restants

Six défauts réels, deux faux positifs écartés.

**Pages légales** : badge bleu translucide arrondi (le même que sur les hubs),
pastille verte hors palette, bouton de retour en haut à fond translucide et
survol bleu, deux blocs `bg-card` dans `LegalSection`.

**États du formulaire de contact** : `ContactSuccessState` et
`ContactErrorState` avaient été écrits pour un fond sombre, `text-white` et
`bg-white/5`. Depuis la refonte ils s'affichent sur la carte crème, où le blanc
est illisible. Le défaut n'apparaît qu'après un envoi réussi ou une panne
réseau, deux états qu'aucun parcours de vérification ne traverse : ni axe-core,
ni les specs E2E, ni un coup d'œil à la page. Un test les couvre désormais.

**Tarifs** : le prix du simulateur était un dégradé cyan-bleu en
`bg-clip-text`, l'élément le plus visible de la page. Curseur au même dégradé,
`PricingCard` avec deux dégradés et une bordure cyan.

**Les cinq autres pages auth et leurs quatre formulaires** : titres centrés,
`text-foreground`, liens cyan, pastilles rondes en opacité. Normalisés sur le
motif de login et register. Zéro `dark:` restant sur les sept pages auth.

**Deux violations de contraste que seul l'audit a vues**, après mes propres
corrections : `text-public-content-muted/70` tombe à **2,81:1** sur les pages
légales, et le corail sur crème en 14 px donne **3,58 à 3,89:1**. L'opacité sur
`content-muted` est interdite par la règle du projet, je l'avais laissée
passer.

**`AnimatedBackground` supprimé** : mon layout auth réécrit était son dernier
appelant.

Faux positifs écartés : `PlanningMockup` porte volontairement les couleurs de
l'application réelle qu'il représente, son commentaire le documente, et le
`dark:` de `BentoCard` est un nom de clé de variante, pas une classe.

Audit axe-core étendu à `/tarifs` et `/cgu`, qui n'en avaient aucun.

**Scan final** : le périmètre public ne porte plus aucune classe hors-refonte,
`PlanningMockup` excepté.

## Cinquième passe : la page tarifs à la mise en page du prototype

Christophe a trouvé la page tarifs du prototype plus réussie. En comparant les
deux, il avait raison, et pour une raison précise : la passe de balayage avait
mis cette page **en conformité**, sans toucher à sa structure. Celle-ci datait
d'avant la refonte, SP-571 ayant traité les tarifs sans la reprendre.

**Le prix vit désormais sur un aplat bleu franc.** Curseur à gauche sur 3fr,
résultat à droite sur 2fr, rapport relevé sur le prototype (730 px contre 393).
La carte porte son ombre bleu nuit décalée de 14 px sans flou et le CTA lime.
Avant, le prix était un chiffre bleu nuit sur crème dans un bloc étroit centré
à `max-w-2xl`.

**Le curseur passe à `accent-color`**, comme le prototype : une déclaration au
lieu de huit pseudo-éléments par moteur, et le rail rempli devient visible. Le
précédent avait un rail beige sur fond crème, quasi invisible.

**La duplication disparaît.** `PricingCard` répétait le prix du simulateur juste
au-dessus et redonnait la même liste de fonctionnalités que la colonne de
gauche, dans le même écran. La liste devient une grille numérotée sur deux
colonnes.

### Un défaut de mesure dans l'audit lui-même

Le texte de la carte bleue est en blanc pur : le crème n'y donne que **4,13:1**,
le blanc tient **4,88:1**.

Plus intéressant, axe-core mesurait le contraste **pendant le fondu
d'apparition** et lisait le bleu `#2563ff` comme `#5e8bfc`, ce qui faisait
échouer un blanc pourtant conforme. Les specs émulent désormais
`prefers-reduced-motion`, ce qui fait mesurer l'état final.

Ce n'est pas un contournement, vérifié par mutation : avec ce réglage, axe lit
le bleu réel et rougit bien sur le crème à 4,13:1. L'audit est devenu plus
exact, et couvre en plus le parcours des personnes qui réduisent les
animations.

`/tarifs` passe de 202 à 200 kB.

## Ce qui reste ouvert

1. **La whitelist E2E de la CI ne couvre pas les specs `landing/`**, page
   contact comprise. Arbitrage jamais pris, revenu à chaque session depuis le
   7 août. Inchangé ici volontairement, c'est une décision distincte
2. **Numérotation des sections de la landing incohérente** avec l'ordre de
   rendu : Hero 1, RoleDemos 3, Features 2, et `VideoSection` porte l'index 5
   sans être montée. La section mobile prend 3 comme dans le prototype, ce qui
   ajoute un doublon. Cosmétique, à reprendre d'un bloc
3. **Les 20 commits de la refonte plus les 7 de cette session ne sont pas
   poussés**, la CI n'a jamais tourné dessus
4. **SP-574 passera à Terminé au merge**, avec SP-565 à SP-573. Il est en
   « En cours », le travail ayant été fait avant la création du ticket
