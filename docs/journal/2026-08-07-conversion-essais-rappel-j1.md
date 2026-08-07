# 7 août 2026, le rappel d'essai J-1 n'était jamais parti

| Champ | Valeur |
|---|---|
| Ticket | SP-558, SP-559, SP-560, SP-561, tous clos |
| Documents produits | `src/scripts/backfill-missing-subscriptions.sql`, `docs/runbooks/rotation-cron-secret.md`, tests de `trial-ending-soon` |
| Documents modifiés | `trial-ending-soon.ts`, `billing/types.ts`, `validations/email-logs.ts`, `subscription-guard.ts`, `BillingPageContent.tsx`, tests du guard |
| Contrôles | `npm run test` 3074 tests sur 179 fichiers, `npm run type-check` sans sortie, lint propre sur les fichiers touchés, 3 mutations vérifiées |
| Jira | 4 tickets créés, SP-558 à SP-561 |
| Mémoire | à réécrire en fin de session |

Deuxième session consécutive sans code applicatif prévu au départ : l'intention
était de vérifier ce qui existait déjà sur la conversion des essais. La
vérification a trouvé trois défauts, dont un qui annulait un levier commercial
entier depuis la mise en production.

## Tout était construit, et une partie ne servait à rien

L'historique GitHub confirme que la mécanique de conversion est complète :
SP-370 (cron J-14/J-7/J-3/J-1), SP-441 (bannières progressives), SP-473 (widget
trials à risque), SP-440 (guard d'abonnement), SP-536 et SP-538 (backfill et
webhook `trial_will_end`). Tous ces tickets sont clos à juste titre. Le cron
tourne quotidiennement depuis février, zéro échec sur environ 180 exécutions.

La table `email_logs` de production raconte autre chose. Sur 17 emails d'essai
envoyés : 4 rappels J-14, 4 J-7, 5 J-3, 4 expirations, et **zéro J-1**.

`getTrialReminderType` mappait tout `daysRemaining <= 3` sur
`TRIAL_REMINDER_3`. Le type `TRIAL_REMINDER_1` n'existait pas dans l'enum. À
J-1, le code recalculait donc `TRIAL_REMINDER_3`, et l'idempotence sur
`(subscriptionId, emailType)` sautait l'envoi puisque le J-3 était déjà parti.
Ce sont les compteurs `skipped` du log qui l'attestaient sans que personne ne
les lise.

Le reste de la chaîne était prêt : le cron sélectionnait bien J-1, et le
template gérait déjà le cas avec un `isLastDay` et le sujet « Dernier jour
d'essai gratuit ! ». Ce contenu n'a jamais atteint un destinataire. Un test de
mutation le montre bien : en cassant volontairement le correctif, le test du
sujet reste vert alors que celui du type rougit.

Aucun test ne couvrait ce mapping, ce qui explique que le défaut ait survécu à
la soutenance et à cinq mois de production.

## Le mauvais message au pire moment

Le même examen a révélé un second défaut, sur l'écran vu au moment précis de la
décision d'achat.

Le guard renvoyait `subscription_expired` pour tout statut `EXPIRED`. Or le
correctif d'août fait basculer les essais échus de `TRIAL` à `EXPIRED`. Dès le
lendemain de la fin d'essai, un directeur qui n'a jamais souscrit lisait donc
« Votre abonnement a expiré. Renouvelez-le pour continuer », dans une alerte
rouge par ailleurs réservée aux incidents de paiement.

Le bon message existait pourtant, sous la clé `trial_expired`, mais n'était
atteignable que tant que le statut valait encore `TRIAL`, soit quelques heures.

`trialEndsAt` sépare les deux cas sans requête ni champ JWT supplémentaire : il
reste renseigné pour un essai, vide pour un abonnement réel. Le message d'essai
rappelle maintenant que les données sont conservées et indique le prix.

## Une entreprise invisible depuis deux mois

`sofreba`, inscrite le 22 mai, n'avait aucune ligne `Subscription`. Inscrite
avant le correctif d'inscription de juillet, et essai déjà échu au moment du
backfill SP-536 du 3 juillet dont le filtre ne portait que sur les essais en
cours, elle est passée entre les deux filets.

Sans cette ligne, elle était absente du cron, du widget trials à risque et de la
page Abonnements cross-tenant. Elle n'a reçu aucun email, ce que confirme son
compteur à 0 dans `email_logs`.

Backfill exécuté en production : mesure préalable à 1 ligne, `INSERT 0 1`
conforme, contrôle final à 0 entreprise sans `Subscription`. Statut `EXPIRED`
posé, donc le cron l'ignore et aucun email de rattrapage ne part pour un essai
terminé depuis juin.

## Ce que disent les chiffres sur la conversion

8 entreprises inscrites, 1 seule `ACTIVE`. Cette dernière, Distri Shop, porte un
`stripeCustomerId` mais aucun paiement et aucun `stripeSubscriptionId` : c'est
le compte de démonstration de la soutenance, pas un client. Le constat de 0
client payant reste donc exact.

Deux comptes méritent attention : Beynost Evasion (10 employés, 513 plannings
créés) et Bassin à Bloc (43 plannings). Ce sont des utilisateurs qui ont
réellement adopté le produit puis n'ont pas converti. Ni l'un ni l'autre n'a
reçu de relance entre J-3 et l'email d'expiration, et tous deux ont vu le
message d'abonnement expiré alors qu'ils n'avaient jamais souscrit.

## Les écarts

Le `CRON_SECRET` était écrit en clair dans la crontab de l'utilisateur `deploy`,
donc visible par `crontab -l`, dans les sauvegardes de `/var/spool/cron/` et
dans `ps` pendant l'exécution de `curl`. Il s'est affiché dans la session de
diagnostic, ce qui le rendait compromis.

La rotation a d'abord été préparée en runbook plutôt qu'exécutée, le secret ne
devant pas transiter par une session d'assistant. Christophe a ensuite autorisé
explicitement l'exécution, faite en fin de session sans jamais afficher la
valeur. Le secret vit maintenant dans `/etc/smartplanning/cron.env` en 600, et
la crontab le source au lieu de le porter.

La preuve tient à un détail de séquencement : l'ancien secret a été capturé et
vérifié fonctionnel (200) **avant** le redémarrage du conteneur. Sans ce témoin,
un 401 après rotation ne prouverait rien, il pourrait venir d'une erreur de
copie. Après redémarrage, ancien 401, nouveau 200, sans secret 401.

Réserve assumée : la ligne de commande de `curl` reste visible dans `ps` pendant
l'appel, environ deux secondes par jour. La machine n'ayant qu'un utilisateur
non privilégié, le passage du header par l'entrée standard n'a pas été fait.

`docs/analytics.credentials.md` documentait l'endpoint du cron en `GET` alors que
la route n'expose que `POST`. Sans conséquence, la crontab utilisant bien
`-X POST`. Le fichier est bloqué en lecture par le hook `PreToolUse` à cause du
`.credentials.` de son nom, protection qui fonctionne comme prévu. Christophe l'a
corrigé à la main. Aucun commit n'était nécessaire : ce fichier est gitignoré
(`.gitignore:134`, motif `docs/*.credentials.md`) et n'a jamais été suivi.

La whitelist `testMatch` de `playwright.ci.config.ts` ne contient aucun spec
billing. Les changements de cette session ne sont donc couverts en CI que par
les tests unitaires. Élargir la whitelist allonge chaque exécution, l'arbitrage
n'a pas été pris seul.

## Prochaine étape

Rien n'est en cours, les quatre tickets de la session sont clos et déployés.

Sur la conversion, le levier suivant est la relance après expiration : rien ne
part aujourd'hui une fois l'essai terminé, alors que les données restent
conservées et que l'utilisateur peut revenir. Un second levier serait de
mesurer, plutôt que supposer, où les essais décrochent, aucune instrumentation
ne distinguant pour l'instant un compte actif d'un compte dormant.
