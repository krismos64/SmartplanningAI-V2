# 13 novembre 2026, une série ne recouvre plus un autre créneau

| Champ              | Valeur                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-628, créé le jour même                                                                                                                                                                |
| Documents produits | `__tests__/integration/series-overlap.test.ts`                                                                                                                                           |
| Documents modifiés | `src/lib/actions/schedules.ts`, `schedules.test.ts`, `schedules-draft-notifications.test.ts`                                                                                             |
| Contrôles          | type-check vert, lint 0 erreur, 229 fichiers et 3623 tests verts, couverture 54,27 % de lignes. Intégration 11 sur 11 sur cinq passages. 2 mutations détectées, après correction du test |
| Jira               | SP-628 créé, commenté puis clos                                                                                                                                                                    |
| Mémoire            | `ou-en-est-le-projet.md` mise à jour                                                                                                                                                     |

## Ce qui a été fait

**Le défaut.** `updateRecurrenceGroup`, appelé par l'écran des plannings
quand une modification s'applique « à toute la série », réécrivait les
horaires par un seul `updateMany`, sans vérification. Production mesurée
avant : 55 séries, 979 créneaux, aucun chevauchement. Rien d'abîmé.

**Le correctif.** Quand l'horaire ou le type change, `findSeriesOverlap`
cherche en une requête les autres créneaux de l'employé sur les dates de la
série, série exclue, avec les règles de `validateNoConflicts`. Vérification
et écriture se font dans une transaction, sous le verrou de SP-619. Un
changement de titre ou de statut ne déclenche pas la recherche. Les congés
ne sont pas vérifiés : la modification ne change aucune date, et un congé
approuvé après la création de la série ne doit pas bloquer un changement
d'horaire.

**Le test qui ne pouvait pas échouer.** Retirer le verrou laissait la course
simultanée au vert, 3 passages sur 3. La mutation reproduisait pourtant le
défaut, mais les lectures qui précèdent chaque action (session, série,
permissions) décalaient les deux appels hors de la fenêtre de course. Le test
rejoue désormais la course sur 15 tours, chacun sur un état neuf : sans le
verrou, il rougit à chaque passage ; avec, 11 tests verts cinq fois de suite.

**Rouge sur le code d'origine** : 3 cas sur 5, les deux autres (horaire sans
conflit, congé ignoré) décrivant ce qui marchait déjà.

## Les écarts

L'écran modifie d'abord le créneau choisi (`updateSchedule`), puis la série.
Si la série est refusée, le créneau choisi reste modifié et l'écran affiche
l'erreur. Comportement préexistant, non touché.

`updateRecurringSchedules` et `deleteRecurringSchedules` n'ont aucun
appelant hors des tests.

## Prochaine étape

- Fait le jour même : PR #129 mergée (`17e39ae`), image `sha-17e39ae`,
  healthy, aucune erreur dans journald. SP-628 clos.
- Ticket ouvert : SP-602.
