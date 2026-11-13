# 13 novembre 2026, modifier ou supprimer un brouillon ne prévient plus personne

| Champ              | Valeur                                                                                                                                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-618, ouvert le 26 octobre. Plus un correctif sans ticket : plafond d'essais sur les confirmations par mot de passe du profil                                                                                                                                                         |
| Documents produits | `src/lib/utils/schedule-visibility.ts`, `src/lib/actions/__tests__/schedules-draft-notifications.test.ts`                                                                                                                                                                               |
| Documents modifiés | `schedules.ts`, `profile.ts`, `auth-rate-limit.ts`, `schedules.test.ts`, `change-password.test.ts`, `delete-account.test.ts`, `CLAUDE.md`, puis par l'audit : `README.md`, `deployment.md`, `prisma-pieges.md`, `tests.md`, deux agents, `revue-pre-pr`, `schema.prisma` (commentaires) |
| Contrôles          | type-check vert, lint 0 erreur, 224 fichiers et 3594 tests verts, couverture 54,12 % de lignes et 76,56 % de branches. 10 mutations sur SP-618 et 1 sur le profil, toutes détectées. E2E locales (plannings, connexion) : 37 vertes                                                     |
| Jira               | SP-618 commenté                                                                                                                                                                                                                                                                         |
| Mémoire            | `ou-en-est-le-projet.md` mise à jour, `pas-de-ticket-pour-un-correctif-rapide.md` créée                                                                                                                                                                                                 |

## Ce qui a été fait

**La preuve en production de SP-610, pour mémoire.** Notée ici parce que
l'entrée précédente la laissait « à confirmer ». Une connexion ratée depuis le
formulaire de production a créé les six compteurs attendus dans Redis, avec
l'IP publique réelle du poste : `x-real-ip` arrive bien jusqu'à l'application,
sur les deux points d'entrée. Le refus au-delà du plafond n'a pas été rejoué
en production.

**Une règle au lieu de cinq gardes.** Un employé ne voit que les créneaux
`CONFIRMED`. `scheduleVisibilityChange(avant, après)` dit ce qu'il voit
changer : `none` pour un brouillon resté brouillon, `published` pour un
brouillon confirmé, `updated` pour un créneau publié avant et après,
`withdrawn` pour un créneau publié repassé en brouillon. Les cinq actions du
ticket, plus `updateScheduleStatus`, envoient selon ce verdict.

- `updateSchedule` et `updateScheduleStatus` : rien pour `none`, l'annonce
  d'une publication pour `published` (celle de `publishDraftSchedules`),
  l'annonce d'une suppression pour `withdrawn`.
- `deleteSchedule`, `deleteScheduleGroup`, `deleteRecurrenceGroup` : seuls les
  créneaux publiés sont annoncés. Un groupe mixte n'annonce que ceux-là.
- `updateRecurrenceGroup` : chaque créneau de la série est rangé à part, la
  série pouvant mêler brouillons et créneaux publiés.

**Le retrait, que le ticket ne nommait pas.** Un créneau publié repassé en
brouillon disparaît de la vue de l'employé. Sans annonce, il se présenterait
à un créneau retiré. Il est prévenu comme d'une suppression.

**`updateScheduleStatus` ne prévenait de rien.** Le ticket demandait qu'un
passage en `CONFIRMED` par cette action prévienne comme une publication :
elle n'envoyait rien, dans aucun sens.

**Deux tests existants décrivaient le défaut.** Les cas SP-604 de suppression
groupée supprimaient des brouillons (statut par défaut du jeu de données) et
attendaient une notification. Ils portent désormais sur des créneaux publiés.

**Le destinataire d'un retrait est borné à l'entreprise du créneau.**
`notifyEmployeeOfRemovedSchedule` cherche l'employé par identifiant et
`companyId`, un test le vérifie et rougit sans la borne.

**Sans ticket : les confirmations par mot de passe du profil.**
`changePassword` et `deleteAccount` comparaient un mot de passe sans limite,
derrière une session. Cinq essais erronés par quart d'heure et par
utilisateur, réservés avant la comparaison, effacés par un mot de passe
correct. Christophe a demandé de corriger ce type de défaut directement, sans
ticket.

**Audit de fin de session.** Compteurs remesurés : 22 modèles, 16 enums,
65 index, 24 migrations, 66 pages, 18 routes API, 32 actions, 23 services,
9 scripts ops, 187 composants, 28 specs et 275 tests E2E dont 14 et 143 en
CI, tous inchangés. Seuls les tests unitaires ont bougé : 224 fichiers et
3594 tests, couverture 54,12 % de lignes et 76,56 % de branches. Les six
hooks testés en exécution, le hook de démarrage affichant bien la dernière
des trois entrées du jour. Whitelist CI, commandes npm citées et scripts ops
documentés : aucun écart. Sept scripts ops sur neuf sont sur le VPS, à
l'identique par empreinte. `read-funnel-steps.sh` et `test-cd-rollback.sh`
n'y sont pas.

Corrigé par l'audit : compteurs et sécurité du README, `deployment.md`
(version 2.19 et règle `X-Real-IP`), `CLAUDE.md`, `prisma-pieges.md`,
`tests.md`, les agents `test-writer` et `docker-devops`, le skill
`revue-pre-pr`. Les commentaires de `schema.prisma` annonçaient un essai de
14 jours : il est de 21 (`PRICING.TRIAL_DAYS`). Jira : SP-627, SP-610 et
SP-618 en Terminé, cinq tickets ouverts (SP-620, SP-619, SP-602, SP-598,
SP-596).

## Les écarts

`deleteRecurringSchedules` et `updateRecurringSchedules` n'envoient aucune
notification, publiés ou non. Hors du ticket, non touché.

`updateRecurrenceGroup` reçoit `status` comme une chaîne libre, sans
validation Zod. Une valeur inconnue est ignorée pour le calcul des
notifications, mais part telle quelle vers Prisma, qui la refuse. Non corrigé.

Rien n'a été vérifié au navigateur : la preuve repose sur les tests et leurs
mutations.

## Prochaine étape

- Relever en production, au prochain brouillon modifié ou supprimé par un
  client, qu'aucune ligne n'apparaît dans `notifications` pour l'employé.
- Valider par Zod l'entrée de `updateRecurrenceGroup`.
- Tickets ouverts : SP-620, SP-619, SP-602, SP-598, SP-596.
