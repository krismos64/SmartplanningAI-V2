# 13 novembre 2026, deux créations simultanées ne font plus de doublon

| Champ              | Valeur                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-619, ouvert le 26 octobre. Plus un correctif sans ticket : validation Zod de `updateRecurrenceGroup`                                                                                                                               |
| Documents produits | `src/lib/services/schedule-lock.ts` et son test, `__tests__/integration/` (setup et test de concurrence), `vitest.integration.config.ts`, `__tests__/utils/prisma-transaction.ts`                                                     |
| Documents modifiés | `schedules.ts`, `validations/schedule.ts`, trois fichiers de test des actions, `vitest.config.ts`, `package.json`, `ci.yml`, `CLAUDE.md`, `prisma-pieges.md`, `tests.md`                                                              |
| Contrôles          | type-check vert, lint 0 erreur, 225 fichiers et 3602 tests verts, couverture 54,13 % de lignes et 76,59 % de branches. Intégration : 6 tests verts sur cinq passages. 4 mutations sur SP-619 et 2 sur la validation, toutes détectées |
| Jira               | SP-619 commenté                                                                                                                                                                                                                       |
| Mémoire            | `ou-en-est-le-projet.md` mise à jour, `transactions-serializable-globales.md` créée                                                                                                                                                   |

## Ce qui a été fait

**Mesure en production d'abord.** 1009 créneaux, aucun doublon sur
(employé, jour, début, fin), aucun chevauchement horaire pour un même
employé. Le défaut n'a jamais frappé un client.

**Le défaut reproduit sur une vraie base.** Un test lance cinq créations
identiques en même temps et compte les lignes. Sur le code d'origine, il en
restait quatre. Deux modifications simultanées vers le même horaire
réussissaient toutes les deux, comme une création et un déplacement
concurrents. La suite unitaire ne pouvait pas le voir : Prisma y est mocké.

**Le correctif.** `createSchedule` et `updateSchedule` vérifient et écrivent
dans une même transaction, sous `pg_advisory_xact_lock` par employé. Le
second appel attend le premier, puis reçoit le message de conflit habituel.
Les verrous d'une création groupée sont pris dans un ordre trié : sans le
tri, deux créations en ordre inverse s'interbloquaient, mesuré à 1049 ms,
le délai de détection de Postgres.

**La découverte de la session : tout tourne en `Serializable`.**
`src/lib/prisma.ts` impose ce niveau à toutes les transactions depuis
novembre 2025. Avec le verrou seul, des appels échouaient encore en
`P2034` : l'instantané est pris pendant l'attente du verrou, le second appel
ne voit pas le créneau du premier, et Postgres l'annule. Le même mode faisait
échouer deux créneaux **sans** chevauchement posés en même temps. Les
transactions verrouillées passent donc en `ReadCommitted`. Ce mode global est
probablement aussi à l'origine du `P2034` de `deleteAccount` en septembre
(SP-580), non vérifié.

**Premier harnais de tests sur base réelle.** `npm run test:integration`,
hors de la suite unitaire. Le setup refuse tout hôte qui n'est pas local.
Chaque exécution crée son entreprise et la supprime : zéro reste en base
après les passages. En CI, l'étape tourne dans le job E2E, déjà doté d'une
base migrée.

**Les mutations.** Retirer le verrou de la création : 4 tests rouges. Celui
de la modification : 2. Le tri : 1. L'isolation `ReadCommitted` : 4. Le test
unitaire `schedule-lock.test.ts` garde le tri et l'isolation dans la suite
mesurée, même sans base.

**Sans ticket : `updateRecurrenceGroup` validé par Zod.** Statut et type
arrivaient en chaînes libres, une valeur inconnue partait vers Prisma.
`updateRecurrenceGroupSchema` valide l'identifiant, les heures, le type, le
statut et les textes, et écarte toute autre clé. Les tests de série passaient
`'rec1'` comme identifiant : le test d'isolation entre entreprises aurait
alors réussi par la validation. Il reçoit un CUID, et une mutation prouve
qu'il rougit sans le contrôle d'entreprise.

## Les écarts

`duplicateSchedule` ne vérifie aucun conflit. Aucun écran ne l'appelle, non
touché.

`updateRecurrenceGroup` change les heures d'une série sans vérifier les
chevauchements, et une approbation de congé ne prend pas le verrou : une
course entre un congé approuvé et un créneau posé reste possible. Aucun des
deux n'a de ticket.

Les autres transactions interactives du projet tournent toujours en
`Serializable` : un `P2034` en concurrence y reste possible. Pas de
changement global, décision d'architecture à prendre.

Rien n'a été vérifié au navigateur. La preuve repose sur la base réelle.

## Prochaine étape

- Pousser, ouvrir la PR, vérifier l'étape d'intégration dans le job E2E.
- Décider du niveau d'isolation global de `src/lib/prisma.ts`.
- Tickets ouverts : SP-620, SP-602, SP-598, SP-596.
