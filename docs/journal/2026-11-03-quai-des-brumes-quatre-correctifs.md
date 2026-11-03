# 3 novembre 2026, un compte supprimé le jour de son inscription et quatre correctifs, de la série qui effaçait 60 créneaux à l'entreprise orpheline

| Champ              | Valeur                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-621, SP-622, SP-623, SP-624                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Documents produits | `src/scripts/cleanup-orphan-companies.sql`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Documents modifiés | `src/lib/actions/schedules.ts`, `src/lib/actions/profile.ts`, `src/lib/utils/weekly-hours.ts`, `src/lib/utils/recurrence.ts`, `src/lib/validations/user.ts`, `src/components/schedules/{RecurrenceEditDialog,RecurrenceConfig,ShiftModal,WeeklyHoursPanel,useWeeklyHoursCheck}.tsx`, `src/app/app/dashboard/schedules/_components/SchedulesPageContent.tsx`, `src/components/layout/DashboardLayout.tsx`, `src/components/ui/dynamic-breadcrumbs.tsx`, `src/lib/pdf/SchedulePdfDocument.tsx`, `src/app/api/schedules/export/pdf/route.ts`, `src/app/app/profile/delete/*`, `emails/templates/AccountDeletionAdminEmail.tsx`, tests associés |
| Contrôles          | `npm run test` 219 fichiers, 3520 tests verts ; type-check et lint à 0 erreur ; trois tests prouvés par mutation ; parcours complet au navigateur en local                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Jira               | SP-621 à SP-624 créés et commentés                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Mémoire            | `inscription-quai-des-brumes-3-novembre.md` créée puis mise à jour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Ce qui a été fait

QUAI DES BRUMES, commerce sur deux sites, arrivé par Google sur
`/solutions/planning-commerce`, s'est inscrit à 11:45 et a supprimé son compte
à 13:28. Base, `audit_logs`, Nginx puis journald : 46 créneaux créés en deux
récurrences, tous supprimés, 2 gardés, trois exports PDF, 45 minutes sur
`/contact` sans message. Reproduit ensuite en local.

**SP-621.** Le dialogue de série comptait les créneaux de la semaine affichée,
la suppression visait tout le `recurrenceGroupId`, partagé par les employés
sélectionnés à la création. Mesuré : « 12 créneaux » annoncés, toast « 60
créneaux supprimés ». La série se borne désormais au groupe, à l'employé et à
l'entreprise du créneau cliqué, pour la suppression, la modification et le
compteur lu côté serveur. Vérifié au navigateur : « 24 créneaux de cet
employé », 24 supprimés, 48 intacts chez les deux autres.

**SP-622.** La pause déjeuner des paramètres n'était lue par aucun calcul.
`workedHours` la déduit quand le créneau la couvre entièrement, pour la jauge,
l'avertissement de création et le total du PDF. 09:00 à 19:00 sur cinq jours
passe de 50 h, « au-delà des 48 h légales », à 45 h.

**SP-623.** La répétition proposait Lun-Ven codé en dur ; elle propose les
jours d'ouverture, avec un raccourci dédié. La page plannings coupait 66 px à
1470 px : le `ScrollArea` Radix enveloppe son contenu dans un `display: table`
qui s'élargit au contenu. Corrigé dans `DashboardLayout`, mesuré sans
débordement à 1300 et 1470 px.

**SP-624.** Le fil d'Ariane n'offre plus de lien vers `/app/director`,
`/app/admin` et `/app/manager`. Le dernier utilisateur d'une entreprise
l'emporte avec lui dans la même transaction, la suppression est refusée tant
qu'un abonnement payant court, et un motif facultatif part à l'audit et à
l'email admin. Prouvé en local : compte, entreprise et 3 employés supprimés,
audits `USER` et `COMPANY` conservés avec le motif.

## Les écarts

`getCompanySettings` est réservé au dirigeant : un manager n'aurait reçu ni la
pause ni les jours d'ouverture. Ajout de `getCompanyPlanningSettings`, lisible
par tout rôle de l'entreprise.

Les tests SP-599 du fil d'Ariane imposaient le lien vers `/app/director`,
c'est-à-dire le défaut. Ils ont été réécrits.

L'export Excel calcule toujours ses durées sans pause : hors périmètre, à
reprendre si un client s'en sert.

Le raccourci « Lun–Ven » portait un tiret demi-cadratin dans l'UI, remplacé
par « Lun à ven ».

## Prochaine étape

Fait le 3 novembre 2026 :

- Nettoyage des deux entreprises orphelines en production, après un test à
  blanc : 2 lignes supprimées, 0 restante
- PR #117 mergée (`98a9145`), CI puis CD verts, production sur l'image
  `sha-98a9145`, conteneur healthy, aucune erreur journald. SP-621 à SP-624
  passés en Terminé

Reste ouvert :

- GitGuardian a signalé le mot de passe fictif `ValidP@ss123` d'un test
  (incident 26702661) : faux positif à marquer sur le dashboard. L'application
  GitHub de GitGuardian ne lit pas `.gitguardian.yaml`
- Relire le motif de la prochaine suppression de compte, désormais recueilli
- L'export Excel compte toujours les heures sans pause
