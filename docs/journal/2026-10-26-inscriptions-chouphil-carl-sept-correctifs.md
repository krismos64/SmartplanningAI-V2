# 26 octobre 2026, deux inscriptions analysées et sept correctifs, du brouillon invisible au formulaire tronqué à 100 employés

| Champ              | Valeur                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-611 à SP-617, créés dans la session à partir de l'analyse des inscriptions sarl chouphil (20/10) et Patisserie CARL (22/10)                                                                                                                                                                                                                                                                                                                                         |
| Documents produits | `src/lib/utils/employee-deactivation.ts`, `team-prefill.ts`, `weekly-hours.ts`, `grid-order.ts`, `opening-days.ts` et leurs tests ; `src/components/schedules/useWeeklyHoursCheck.ts` et son test ; `DraftsBanner.tsx`, `OpeningDaysSuggestion.tsx` ; tests d'actions `employees-deactivation`, `schedules-publish`, `auth.config.subscription-refresh` ; specs E2E `brouillons-publication`, `jours-ouverture-proposes`, `creer-employe-depuis-equipe` ; cette entrée |
| Documents modifiés | `employees.ts`, `schedules.ts`, `auth.config.ts`, `validations/employee.ts`, `validations/schedule.ts`, `ShiftModal.tsx`, `useShiftFormData.ts`, `WeeklyGridView.tsx`, `SchedulesPageContent.tsx`, `TeamMembersManager.tsx`, `EmployeeForm.tsx`, `columns.tsx`, `EmployeesDataTable.tsx`, page `employees/new`, `playwright.ci.config.ts`, trois specs E2E existants                                                                                                   |
| Contrôles          | type-check propre, lint sans erreur, Vitest 3497/3497 sur 219 fichiers, couverture 53,42 % des lignes et 76,29 % des branches, whitelist E2E de la CI sur build de production 142 réussis, 1 ignoré, 0 échec, deux passages consécutifs                                                                                                                                                                                                                                |
| Jira               | SP-611 à SP-617 créés, commentés critère par critère                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Mémoire            | `inscriptions-chouphil-carl-octobre` créée, `un-jeu-de-donnees-qui-ne-peut-pas-faire-echouer-le-test` complétée                                                                                                                                                                                                                                                                                                                                                        |

## Ce qui a été fait

Deux inscriptions depuis Trasco, chacune sur une seule session, aucune revenue
depuis. Base, `audit_logs`, Nginx puis journald, dans cet ordre.

**sarl chouphil** a désactivé la fiche employé de son propre dirigeant, et
l'email « compte désactivé » est parti dans la seconde vers sa propre adresse
(SP-611). Il a aussi renommé ses cinq employés « A » à « E » pour ordonner la
grille (SP-616). **Patisserie CARL**, arrivée par ChatGPT sur iPhone, a planifié
deux vendeuses un mois en brouillon, à 50 h par semaine pour un contrat de 35 h,
samedi et dimanche compris avec des jours d'ouverture restés à lundi-vendredi
(SP-614, SP-615, SP-617). Les deux dirigeants ont buté sur la page membres
d'une équipe neuve, qui leur affirmait « Tous les employés sont déjà dans une
équipe » alors qu'ils n'en avaient aucun (SP-613).

journald portait 310 lignes `prisma:error ... edge runtime` pour la seule
session du 20/10 et 102 pour celle du 22/10 : le rafraîchissement d'abonnement
SP-440 tentait Prisma dans le middleware (SP-612). Corrigé par
`process.env.NEXT_RUNTIME !== 'edge'`. Vérifié dans le bundle construit : le
bloc a disparu du middleware, il ne reste aucun import de Prisma ni le message
d'erreur.

Deux défauts trouvés en codant, corrigés dans la foulée :

- `createSchedule` prévenait les employés pour un brouillon, alors qu'un
  employé ne voit que les créneaux CONFIRMED. La notification part désormais à
  la publication (`publishDraftSchedules`)
- le formulaire de créneau ne chargeait que 100 employés. Le tri SP-616 a mis
  en tête de grille Damien Blanc, 108e sur 113 chez TechCorp : sa case ne
  présélectionnait personne. Mesuré en base locale, corrigé par
  `getEmployeesForSelect`

Chaque garde a été prouvée par mutation, douze mutations au total, toutes
attrapées après correction.

## Les écarts

La mutation de SP-616 « sans équipe en premier » laissait le test vert : avec
trois éléments, `Array.sort` retombait sur le bon ordre malgré un comparateur
incohérent. J'avais commité avant de lire le résultat. Test ajouté sur le
signe du comparateur dans les deux sens, commit local corrigé avant tout push.

La première whitelist E2E a échoué sur deux specs. L'un était le défaut des
100 employés ci-dessus, l'autre un `waitFor` strict sur `new-shift-button` :
en build de production, le streaming fait coexister un instant deux copies du
bouton. Cause déjà notée en mémoire pour `schedules-page`, elle touchait aussi
deux specs existants, passés jusque-là par chance de timing. `.first()` partout.

Choix de l'utilisateur : la fiche désactivée du dirigeant de chouphil n'est
pas réactivée en base, il pourra le faire lui-même une fois SP-611 déployé.

## Prochaine étape

- Pousser, PR, CI verte, merge et déploiement
- Après déploiement : zéro ligne `edge runtime` sur une session de plus de
  5 minutes dans journald (critère de SP-612)
- **Relancer Patisserie CARL avant le 30 octobre**, premier créneau de son
  planning en brouillon. Essais : chouphil jusqu'au 10/11, CARL au 12/11
- Ouverts sans ticket : deux `createSchedule` simultanés créent deux créneaux
  identiques (vu en base locale, la vérification de chevauchement n'est pas
  transactionnelle) ; le combobox « Équipe » du formulaire employé n'a pas de
  nom accessible ; l'environnement de développement envoie par le vrai SMTP,
  et les E2E locaux de cette session ont pu écrire aux adresses du seed
