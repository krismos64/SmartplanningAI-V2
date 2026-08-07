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

## Avant de conclure

Types, lint et tests concernés au vert. Critères d'acceptation vérifiés un par
un.

**Montrer la preuve** : sortie de commande et résultat. Ne jamais affirmer que
ça marche sans l'avoir exécuté. Si un test échoue, le dire avec sa sortie plutôt
que de le contourner.
