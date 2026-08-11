# 11 août 2026, llms-full.txt tient enfin sa promesse

| Champ | Valeur |
|---|---|
| Ticket | SP-564, créé pendant la session |
| Documents produits | `src/app/llms-full.txt/route.ts`, `src/app/llms-full.txt/llms-full.content.ts`, `src/app/__tests__/llms-full.test.ts` |
| Documents modifiés | `public/llms.txt` |
| Documents supprimés | `public/llms-full.txt` |
| Contrôles | `npm run test` 3121 tests sur 182 fichiers, `npm run type-check` sans sortie, `npm run lint` aucun avertissement sur les fichiers touchés, `npm run build` route prérendue en `○`, 4 mutations vérifiées, route servie en local et inspectée |
| Jira | SP-564 créé |
| Branche | `feat/llms-full-contenu-integral`, 1 commit |

Deuxième session du jour, sur la piste laissée ouverte le matin même par
SP-563 : `llms-full.txt` listait des URL alors que le format désigne la version
qui embarque le contenu.

## Le défaut était doublé d'une promesse non tenue

`public/llms-full.txt` faisait 8,7 ko. Pour la présentation de l'offre, le
glossaire et la tarification, il portait bien du texte. Pour les pages secteur
et les guides, il se contentait d'une ligne « Page dédiée : URL ».

Le point qui tranche : `llms.txt` décrivait déjà ce fichier comme « version
détaillée de ce fichier avec contenu complet ». Un assistant qui suivait ce
pointeur pour obtenir le contenu complet recevait une liste de liens.

Concrètement, ce qui manquait, ce sont les références légales datées des guides,
article L3131-1 du Code du travail, IDCC 1979, article 13.5 de la convention
HCR, avenant n° 2 du 5 février 2007. C'est ce qui distingue ces guides d'un
contenu générique, et c'est exactement ce qu'un assistant ne pouvait pas citer.

## Route générée plutôt que fichier statique

Les deux options étaient d'enrichir le fichier statique à la main, ou de le
générer depuis les registres. La deuxième a été retenue, et pas seulement par
confort : un fichier statique redérive au premier changement de contenu, ce qui
est précisément le défaut constaté. Le fichier avait été écrit une fois, puis les
pages secteur et les guides ont vécu leur vie sans lui.

Les registres (`getAllSectors`, `getAllGuides`) portent déjà des données pures
sérialisables, importables côté serveur sans React, choix fait en SP-552 et
SP-555 pour le sitemap. Ils se prêtaient directement à la sérialisation en texte.

Le prix passe par `formatPrice` de `lib/config/pricing`, source unique de vérité,
plutôt que par une valeur recopiée.

Résultat : 8,7 ko de liens deviennent 53 ko de contenu, 8180 mots. Ajouter un
secteur ou corriger un paragraphe de guide met désormais ce fichier à jour sans
intervention.

## Deux défauts trouvés en cours de route

**Le prix rendait « 2,9 » au lieu de « 2,90 ».** Mon premier jet formatait
`PRICING.PRICE_PER_EMPLOYEE` par un `.toString().replace('.', ',')`, qui perd la
décimale finale. Sur une page tarifaire, le prix est l'élément le plus repris
par un assistant. Corrigé en passant par `formatPrice`, et couvert par un test
dédié.

**Un `route.ts` n'accepte que les exports reconnus par Next.js.** J'avais exporté
`buildLlmsFullText` depuis `route.ts` pour que les tests vérifient le contenu
sans passer par la couche `Response`. Le build a refusé :

```
Type error: Route "src/app/llms-full.txt/route.ts" does not match the required
types of a Next.js Route.
  "buildLlmsFullText" is not a valid Route export field.
```

Même famille que la règle `'use server'` strict déjà documentée dans le projet,
avec une différence qui compte : ce cas-ci échoue au build, alors qu'un export
non-async dans un fichier `'use server'` ne se voit qu'après déploiement, en 503.

Corrigé en scindant : le contenu vit dans `llms-full.content.ts`, `route.ts` ne
garde que le handler et `dynamic = 'force-static'`.

## Les tests prouvés par mutation

10 tests. Les gardes de contenu reprennent ceux de `sectors.test.ts` : motif
anti-concurrent identique, plus une assertion anti-cadratin et une vérification
des accents.

Le test qui compte vraiment est le seuil de volume à 30 ko, qui attrape le retour
au format « liste de liens ». Quatre mutations exécutées pour vérifier que les
gardes attrapent le défaut qu'ils prétendent attraper :

| Mutation | Tests rougis |
|---|---|
| Sections des guides retirées | 1 sur 10 |
| Retour complet au format liste d'URL, secteurs et guides | 3 sur 10, dont le seuil de volume |
| Prix reformaté en « 2,9 » | 1 sur 10 |
| Cadratin injecté dans le contenu émis | 1 sur 10 |

La première mutation est instructive : retirer les seules sections des guides ne
suffit pas à passer sous le seuil de volume, seul le test de contenu rougit. Le
seuil ne prétend pas détecter une perte partielle, il détecte le changement de
format. C'est ce qu'il fait.

Code restauré après chaque mutation, 10 sur 10 au vert.

## Vérification de la route servie

Build puis serveur local sur le port 3101, avec `NEXT_PUBLIC_APP_URL` de
production :

```
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
x-nextjs-cache: HIT
cache-control: public, max-age=3600, s-maxage=3600
52995 octets
```

`x-nextjs-cache: HIT` confirme que la réponse vient du prérendu et non d'un
rendu à la requête. Le fichier est présent dans `.next/standalone/`, donc dans
l'image Docker.

La suppression de `public/llms-full.txt` était nécessaire, pas cosmétique : un
fichier de `public/` masque une route App Router de même nom, la route n'aurait
jamais été servie.

## Un point noté sans le traiter

Le middleware NextAuth pose deux cookies `authjs` sur `/llms-full.txt`. Ces
cookies n'ont pas d'utilité pour un crawler.

Vérification faite, `sitemap.xml`, `robots.txt` et l'ancien `llms.txt` statique
ont exactement le même comportement. Ce n'est donc pas introduit par cette route,
c'est le middleware global qui s'applique à toutes les routes publiques. Hors
périmètre de SP-564, signalé pour arbitrage.

## Ce qui reste ouvert

La branche porte aussi les deux commits de documentation du matin, restés
locaux. Les grouper dans la même PR évite un cycle de CI, cohérent avec la leçon
tirée le matin même sur les trois runs annulés.

Aucun test E2E ajouté, même arbitrage que pour le hub `/solutions` : la whitelist
`testMatch` de `playwright.ci.config.ts` ne couvre pas les pages publiques. Le
contenu est ici couvert en unitaire, et la route est vérifiée par le build et par
un appel HTTP réel.

Effet non mesurable, comme annoncé le matin. Quand un assistant cite une page, le
lecteur ne clique pas : la citation ne laisse aucune trace dans Umami. Ce travail
se justifie par ce qu'il rend disponible, pas par une métrique à surveiller.

Reste inchangé depuis ce matin : l'action manuelle en Search Console
(resoumettre le sitemap, demander l'indexation de `/solutions`), la mesure du CTR
fin août, le seuil de décrochage à étalonner après les essais des 26 et 27 août.
