# 30 septembre 2026, une inscription analysée, des emails datés de la veille et des notifications jamais créées

| Champ | Valeur |
|---|---|
| Ticket | SP-603, SP-604, SP-605, ouverts à l'analyse de l'inscription du 28 septembre |
| Documents produits | `src/lib/utils/schedule-date.ts`, `src/components/auth/RegisterCheckEmail.tsx`, deux fichiers de tests |
| Documents modifiés | `notifications.ts`, `schedules.ts`, `schedule-notification.ts`, `RegisterForm.tsx`, `e2e/specs/auth.spec.ts`, deux fichiers de tests |
| Contrôles | type-check vert, Vitest 3372/3372, E2E `auth.spec.ts` 21/21 et `landing/` 26/26, couverture 53,15 % lignes et 75,67 % branches, axe-core sans violation sur le nouvel écran |
| Jira | SP-603, SP-604, SP-605 créés et commentés |
| Mémoire | `inscription-promo-service-diffusion-28-septembre.md` |

## Ce qui a été fait

SARL PROMO SERVICE DIFFUSION s'est inscrite le 28 septembre à 15:30 UTC. Même
méthode que pour bureau vallee : base, `audit_logs`, logs Nginx de l'IP, puis
logs applicatifs. En seize minutes, la dirigeante a créé une équipe, invité un
employé qui n'a jamais activé son compte, et posé cinq créneaux. Trois défauts
en sont sortis.

**SP-603.** Un clic dans la grille stocke `startDate` à minuit Paris, soit 22:00
UTC la veille. La saisie groupée stocke 00:00 UTC. Mesure : 977 lignes à 00:00,
16 à 22:00. Le conteneur tourne en UTC, donc `format()` de date-fns rendait la
veille : relevé dans le conteneur, `2026-10-03T22:00Z` donnait « samedi
3 octobre » pour un créneau du dimanche 4. L'employé a reçu cinq emails, tous
décalés d'un jour. Les dates de créneau formatées côté serveur passent
maintenant par `schedule-date.ts`, à fuseau `Europe/Paris` explicite. Les
14 entreprises en base sont en `Europe/Paris`, d'où le choix d'un défaut
plutôt que de propager `companies.timezone` par six appelants.

**SP-604.** `createPlanningNotification` passait `schedule.startTime`
(« 10:00 ») à `formatDate`, qui levait `RangeError`. Les 27 notifications
PLANNING en base viennent toutes du chemin groupé : le chemin unitaire n'en a
jamais produit une seule, depuis février. Les mocks donnaient à `startTime`
une `Date`, forme que la base n'a jamais eue, ce qui explique qu'aucun test ne
l'ait vu. `deleteScheduleGroup` avait un second défaut : il appelait la
fonction après le `deleteMany`, sans données, et le `findUnique` ne trouvait
plus rien.

**SP-605.** Depuis SP-526, l'auto-connexion après inscription échoue toujours,
et le formulaire affichait « Connectez-vous pour continuer ». Il affiche
maintenant un écran qui nomme l'adresse, dit de cliquer le lien, et permet le
renvoi. La dirigeante avait fait trois tentatives de connexion en trente
secondes avant d'aller chercher l'email.

## Les écarts

Le `RangeError` de SP-604 masquait un doublon. `createPlanningNotification`
envoie son email, et création, modification et suppression envoient aussi
celui de SP-480. Corriger la date seule aurait fait partir deux emails par
créneau. Le chemin groupé, lui, les envoyait déjà en double à chaque création
de plusieurs créneaux. Les trois appelants dotés d'un email SP-480 passent
désormais `skipEmail`. Les trois autres (suppression d'un groupe, suppression
et modification de récurrence) gardent l'email de la notification, leur seul.

La revue avant PR a trouvé un défaut de plus. `deleteScheduleGroup` et
`deleteRecurrenceGroup` suppriment plusieurs créneaux mais n'envoyaient
qu'une notification unitaire, datée du premier. Invisible tant que le
`RangeError` coupait tout, ce message serait apparu avec le correctif : un
employé aurait lu « Votre planning du 28/09/2026 a été supprimé » pour une
récurrence de dix semaines. Les deux chemins passent par la notification
groupée, qui annonce la plage complète.

Le renvoi de vérification invalide le lien précédent, un seul jeton restant
actif. Le toast le dit, sinon l'utilisateur cliquerait le premier email et
tomberait sur « lien invalide ».

Premier essai de capture mobile en échec : l'inscription attend l'envoi de
l'email, et le relais rejette `example.com` trois fois avant d'abandonner, ce
qui dépasse cinq secondes. Sans rapport avec l'écran. Constat en passant :
l'environnement de développement envoie par le vrai SMTP.

## Prochaine étape

- Question restée ouverte : le créneau du dimanche 4 octobre était-il voulu ?
  Il a été posé juste après le passage aux sept jours, puis la dirigeante a
  réinitialisé les paramètres. À trancher au navigateur sur la grille.
- La double convention de stockage (00:00 contre 22:00 UTC) reste en base.
  Tout nouveau formatage serveur d'une date de créneau doit passer par
  `schedule-date.ts`.
- `resendVerificationEmailAction` n'a aucune limitation de débit.
- Push et PR groupés en fin de sprint, branche
  `fix/inscription-28-septembre-sp603-605`.
