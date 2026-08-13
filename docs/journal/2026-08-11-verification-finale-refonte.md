# 11 août 2026, vérification finale de la refonte publique

| Champ | Valeur |
|---|---|
| Ticket | SP-572, dernier des neuf tickets de la refonte visuelle publique |
| Documents modifiés | `sitemap.ts`, `ContactSection.tsx`, `FeaturesSection.tsx`, `BentoCard.tsx`, `PricingSection.tsx`, `PricingPageContent.tsx`, `PricingSimulator.tsx`, `SectorContent.tsx`, `GuideContent.tsx`, `LandingFooter.tsx`, `RoleDemosSection.tsx`, `VideoSection.tsx`, `HeroSection.tsx`, `e2e/specs/landing/sector-pages.spec.ts` |
| Contrôles | `type-check` vert, 3151 tests unitaires verts sur 184 fichiers, 35 tests E2E publics verts, build réussi, Lighthouse 100/100/100/100 sur trois pages |
| Jira | SP-572 commenté |
| Mémoire | fiche sur l'écart entre audit maison et axe-core |

## Ce que l'outillage a révélé

Mon audit de contraste maison, utilisé de SP-567 à SP-571, mesurait la couleur
calculée sans tenir compte de l'alpha. **axe-core a trouvé six défauts qu'il ne
voyait pas.**

| Défaut | Ratio mesuré |
|---|---|
| Opacités sur l'aplat bleu franc | 3,17 et 3,68 |
| Opacité 80 % sur le corail | 4,29 |
| Opacités 60 % sur bleu nuit et crème | 3,58 et 3,61 |
| Badges du simulateur, texte sur fond de même teinte | 1,63 |

Le cas de l'aplat bleu franc mérite d'être retenu : le blanc plein n'y donne
déjà que 4,88:1, donc **aucune transparence n'y est admissible**. Sur le corail,
la limite est atteinte dès 80 %.

Deux défauts structurels en plus :

**La structure `<dl>` de la section contact.** J'avais enveloppé les paires
`<dt>`/`<dd>` dans un `<div>`, que la spécification n'admet pas. Corrigé avec
`<Fragment>`.

**Le message « grande équipe » masqué par `aria-hidden` seul.** Son lien restait
focusable au clavier : un utilisateur atteignait une cible invisible. `inert`
coupe tabulation, pointeur et exposition d'un coup, comme les panneaux du
header.

## Deux tests E2E cassés avant cette refonte

`sector-pages.spec.ts` figeait des `metaTitle` que SP-563 avait réécrits pour le
taux de clic. Vérifié en basculant sur `main` : ces deux tests y échouaient
déjà, indépendamment de la refonte.

Le spec lit désormais le registre plutôt qu'une chaîne codée en dur. Il suivra
les prochaines réécritures de titres sans casser.

## Traçabilité

`PAGE_LAST_MODIFIED` passe au 11 août 2026 pour les huit pages concernées. Les
pages secteur et guides tirent leur date de leur registre, inchangé : leur
contenu n'a pas bougé, seule la mise en page.

`llms.txt` liste des URLs et des descriptions de contenu, que la refonte ne
touche pas. `llms-full.txt` est généré depuis les registres, vérifié à 53 Ko sur
60 sections.

Whitelist E2E auditée : 8 entrées, aucune morte. Les 19 autres specs tournent en
nightly, conformément à la configuration.

## Résultats finaux

Lighthouse mobile, sur `/`, `/tarifs` et `/solutions/planning-restaurant` :

| Catégorie | Score |
|---|---|
| Accessibilité | **100** |
| Bonnes pratiques | **100** |
| SEO | **100** |
| Navigation agentique | **100** |

CLS 0,00 et LCP 779 ms sur Slow 4G avec CPU 4x.

Une note sur la lecture de Lighthouse : le résumé affichait 97 et 96 en
accessibilité sur deux pages, mais le rapport détaillé donne 100. L'écart venait
d'un bouton `recruiter-chat__launcher` injecté par une extension du navigateur,
absent du projet et du HTML servi.

## Balayage de clôture

Vérification demandée après coup sur la documentation, la configuration et le
code mort. Quatre trous trouvés.

**`FAQItem` faisait doublon avec `FaqAccordion`.** `FAQSection` n'avait pas été
migrée en SP-568. Corrigé, et la section redevient un Server Component au
passage, son état vivant désormais dans l'îlot client.

**`AnimatedBackground` posait ses halos bleus sur les pages légales**, qui ont
un aplat crème depuis SP-571. Retiré de là, il ne sert plus que les pages
d'authentification, hors périmètre de la refonte.

**Deux images orphelines** : `avant-apres-sp.webp` et
`logo-smartplanning.webp`, sans référence depuis SP-567. `public/images` passe
de 1,1 Mo à 836 Ko, soit 12 Mo au départ du chantier.

**Le hook de rappel des règles ne couvrait ni `(about)`, ni `(legal)`, ni
`components/public`.** Trois familles de fichiers publics ne déclenchaient donc
aucun rappel de `seo-content.md`. Corrigé et vérifié sur les trois chemins.

Documentation mise à jour : `seo-content.md` gagne une section sur l'identité
visuelle publique (pas de mode sombre, `public-scope` obligatoire, aucune
opacité sur les aplats vifs), `CLAUDE.md` précise d'utiliser axe-core plutôt
qu'un calcul de contraste maison, le README passe à 212 composants et expose
`components/public`.

## Prochaine étape

Le chantier est terminé côté code. Reste le push et la PR groupée, vingt
commits.
