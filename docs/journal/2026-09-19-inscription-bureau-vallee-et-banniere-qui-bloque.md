# 19 septembre 2026, une inscription analysee, un fil d'Ariane casse et une banniere qui bloque le produit

| Champ | Valeur |
|---|---|
| Ticket | SP-599 (fil d'Ariane, corrige), SP-600 (banniere de cookies, ouvert) |
| Documents produits | `__tests__/components/ui/dynamic-breadcrumbs.test.tsx`, cette entree |
| Documents modifies | `src/components/ui/dynamic-breadcrumbs.tsx` |
| Controles | type-check vert, `npm run test` 202 fichiers et 3339 tests verts, preuve par mutation faite, mesures au navigateur via Playwright |
| Jira | SP-599 et SP-600 crees |
| Memoire | `banniere-cookies-bloque-le-back-office.md`, `analyser-une-inscription-en-production.md` |

## Le point de depart

Une inscription en production le 18 septembre, « bureau vallee vichy »
(mikael.mauplin@bureau-vallee.fr). Question posee : qu'a-t-il fait sur le site.

La reponse tient en une ligne de SQL. Il a monte 4 equipes et 10 employes a la
main en quatorze minutes, ouvert l'ecran plannings, y est revenu sept fois
jusqu'a 16:44, et `SELECT COUNT(*) FROM schedules` pour son entreprise
renvoie **0**. Il n'est jamais revenu depuis.

Aucune erreur 5xx, aucune erreur applicative, les 56 POST sur l'ecran plannings
repondent tous 200. Meme forme que SP-578 (Sunlight) : rien ne casse, et
l'utilisateur est perdu quand meme.

## Defaut 1, le fil d'Ariane (SP-599)

29 reponses 404 pendant sa session, toutes sur `/app/dashboard/director` et
`/app/dashboard/director/teams`. `dynamic-breadcrumbs.tsx` batissait le href de
chaque segment en prefixant en dur `/app/dashboard/`, alors que le back-office
porte cinq espaces de routes. Le referer de chaque 404 est un ecran equipes :
il les a rencontrees en configurant ses equipes.

Le meme prefixe alimentait le JSON-LD `BreadcrumbList`, qui publiait donc des
URL mortes.

Introduit par SP-264. Le composant n'avait **aucun test**, ce qui explique sa
survie. Preuve par mutation faite : prefixe reintroduit, 5 tests sur 12
rougissent, dont celui du cas exact mesure en production.

## Defaut 2, la banniere de cookies (SP-600)

C'est la trouvaille de la session, et elle est plus grave que la premiere.

`CookieBanner` est monte au layout racine et n'exclut aucune route :
`if (hasConsented) return null`, rien sur le pathname. Elle s'affiche donc dans
l'application privee, pour un utilisateur connecte, tant qu'il n'a rien
tranche. Elle est posee en `fixed bottom-0 left-0 right-0 z-50`.

Mesure au navigateur, viewport 1280x720, sur `/app/dashboard/schedules` :

```
BANNIERE boundingBox : {"x":0,"y":484.5,"width":1280,"height":235.5}
GRILLE   boundingBox : {"x":306,"y":464,"width":860,"height":179}
```

La grille va de y=464 a y=643, la banniere commence a y=484,5 : **158,5 px sur
179 sont recouverts, soit 89 pour cent de la grille.**

Le recouvrement n'est pas que visuel. `document.elementFromPoint` sur quatre
points de la zone de grille renvoie la banniere quatre fois sur quatre :

```
clic en (640, 500) atteint : BANNIERE <- DIV
clic en (640, 550) atteint : BANNIERE <- H2
clic en (640, 600) atteint : BANNIERE <- P
clic en (640, 640) atteint : BANNIERE <- DIV
```

Sur l'ecran central du produit, un dirigeant en essai ne peut pas interagir
avec le planning tant qu'il n'a pas traite la banniere.

Ce qui rend le defaut systematique pour les nouveaux comptes : un prospect qui
vient de s'inscrire n'a, par construction, encore rien tranche. Et le CLAUDE.md
documente deja que la quasi-totalite des visiteurs refusent le consentement
(10 septembre : 401 requetes Nginx, 86 visiteurs, zero session Umami).

## Ce qui a ete ecarte en chemin

Trois hypotheses tombees devant la mesure, chacune avant d'etre ecrite en
ticket :

- **Le filtre de statut**, cause de SP-578. `DEFAULT_STATUS` vaut bien `'all'`
  depuis ce correctif : il tient.
- **Le modal de creation**. Parcouru au navigateur, il s'ouvre, liste les
  employes, et la validation Zod affiche « Selectionnez au moins un employe ».
  Il fonctionne.
- **Une erreur applicative**. Les logs du conteneur sur la fenetre ne portent
  que du bruit Prisma edge runtime, sans rapport.

Le blocage est en amont du modal, dans une couche que ni les tests ni le code
de l'ecran ne pouvaient designer.

## Ce qui reste ouvert

- **SP-600** a corriger, avec un test E2E qui prouve qu'un clic au centre de la
  grille atteint la grille pour un utilisateur qui n'a pas consenti. Verifier
  aussi les autres ecrans denses du back-office.
- **L'ecran plannings n'a aucun etat vide.** Un dirigeant sans creneau voit une
  grille vierge et « Aucun planning cette semaine », sans invitation a creer le
  premier. A trancher apres correction de la banniere, en mesurant s'il reste
  un blocage.
- **Mikael Mauplin est un prospect reel, joignable**, 11 employes soit environ
  32 euros par mois. Son essai court encore. Un message pourrait valoir plus
  que les deux correctifs.

## Deux lecons de methode

**Le harnais de mesure vaut le correctif.** Le blocage de la banniere n'etait
visible ni dans le code de l'ecran plannings, ni dans les tests, ni dans les
logs. Il a fallu ouvrir la page dans un vrai navigateur et interroger
`elementFromPoint`. Meme famille que l'audit de contraste maison : un calcul
ecrit pour l'occasion ne voit pas ce qu'un navigateur voit.

**Une session de production est une source de defauts que les tests ne
produisent pas.** Deux defauts reels sortis d'une seule inscription analysee,
dont un bloquant. Le cout : quelques requetes SQL et une lecture de logs.
