# 1er octobre 2026, une inscription qui ne prouve qu'un correctif sur trois, des logs qui disparaissaient à chaque déploiement et une page Employés trop large sur iPhone

| Champ              | Valeur                                                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-607 et SP-608, ouverts à l'analyse de l'inscription Trasco du 30 septembre                                                                                                                               |
| Documents produits | cette entrée                                                                                                                                                                                                |
| Documents modifiés | `docker/docker-compose.prod.yml`, `docs/deployment.md`, `.claude/rules/prisma-pieges.md`, `EmployeesDataTable.tsx`, `DashboardLayout.tsx`, `e2e/specs/crud/employees.spec.ts`                               |
| Contrôles          | Vitest 3372/3372, `test-cd-rollback.sh` vert, CI de la PR #109 et de `main` vertes, CD vert. SP-608 : type-check, lint sans erreur, `crud/employees.spec.ts` 20/20, deux tests mobiles prouvés par mutation |
| Jira               | SP-607 créé et commenté, laissé ouvert jusqu'au critère 2. SP-608 créé                                                                                                                                      |
| Mémoire            | `inscription-trasco-30-septembre.md` créée, `lire-les-logs-du-vps.md` corrigée sur les `_rsc`                                                                                                               |

## Ce qui a été fait

Trasco s'est inscrite le 30 septembre à 18:49 UTC, 9 h après le déploiement de
`sha-06f62ea` (SP-603 à SP-605). Session entière sur iPhone, arrivée par
`/solutions/planning-restaurant?utm_source=chatgpt.com` : deuxième conversion
tracée depuis ChatGPT, sur la même page que Sunlight.

En cinq minutes, le dirigeant a vérifié son email, créé une équipe, posé un
créneau unique et une récurrence jeudi et vendredi sur quatre semaines, tous
pour lui-même. Il a ouvert la page Employés sans inviter personne, puis la page
Congés. Le lendemain à 05:41 UTC, il est revenu depuis un contexte iOS sans
cookie de session (User-Agent sans `Version/… Safari`), a atterri sur `/login`
et il est reparti.

**SP-605 est prouvé** : `POST /register`, lien de vérification 22 s après, puis
un seul `POST /login` 27 s plus tard. La dirigeante du 28 septembre avait fait
trois tentatives avant d'aller chercher l'email.

**SP-604 et SP-603 ne le sont pas.** Zéro notification en base, mais
`create*PlanningNotification` saute volontairement l'auteur. Et aucun créneau
n'est stocké à 22:00 UTC, l'ancien code aurait donc rendu les mêmes dates.

**SP-607.** Les logs applicatifs de la soirée étaient introuvables : le CD avait
recréé le conteneur à 09:40, et le driver `json-file` efface les logs avec lui.
Preuve préalable sur le VPS, conteneur jetable en journald : après `docker rm`,
`docker logs` ne trouve plus rien et `journalctl` restitue les lignes, stderr en
priorité 3. Volume mesuré : 765 octets de logs applicatifs en 7 h, journald à
2,4 Go depuis le 20 mai sous un plafond de 4 Go. Le service `app` écrit
désormais dans journald. PR #109, squash `233e7dd`, image `sha-233e7dd` en
production, `LogConfig` vérifié à `journald`, démarrage du conteneur lisible
par `journalctl`.

**SP-608.** En rejouant la session, j'avais exclu les requêtes `_rsc`, prises
pour du préchargement. Les navigations côté client y passent aussi : relue sans
ce filtre, la session montre l'ouverture de `/employees/new` à 19:00:31 et un
retour à la liste 3 s après. En émulation iPhone 13, le formulaire est sain. La
liste, elle, mesurait 535 px pour 390 : le bouton desktop « Nouvel employé »
n'était plus masqué depuis `cd4be4b` (18 mars), qui avait retiré son enveloppe
`hidden sm:block` en gardant le commentaire « masqué sur mobile ». Sur 14 écrans
mesurés, 12 tenaient dans 390 px. Correctif : bouton masqué sous `sm`, le FAB
le remplace, et `min-w-0` sur la colonne principale du layout. Deux tests E2E
mobiles. Le premier mesurait `scrollWidth` et restait vert sous mutation, le
`min-w-0` rognant le bouton sans élargir la page : il mesure désormais les
boutons eux-mêmes.

## Les écarts

Deux constats sans ticket, sortis de l'analyse :

- Le bouton « Nouveau créneau » initialise `startDate` avec `new Date()`
  (`ShiftModal.tsx:244`), d'où un créneau stocké à 18:51:45 UTC. La base porte
  donc trois conventions (00:00, 22:00 et heure courante), pas deux
- L'email de planning SP-480 n'exclut pas l'auteur, contrairement à la
  notification in-app. Le dirigeant a probablement reçu des emails pour ses
  propres créneaux : clic sans referer sur `/app/dashboard/schedules` à
  18:59:56, puis une IP Google sur la même URL 6 s après. Invérifiable, le
  relais SMTP est externe et `email_logs` ne trace pas ces envois

Le formateur a réaligné les tableaux de `deployment.md` et le healthcheck
Postgres du compose : 191 lignes au diff, 55 sans les espaces.

Le push a été fait hors fin de sprint, par choix : chaque déploiement sans ce
correctif effaçait les logs de la veille.

## Prochaine étape

- SP-607, critère 2 : au prochain déploiement, vérifier que
  `journalctl CONTAINER_NAME=smartplanning-app` montre les deux conteneurs
- Preuve de SP-604 : attendre un créneau posé pour un employé autre que
  l'auteur, désormais vérifiable par `journalctl -p err`
- Paramètres déborde encore de 23 px sur mobile, cause non trouvée
- Sur mobile, en-tête et footer fixes prennent 120 px sur 664, et le FAB
  recouvre le lien « Contact »
- Décider si l'email SP-480 doit exclure l'auteur
- SP-606, limiter le renvoi de l'email de vérification
