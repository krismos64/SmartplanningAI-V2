# 18 novembre 2026, nightly rouge sur picomatch et CLI Prisma de l'image en retard

| Champ              | Valeur                                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | aucun, correctif rapide rattaché en commentaire à SP-596                                                                                                                          |
| Documents produits | `__tests__/scripts/dockerfile-prisma-version.test.ts`                                                                                                                             |
| Documents modifiés | `package.json`, `package-lock.json`, `docker/Dockerfile`, `README.md`, `docs/deployment.md` (2.20), agent `docker-devops`                                                         |
| Contrôles          | `npm run audit:prod` conforme, `npm run build` OK, type-check OK, lint 0 erreur, `npm run test:coverage` : 230 fichiers, 3626 tests verts, 54,27 % de lignes, 76,66 % de branches |
| Production         | PR #131 mergée (`66ad25f`), CI et CD verts, `sha-66ad25f` healthy, `prisma --version` à 6.19.3 dans le conteneur, aucune erreur dans journald                                     |

## Ce qui a été fait

**La nightly du 18 novembre était rouge**, sur le job Unit Tests et non sur les
E2E. `npm run audit:prod` (SP-596) avait vu une advisory haute publiée la
veille, GHSA-fc5q-39xc-vjpf : un ReDoS dans `picomatch`, toutes versions
jusqu'à 4.0.7, sans version corrigée. Un `overrides` était donc impossible, et
le correctif proposé par `npm audit` passait à Tailwind 4.

**La faille n'avait rien à faire en production.** Son seul chemin passait par
`tailwindcss-animate`, déclaré en `dependencies`, qui tire `tailwindcss`.
L'étape `deps` du Dockerfile fait un `npm ci` complet et l'image finale ne
garde que `.next/standalone` : le plugin ne vit qu'au build. Passé en
`devDependencies`, sans exception ajoutée. Le lockfile ne change que des
marqueurs `dev`, aucune version. Constat au passage : aucune classe du plugin
n'est utilisée dans `src`, il ne fournit que ses `@keyframes`. Gardé pour les
composants Shadcn à venir.

**La CLI Prisma de l'image était restée en 6.18.0.** Le job `migrate` du CD
lance `npx prisma migrate deploy` dans l'image finale, sans
`node_modules/.bin` : c'est la CLI installée en global par le Dockerfile qui
applique les migrations. Alignée sur 6.19.3, et un test la compare désormais à
`package-lock.json`. Prouvé par mutation : remettre 6.18.0 fait rougir le test
(« Expected 6.19.3, Received 6.18.0 »).

## Audit documentaire de fin de session

Vérifié contre le dépôt, pas recopié : six hooks (syntaxe `bash -n` saine),
cinq agents, neuf scripts dans `scripts/ops/`, runners tous en `ubuntu-24.04`,
scripts npm cités par `CLAUDE.md` tous présents, E2E 28 fichiers et 275 tests
dont 143 en whitelist CI, 26 tests publics dont 11 audits axe-core, base
réelle 2 fichiers et 11 tests, versions du README et de `deployment.md`
conformes au lockfile. Écarts corrigés : compteurs et couverture du README,
`deployment.md` et `docker-devops` sur la CLI Prisma et le piège de l'audit.
Jira : SP-602 seul ouvert, cohérent.

## Prochaine étape

- Vérifier que la nightly du 19 novembre repasse au vert
- Lire l'activité de JULIENNE en production, essai jusqu'au 2 décembre
- Approbation de congé hors du verrou de SP-619
