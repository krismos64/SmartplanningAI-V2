# Pièges Prisma, Next.js et production

Charger ce fichier avant de toucher : un fichier `'use server'`, une requête
Prisma non triviale, un script de backfill, du SQL de diagnostic, ou la config
Nginx.

Chaque entrée correspond à un défaut qui a réellement coûté du temps ou une
panne. Aucune n'est théorique.

## `undefined` retire le filtre

Traité en détail dans `.claude/rules/multi-tenant.md`, rappelé ici parce que le
piège dépasse l'isolation : toute clause conditionnelle qui peut valoir
`undefined` élargit silencieusement le périmètre d'une requête. Vérifier chaque
ternaire dans un `where`.

## `'use server'` strict

Un fichier `'use server'` n'exporte **que** des fonctions async. Types,
constantes et schémas Zod vont dans un fichier séparé.

Un export non-async provoque un **503 en production**, pas une erreur de build :
le défaut ne se voit qu'après déploiement.

## Pas de dynamic import d'un fichier `'use server'`

Pour une fonction appelée depuis une route API, passer par un fichier service
séparé, par exemple `admin-notification.service.ts`.

## Invalidation du cache dashboard

Toute Server Action mutative appelle :

```ts
invalidateDashboardCache(companyId)
revalidatePath('/app/manager/dashboard')
revalidatePath('/app/director/dashboard')
```

`/app/dashboard` seul ne couvre pas les routes par rôle. Oublier une des deux
laisse un dashboard périmé pour la moitié des utilisateurs.

Cas voisin : `updateProfile` a manqué `revalidatePath('/app', 'layout')`, le
changement de poste n'apparaissait qu'à la reconnexion.

## `after()` de `next/server`

Pour les effets de bord non bloquants, typiquement un email après validation.

En test Vitest, mocker `next/server` : `after()` lève hors d'un request scope.

## Mocks Prisma en test

Mocks manuels avec `vi.hoisted()`, jamais `mockDeep` : problèmes de hoisting
connus sur ce projet.

Tests messagerie : utiliser de faux CUID valides, `cl000000000000000000user1`,
la validation Zod `.cuid()` rejette les chaînes arbitraires.

## Scripts `src/scripts/*.ts` non exécutables en production

L'image Docker est un build Next.js standalone : pas de `src/scripts/`, pas de
`tsx`, pas de `node_modules/.bin`. Un `docker exec smartplanning-app npx tsx …`
échoue.

Pour un backfill en production, la marche à suivre est :

1. Traduire le filtre en SQL
2. Vérifier le périmètre par un `SELECT` portant la clause **exacte** du futur
   `UPDATE` ou `DELETE`
3. Exécuter en transaction, comparer le nombre de lignes touchées à l'attendu

Modèles en en-tête de `backfill-expired-trials.ts` et
`cleanup-cross-tenant-leave-notifications.ts`.

Mesurer avant de supprimer. Un `DELETE` lancé à l'aveugle « réussit » sur 0 ligne
sans jamais révéler que le périmètre était vide, et laisse croire à un nettoyage
effectif. C'est exactement ce qui s'est produit en août 2026, où les `SELECT`
préalables ont montré qu'il n'y avait rien à supprimer.

## Comparer deux colonnes nullables en SQL

`NULL <> 'x'` vaut `NULL`, donc faux. Une requête de diagnostic écrite avec `<>`
rate silencieusement les lignes concernées.

Utiliser `IS DISTINCT FROM` dans tout diagnostic portant sur
`Notification.companyId`, `Employee.teamId` ou `User.companyId`.

## Whitelist E2E de la CI

`testMatch` de `playwright.ci.config.ts` est une liste explicite. Un spec renommé
ou supprimé disparaît **silencieusement** de la CI, sans aucune alerte.

Vérifier la whitelist après tout ajout, renommage ou suppression de spec.

## Nginx, HTTP/2 et `limit_conn`

Nginx compte chaque **stream**, pas chaque connexion TCP. Une limite basse
provoque des 503 au premier chargement, une page Next.js tirant 30 chunks JS ou
plus. Limite actuelle : 100, avec exemption sur `/_next/static/*`.

## Nginx, www vers apex

Bloc 443 dédié en 301. Ne jamais remettre `www` dans le `server_name` du bloc
principal : contenu dupliqué, pénalité SEO.
