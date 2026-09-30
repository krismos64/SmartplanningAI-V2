# 30 septembre 2026, une inscription analysée, des emails datés de la veille et des notifications jamais créées

| Champ | Valeur |
|---|---|
| Ticket | SP-603, SP-604, SP-605, ouverts à l'analyse de l'inscription du 28 septembre |
| Documents produits | `src/lib/utils/schedule-date.ts`, `src/components/auth/RegisterCheckEmail.tsx`, deux fichiers de tests |
| Documents modifiés | `notifications.ts`, `schedules.ts`, `schedule-notification.ts`, `RegisterForm.tsx`, `e2e/specs/auth.spec.ts`, deux fichiers de tests |
| Contrôles | type-check vert, Vitest 3372/3372, E2E `auth.spec.ts` 21/21 et `landing/` 26/26, couverture 53,15 % lignes et 75,67 % branches, axe-core sans violation sur le nouvel écran |
| Jira | SP-603, SP-604, SP-605 créés, commentés et clos après déploiement. SP-606 ouvert à l'audit de fin de session |
| Mémoire | `inscription-promo-service-diffusion-28-septembre.md` créée, `lint-erreurs-noyees-en-fin-de-sortie.md` complétée |

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

## Livraison

PR #107, mergée en squash (`06f62ea`). Le premier run CI a rougi au lint sur
quatre erreurs `no-unsafe-assignment` dans les nouveaux tests : `expect.any()`,
`expect.stringContaining()` et un `vi.fn()` non typé. J'avais lancé `npx eslint`
à la main, qui ne charge pas les règles typées de `next lint`, et filtré sur le
mauvais motif. Assertions réécrites sur les appels typés, mutations rejouées,
second run vert : lint, unitaires, 127 E2E critiques, build. CD vert, image
`sha-06f62ea` en production, conteneur sain, aucune erreur au démarrage.

## Audit de fin de session

Contrôles rejoués selon la méthode du 13 septembre, par la mesure :

- README : cinq compteurs faux. Pages 65 pour 66, tests 201 fichiers et
  3327 tests pour 206 et 3372, E2E 23 specs et 261 tests pour 25 et 269,
  whitelist CI 9 specs et 129 tests pour 11 et 137. Et « 207 composants »,
  qu'aucune méthode ne retrouve, pas même au commit qui l'a posé : 187 fichiers
  `.tsx` hors tests
- `deployment.md`, `database-architecture.md` et `analytics.md` affichaient
  une mise à jour au 10 ou 11 septembre, pour un dernier changement de fond le 13
- Les six hooks exécutés, blocage des secrets compris avec son test négatif :
  tous conformes. Aucune commande npm inexistante, aucun chemin mort hors trois
  négations volontaires de `nextjs-architect`, aucune entrée morte dans la
  whitelist, les neuf scripts ops documentés
- Leçons du jour portées là où elles seront relues : deux pièges dans
  `prisma-pieges.md` (date serveur en UTC, exception avalée), forme des mocks et
  lint typé dans `tests.md`, rappel dans `test-writer` et `revue-pre-pr`
- SP-606 ouvert : le renvoi de l'email de vérification n'a aucune limite, et
  Nginx ne couvre les Server Actions de `/login` et `/register` que par la zone
  `general`, 10 requêtes par seconde et par IP

## Prochaine étape

- Preuve en production à relever. Au prochain créneau posé par un client, une
  notification PLANNING unitaire en base et aucun `RangeError` dans les logs. À
  la prochaine inscription, plus de série de `POST /login` avant le
  `GET /verify-email` dans les logs Nginx
- Question restée ouverte : le créneau du dimanche 4 octobre était-il voulu ?
  Il a été posé juste après le passage aux sept jours, puis la dirigeante a
  réinitialisé les paramètres. À trancher au navigateur sur la grille.
- La double convention de stockage (00:00 contre 22:00 UTC) reste en base.
  Tout nouveau formatage serveur d'une date de créneau doit passer par
  `schedule-date.ts`.
- SP-606, limiter le renvoi de l'email de vérification.
- L'environnement de développement envoie par le vrai SMTP : les inscriptions
  de test y partent réellement, refusées ici parce qu'elles visaient
  `example.com`.
