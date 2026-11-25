# 25 novembre 2026, nightly rouge sur effect et alerte restée muette cinq nuits

| Champ              | Valeur                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | aucun, correctif rapide rattaché à SP-596                                                                                          |
| Documents produits | cette entrée                                                                                                                       |
| Documents modifiés | `package.json`, `package-lock.json`, `.github/workflows/nightly-e2e.yml`                                                           |
| Contrôles          | `npm run audit:prod` conforme, type-check OK, lint 0 erreur, `npm run test` : 230 fichiers, 3626 tests verts, `prisma generate` OK |
| Jira               | commentaire sur SP-596                                                                                                             |
| Mémoire            | `ou-en-est-le-projet.md`, `npm-audit-lire-omit-dev.md`                                                                             |

## Ce qui a été fait

**La nightly était rouge depuis le 20 novembre**, cinq nuits, sur le job Unit
Tests. `npm run audit:prod` voyait GHSA-7589-6fvf-x4pw, publiée le 19 novembre
à 20:51 UTC : un ReDoS dans `Schema.TemplateLiteral` d'`effect`, versions
jusqu'à 3.22.0. Chemin unique : `@prisma/client` > `prisma` > `@prisma/config`,
qui épingle `effect` à `3.21.0` exactement.

Contrairement à picomatch le 18 novembre, une version corrigée existait
(3.22.1). Ajout de `"effect": "^3.22.1"` dans `overrides`, résolu en 3.22.5. Le
lockfile ne change que la ligne `effect`. `prisma validate` et
`prisma generate` passent avec cette version.

**L'alerte n'en était pas une.** Le job Notify Failure a tourné chaque nuit,
avec succès : il commentait l'issue #72, ouverte le 12 août et jamais
refermée, 14 commentaires de bot. Rien ne la fermait au retour au vert, donc
chaque nouvel épisode s'empilait dans un vieux fil sans notification visible.
Deux changements : l'issue créée est assignée au propriétaire du dépôt, et un
job `close-on-success` ferme toute issue `nightly-failure` ouverte à la
première nightly verte. #72 se fermera d'elle-même à la prochaine.

## Les écarts

- **L'image de production garde `effect` 3.21.0** dans la CLI Prisma globale
  (`npm install -g prisma@6.19.3` du Dockerfile), que l'override ne couvre
  pas. Non exploitable : cette CLI ne tourne qu'au job `migrate` du CD, sur
  notre propre configuration, hors de toute requête HTTP. La corriger
  demanderait de copier la CLI du builder au lieu de l'installer en global,
  ce qui touche le chemin des migrations
- `prisma migrate status` non rejoué en local, Postgres arrêté. La CI le
  couvre par ses migrations sur base réelle
- La notification de l'assignation n'est prouvée qu'au prochain échec

## Prochaine étape

- Vérifier que la nightly du 26 novembre est verte et que #72 est fermée
- Lire l'activité de JULIENNE, essai jusqu'au 2 décembre
- Décider de la CLI Prisma de l'image (copie depuis le builder)
