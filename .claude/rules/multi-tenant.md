# Isolation multi-tenant et RBAC

Charger ce fichier avant de toucher : une Server Action, une route API, une
requête Prisma, `src/lib/auth*`, `src/lib/notifications*`, ou tout code qui
choisit des destinataires.

SmartPlanning héberge plusieurs entreprises dans une base unique. Une requête
mal filtrée ne produit pas une erreur : elle produit une fuite silencieuse de
données entre clients. C'est la classe de défaut la plus grave du projet, et la
seule qui soit déjà arrivée en production.

## Les 4 rôles

`SYSTEM_ADMIN` > `DIRECTOR` > `MANAGER` > `EMPLOYEE`

`SYSTEM_ADMIN` est le seul rôle dont le `companyId` vaut `null` : il voit toutes
les entreprises. Tous les autres sont bornés à la leur.

## Filtrage par companyId

Chaque requête porte l'isolation. Le pattern de défense en profondeur autorisé,
et le seul endroit où une clause d'isolation a le droit d'être conditionnelle :

```ts
where: {
  ...(companyId ? { companyId } : {}),  // ignoré pour SYSTEM_ADMIN
}
```

Ce pattern est réservé au cas SYSTEM_ADMIN. Partout ailleurs, `companyId` est
obligatoire et explicite.

## `undefined` dans un `where` Prisma retire le filtre

C'est le piège central du projet, il a coûté une fuite en production. Prisma
traite `undefined` comme « critère absent », pas comme « ne matche rien ».

```ts
// FAUX : si teamId est null, la clause disparaît et la requête
// renvoie tous les employés, toutes entreprises confondues.
managedTeams: teamId ? { some: { id: teamId } } : undefined

// JUSTE : sortir en amont
if (!teamId) return
// ou neutraliser explicitement
managedTeams: { some: { id: { in: teamId ? [teamId] : [] } } }
```

Incident d'août 2026 : sur cette ligne exacte, les demandes de congé des employés
sans équipe partaient aux managers de **toutes** les entreprises, avec nom et
dates d'absence. Voir `.claude/rules/prisma-pieges.md` pour la famille complète
de pièges Prisma.

Règle : une clause d'isolation n'est jamais conditionnelle. Sortir en amont ou
passer par `{ in: [] }`, jamais `undefined`.

## Sélection de destinataires

Le `findMany` qui choisit **qui reçoit** une notification ou un email est un
point d'isolation au même titre qu'une lecture de données. Il se traite avec la
même rigueur.

Deux couches obligatoires :

1. Filtrer par `companyId` explicitement dans la requête qui sélectionne
2. Garde côté factory : refuser et journaliser un destinataire hors de
   l'entreprise de l'entité concernée (implémenté dans `notifications.ts`)

La deuxième couche existe parce que la première a déjà échoué une fois.

## Lecture de session

```ts
// TOUJOURS
const data = getEffectiveSessionData(session)

// JAMAIS directement
session.user.companyId
```

`getEffectiveSessionData` résout le repli sur cookie quand le JWT n'est pas
encore à jour, race condition connue de `session.update()`.

`assertNotImpersonating(session.user.isImpersonating)` ignore le cookie résiduel
quand le JWT dit `false`. Forcer `isImpersonating` à `false` casse le repli
cookie : régression SP-514, corrigée en juillet 2026.

## Server Actions

`checkPermission()` en entrée, validation Zod sur toute donnée non fiable. Pas
d'exception : un identifiant venant d'une URL ou d'un formulaire n'autorise
jamais l'accès à lui seul.

## Avant de conclure sur une zone d'isolation

Un test négatif est obligatoire : vérifier qu'un utilisateur de l'entreprise A
n'obtient **rien** sur une ressource de l'entreprise B. Un test qui ne vérifie
que le chemin nominal ne prouve pas l'isolation.
