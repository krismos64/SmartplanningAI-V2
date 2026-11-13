# 13 novembre 2026, les failles des dépendances de production traitées et surveillées

| Champ              | Valeur                                                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-596, ouvert le 11 septembre                                                                                                                                                                              |
| Documents produits | `scripts/ci/check-prod-audit.mjs`, `scripts/ci/audit-exceptions.json`, `__tests__/scripts/check-prod-audit.test.ts`, `__tests__/lib/email/nodemailer-contract.test.ts`                                      |
| Documents modifiés | `package.json`, `package-lock.json`, `ci.yml`, `nightly-e2e.yml`, `CLAUDE.md`, `README.md`, `deployment.md`, `vulnerability-fixes-2026-01-05.md`                                                            |
| Contrôles          | type-check vert, lint 0 erreur, 228 fichiers et 3611 tests verts, couverture 54,15 % de lignes. Intégration 6 sur 6. Build de production vert. Image Docker construite en local, `sharp` chargé sous Alpine |
| Jira               | SP-596 commenté puis clos                                                                                                                                                                                             |
| Mémoire            | `npm-audit-lire-omit-dev.md` réécrite, `ou-en-est-le-projet.md` mise à jour                                                                                                                                 |

## Ce qui a été fait

**La mesure avait empiré depuis septembre.** `npm audit --omit=dev` donnait
0 critique et 16 hautes le 11 septembre, **1 critique et 18 hautes** le
13 novembre. La critique était dans `next` : exécution de code à distance
par l'optimiseur d'images, via `sharp`, sur Linux glibc. L'image tourne sur
Alpine (musl), donc pas directement exposée, mais le déni de service par
Server Actions du même lot s'appliquait.

**Corrigé, paquet par paquet.**

- `next` 15.5.29, dernière 15.x. Elle accepte encore `sharp` 0.34 : `sharp`
  0.35.5 est donc posé en dépendance directe, sans quoi l'ancien restait.
- `nodemailer` 7 vers 10.5. `next-auth` et `@auth/core` le déclarent en peer
  `^7 || ^8` : deux `overrides` les alignent. Les ruptures (code `NoAuth`
  renommé, TLS vérifié pour les contenus distants, Node 20) ne touchent pas
  notre usage. Le contrat dont dépend SP-579, `EENVELOPE` et `err.rejected`
  sur un refus, est vérifié par un test contre un vrai serveur SMTP ouvert
  sur la boucle locale. Sans la reconnaissance d'`EENVELOPE`, ce test voit
  l'adresse refusée ressortir en `FAILED`.
- `xlsx` 0.20.3, distribution officielle de SheetJS, le paquet npm étant
  abandonné en 0.18.5. Les deux failles portent sur la lecture, et
  `use-csv-import.ts` lit les fichiers importés.
- `prisma` et `@prisma/client` 6.19.3. `npm audit fix` avait rétrogradé le
  CLI en 6.12.0, antérieur à la dépendance vulnérable, en laissant le client
  en 6.18.0 : refusé, un CLI désaccordé générant un autre client que celui
  qui tourne.
- `postcss` 8.5.32, y compris la copie figée en 8.4.31 par `next`, par
  override et retrait de son entrée du lockfile.
- Transitives sans montée majeure par `npm audit fix` : `lodash`, `nanoid`,
  `defu`, `effect`, `picomatch`, `brace-expansion`, `minimatch` et d'autres.

**Après : 0 critique et 4 hautes, soit deux advisories documentées.**
`zod` : la faille est dans `$ZodArray` de zod v4, le projet est en 3.25 et
aucun fichier, ni de `src/` ni des dépendances de production, n'importe
`zod/v4`. `deepmerge-ts` (comptée trois fois, via `prisma` et
`@prisma/config`) : le CLI ne fusionne que la configuration du dépôt. Les
deux exceptions ont une date de réexamen au 13 février 2027.

**Le garde-fou.** `npm run audit:prod` rougit sur toute advisory haute ou
critique de production absente de `audit-exceptions.json`, ou dont
l'exception a expiré, et signale une exception devenue inutile. Il tourne
dans le job Lint de la CI et dans la nightly, une faille publiée sans
changement de code n'étant vue par aucun push. Sur l'ancien lockfile, il
relève 31 advisories bloquantes dont 29 non couvertes.

**Vérifié hors CI.** Le job Build de la CI construit hors Docker. L'image a
été construite en local : `sharp` 0.35.5 et libvips 8.18.7 se chargent sous
Alpine. `nodemailer` n'a pas de dossier dans `node_modules` de l'image, il
est compilé dans les chunks serveur, exactement comme dans l'image en
production.

## Les écarts

L'outillage de test porte 2 critiques (`vitest`, `tinypool`), hors du
périmètre du ticket et absentes de l'image de production.

Les quatre basses de `@react-email` (via `deepmerge` de `html-to-text`)
n'ont pas de correctif publié. Non bloquantes pour le garde-fou.

Le build signale `CompressionStream` de `jose` dans le middleware Edge :
`jose` n'a pas changé de version, l'avertissement préexistait.

## Prochaine étape

- Fait le jour même : PR #127 mergée (`13ea6f3`), image `sha-13ea6f3` en
  production, healthy, aucune erreur dans journald. `sharp` 0.35.5 tourne en
  production, l'optimiseur d'images répond en 200, les routes d'Auth.js
  aussi. SP-596 clos.
- Réexaminer les deux exceptions avant le 13 février 2027 : migration zod 4,
  Prisma 7.
- Tickets ouverts : SP-602, SP-598.
