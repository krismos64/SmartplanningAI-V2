# Tests et vérification

Charger ce fichier avant d'écrire ou de modifier un test, et avant de déclarer
un travail terminé.

Un agent projet dédié existe : `test-writer`. L'utiliser pour produire des tests
alignés sur les conventions du dépôt plutôt que d'improviser un style.

## Commandes

```bash
npm run test           # Vitest, single run, pas de flag --run à ajouter
npm run test:e2e:ci    # Playwright, whitelist CI
npm run test:e2e       # Playwright, suite complète
npm run type-check     # tsc --noEmit
```

Playwright en local : préfixer `PORT=3001` si le port 3000 est pris.

## Ce qu'on ne teste pas

Le projet a supprimé environ 197 fichiers de tests cosmétiques en mars 2026.
Ne pas les réintroduire :

- rendu pur sans logique
- passage de props
- attributs SVG et détails de présentation

Ce qui mérite un test : RBAC, isolation `companyId`, validation Zod, transitions
d'état, calculs, idempotence.

## Test négatif obligatoire sur les zones critiques

Pour toute zone touchant l'isolation, l'autorisation ou le paiement, un test
nominal ne suffit pas. Il faut prouver le refus :

- un utilisateur de l'entreprise A n'obtient rien sur une ressource de B
- un rôle insuffisant est rejeté
- un effet monétaire ou un email ne part pas deux fois

Un contrôle qui n'a jamais échoué sur le défaut qu'il prétend attraper n'est pas
un contrôle. En cas de doute sur un test de sécurité, le prouver par mutation :
casser volontairement le code, vérifier que le test rougit, restaurer.

## Mocks

Détails dans `.claude/rules/prisma-pieges.md` : `vi.hoisted()` et jamais
`mockDeep`, mocker `next/server` quand le code appelle `after()`, faux CUID
valides pour la validation Zod `.cuid()`.

## Whitelist E2E de la CI

`testMatch` de `playwright.ci.config.ts` est une liste explicite. Un spec
renommé ou supprimé **disparaît silencieusement de la CI**.

Vérifier la whitelist après tout ajout, renommage ou suppression de spec. La
suite complète tourne en nightly, la CI ne joue que la whitelist.

## Compteurs

Ne jamais citer un nombre de tests de mémoire, il périme à chaque sprint.
Mesurer avec `npm run test` et lire la sortie.

## La couverture est un garde-fou bloquant

Depuis SP-592, `vitest.config.ts` porte des seuils que la CI évalue à chaque
exécution, par `npm run test:coverage` :

```
lines 50   branches 73   functions 73   statements 50
```

**La CI peut donc rougir sur la couverture seule, alors que tous les tests
passent.** Supprimer du code bien testé, ou ajouter du code sans test, suffit.

Le périmètre mesuré inclut `src/lib/`, `src/hooks/` et `src/lib/validations/`,
c'est-à-dire l'authentification, le RBAC, l'isolation, la facturation et la
validation. Les pages et layouts de `src/app/` en sont exclus, ils sont couverts
par les E2E, mais `src/app/api/` est mesuré.

Conséquence pratique : un test sur `src/lib/` compte, un test de rendu de page
ne compte pas et n'a pas à être écrit.

**Relever un seuil demande de mesurer d'abord** (`npx vitest run --coverage`),
jamais de viser un chiffre rond. Les seuils actuels sont posés deux à trois
points sous le réel mesuré (52,38 % de lignes, 75,65 % de branches) : assez de
marge pour absorber une variation, assez de serrage pour rougir si une zone
perd sa couverture. L'ancien seuil de 20 % laissait passer une chute de moitié.

Contre-intuitif et mesuré : les dossiers longtemps exclus de la mesure étaient
les **mieux** couverts du projet. Ce qui tirait le chiffre vers le bas, ce sont
les composants de page. Devant une couverture qui paraît basse, mesurer par
dossier avant de conclure.

## Avant de conclure

Types, lint et tests concernés au vert. Critères d'acceptation vérifiés un par
un. Sur un travail qui ajoute ou retire du code dans le périmètre mesuré,
lancer aussi `npm run test:coverage` : la CI le fera, autant le savoir avant.

**Montrer la preuve** : sortie de commande et résultat. Ne jamais affirmer que
ça marche sans l'avoir exécuté. Si un test échoue, le dire avec sa sortie plutôt
que de le contourner.

## Le seed est la source des comptes E2E, et il ne se complète pas

Les specs E2E s'appuient sur les comptes de `prisma/seed.ts`, pas sur des
comptes qu'ils créeraient eux-mêmes. C'est un choix assumé : aucun test E2E
n'ouvre de connexion Prisma aujourd'hui, et l'introduire pour un seul spec
ajouterait au harnais une dépendance à la base que les vingt autres n'ont pas.

La contrepartie est que **le seed ne complète jamais une base existante**. Il
part d'un `company.create()` et échoue en `P2002` dès que la base contient
quelque chose. La remise à niveau passe donc par un reset complet :

```bash
npx prisma migrate reset    # DESTRUCTIF, développement uniquement
```

La CI recrée sa base à chaque exécution et applique le seed, donc elle ne voit
jamais ce problème. Une base locale, elle, dérive. **Un spec rouge en local et
vert en CI sur un compte introuvable est ce défaut jusqu'à preuve du
contraire**, et non une régression du code.

Mesure SP-595 : `unverified@techcorp.com` a été ajouté au seed le 2 juin 2026
et manquait encore en base locale le 11 septembre, faisant échouer
`e2e/specs/auth.spec.ts` pendant plus de trois mois. Le `P2002` du seed nomme
désormais le reset à lancer, au lieu de rendre une contrainte de slug que rien
ne relie à « ma base est en retard ».

Corollaire : un test rouge en local qu'on apprend à ignorer est un test mort.
Le jour où il rougit pour une vraie raison, personne ne le verra.
