# 9 septembre 2026, deux défauts qui n'en faisaient qu'un

| Champ | Valeur |
|---|---|
| Ticket | SP-584 |
| Documents produits | ce journal, `src/components/schedules/__tests__/WeeklyGridView.test.tsx` |
| Documents modifiés | `WeeklyGridView.tsx`, `ScheduleCalendar.tsx`, `SchedulesPageContent.tsx` |
| Contrôles | type-check vert, lint sans erreur, 3280 tests Vitest verts sur 197 fichiers, mesure au navigateur avant et après, deux mutations |
| Jira | SP-584 créé et commenté |
| Mémoire | fiche `ou-en-est-le-projet` réécrite, fiche `un-composant-qui-duplique-l-etat-du-parent` créée |
| Pull request | #86 |

## Ce qui a été fait

Session ouverte sur les deux points laissés ouverts par SP-581 et SP-582 : le
doublon d'appels à `getTeamAbsences`, et la navigation entre semaines qui ne
répondait pas toujours au premier clic.

Les tickets les décrivaient comme deux sujets distincts. Ils ont la même
racine : `WeeklyGridView` dupliquait deux états que `SchedulesPageContent`
tenait déjà, les congés et la semaine affichée.

### Le doublon

Le parent charge les congés dans `leaveRequests`, la grille les rechargeait de
son côté dans un effet.

SP-582 demandait de vérifier avant de trancher que la grille n'avait pas besoin
d'une fenêtre temporelle différente. Vérification faite : en vue semaine, le
`dateRange` du parent vaut `startOfWeek/endOfWeek` de `safeDate`, exactement le
`weekStart/weekEnd` de la grille. Rien à préserver.

**Ce que SP-582 n'avait pas vu**, et qui rendait le correctif plus simple que
prévu : le parent passait déjà `leaveRequests` à `ScheduleCalendar`. Mais
celui-ci ne la transmettait pas à `WeeklyGridView`, dont les props ne la
déclaraient même pas. La donnée arrivait à la porte de la grille et s'arrêtait
là, sans que rien ne le signale. Une prop passée à un composant qui ne la
déclare pas est ignorée en silence, y compris en TypeScript strict.

### La navigation

La grille tenait la semaine en `useState(currentDate)`, jamais resynchronisé
sur la prop. Deux états de la même semaine cohabitaient et divergeaient dès
qu'une période changeait ailleurs, par les filtres ou un retour depuis la vue
mois. Le premier clic sur une flèche repartait alors de la date du montage : il
rattrapait l'écart au lieu de naviguer, ce qui se voit comme un clic sans effet.

### Le correctif

La grille ne possède plus rien. Les congés arrivent par prop, la semaine dérive
de `currentDate`, la navigation remonte la période au parent en partant de
`weekStart` déjà normalisé au lundi.

`teamIds` n'ayant plus de destinataire, la prop disparaît de la chaîne, avec le
`useMemo` que SP-582 avait posé pour la stabiliser. La source du doublon est
supprimée plutôt que compensée.

### La mesure

`getTeamAbsences` instrumentée temporairement, compte TechCorp, instrumentation
retirée ensuite :

| | Appels par chargement | Équipes distinctes |
|---|---|---|
| Avant | 30 | 15 |
| Après | **15** | 15 |

Exactement un appel par équipe. Le chiffre de 15 a d'abord paru mauvais, jusqu'à
vérifier en base que TechCorp compte 15 équipes et que les 15 identifiants
étaient tous distincts. Le compte de SP-582 n'en avait qu'une seule, d'où
l'écart d'échelle entre les deux mesures : le même défaut donne 2 appels sur un
compte à une équipe et 30 sur un compte à quinze.

## Les écarts

**Ma première mutation ne prouvait rien.** Rétablir le chargement autonome des
congés laissait les quatre tests verts. La mutation utilisait un `import()`
dynamique, que `vi.mock` n'intercepte pas comme l'import statique du code
d'origine. Refaite avec la forme réelle, elle a rougi.

C'est le piège de la preuve par mutation : une mutation qui ne reproduit pas
exactement la forme du défaut valide un contrôle qui ne tient pas.

**Mon mock rendait l'échec illisible.** Il renvoyait `undefined`, donc la
mutation corrigée faisait échouer les quatre tests sur
`Cannot read properties of undefined (reading 'then')` au lieu de l'assertion
visée. Un test qui rougit pour le mauvais motif ne prouve pas davantage qu'un
test vert. Le mock rend maintenant une réponse réaliste, et l'échec porte sur
`expected "spy" to not be called at all, but actually been called 1 times`.

**Mes assertions de dates étaient fausses, pas le code.** Trois tests rouges au
premier essai, avec deux jours d'écart systématique. `startOfWeek` travaille en
heure locale et je comparais par `toISOString()` : minuit à Paris vaut 22h UTC
la veille. Le 22 septembre 2026 est de plus un mardi, donc sa semaine ouvre le
21. J'ai vérifié le comportement réel de `date-fns` dans un script jetable
plutôt que de deviner, et la comparaison est passée en date locale.

**Le serveur servait l'ancien module.** Ma première mesure n'a produit aucune
ligne d'instrumentation alors que les requêtes SQL de `getTeamAbsences`
partaient bien. Le serveur de développement n'avait pas rechargé le module
modifié. Un redémarrage a été nécessaire avant que la mesure veuille dire
quelque chose. Sans le recoupement avec le SQL, j'aurais conclu à tort que zéro
appel partait.

**Deux défauts trouvés au passage, invisibles au code.** Les flèches de
navigation étaient des boutons à icône seule, sans nom accessible : elles
n'existaient pas pour un lecteur d'écran, contraire à WCAG 2.1 AA. Trouvées
parce que mon test cherchait un bouton par son nom et n'en trouvait aucun.

L'en-tête affichait « 7 Sept. Au 13 Sept. 2026 » : un tiret demi-cadratin
visible par l'utilisateur, et un `capitalize` appliqué au titre entier qui
capitalisait aussi le mot de liaison. Vu à la capture d'écran. La lecture du
code ne l'aurait pas donné, `capitalize` sur un `<h3>` paraissant anodin.

C'est la leçon des angles morts de la refonte publique qui se répète sur un
écran privé : parcourir le rendu, pas seulement le diff.

## Prochaine étape

**Aucun spec Playwright ne couvre l'écran plannings.** Seul un Page Object
`e2e/pages/schedules.page.ts` existe, sans spec qui l'utilise. La whitelist CI
n'est donc pas impactée par ce travail, mais l'écran le plus sollicité de
l'application d'après les logs de SP-580 n'a aucune couverture E2E. Les trois
défauts trouvés dessus en deux sessions, SP-581, SP-582 et SP-584, ont tous été
vus au navigateur ou à la mesure, aucun par un test. Mérite son propre ticket.

Reste ouvert par ailleurs : le compose de production de Lune & Soleil, qui
devra publier son port en `127.0.0.1:3002`, et le durcissement `iptables` face
à Docker, écarté tant qu'aucun conteneur n'a besoin d'être joignable de
l'extérieur.

---

# 9 septembre 2026, seconde partie : couvrir l'écran plutôt que le corriger encore

| Champ | Valeur |
|---|---|
| Ticket | SP-585 |
| Documents produits | `e2e/specs/schedules/grid-navigation.spec.ts` |
| Documents modifiés | `e2e/pages/schedules.page.ts`, `playwright.ci.config.ts`, `ScheduleCalendar.test.tsx` |
| Contrôles | type-check vert, lint sans erreur, 3281 tests Vitest sur 197 fichiers, 3 passages E2E en local et 3 sous la config CI, trois mutations |
| Jira | SP-585 créé et commenté |
| Mémoire | 2 fiches créées |
| Pull request | #87 |

## Ce qui a été fait

Suite directe de SP-584 : les trois défauts trouvés sur l'écran plannings en
deux sessions l'avaient tous été au navigateur ou à la mesure, aucun par un
test. L'écran n'avait aucun spec Playwright.

### Le Page Object était mort

Constat fait avant d'écrire quoi que ce soit : **11 des 21 sélecteurs**
pointaient vers des `data-testid` supprimés du code, dont toute la navigation.
C'est probablement pour cela qu'aucun spec ne l'utilisait, chaque tentative
ayant dû échouer au premier clic.

Rien ne le signalait, exactement comme une entrée morte dans la whitelist
`testMatch`. Les sélecteurs passent désormais au rôle et au nom accessible là
où ils existent, ce qui les rend vérifiables au navigateur.

### Six specs, et deux tests retirés

Les specs couvrent ce que les incidents ont révélé : rendu sans error boundary,
changement de vue qui ne casse pas la page, navigation, et deux tests négatifs
d'autorisation.

Deux tests ont été écrits puis **retirés**, la mutation ayant montré qu'ils ne
contrôlaient rien. Le constat est écrit dans le spec à leur place.

### Un maillon que rien ne couvrait

En cherchant à prouver un test par mutation, découverte que le défaut de SP-584
n'était couvert nulle part : `WeeklyGridView.test.tsx` monte la grille
directement, donc il ne voit pas la chaîne `ScheduleCalendar` → `WeeklyGridView`,
et c'est ce maillon qui était coupé.

Un test unitaire a été ajouté sur `ScheduleCalendar`. Sa mutation donne
`expected undefined to be [ ... ]`.

## Les écarts

**J'ai écrit une affirmation fausse dans un commentaire de test.** Le spec E2E
disait que la couverture des congés existait au niveau unitaire. Elle n'existait
pas. Seule la mutation l'a montré, et c'est ce qui a conduit au test ajouté
ci-dessus. Un commentaire qui documente une couverture inexistante est pire que
pas de commentaire.

**Le défaut de navigation de SP-584 n'est pas reproductible en E2E.** Deux
mutations le prouvent, dont la première était de plus incomplète : j'avais figé
`weekDate` sans rétablir le `setWeekDate` que la navigation appelait. Refaite
fidèlement, elle laisse les tests verts quand même. L'état local et la prop ne
divergent jamais, le seul chemin qui change la période sans démonter la grille
étant la navigation de la grille elle-même.

**Trois causes d'instabilité, aucune résolue par un retry.** Les premiers
passages donnaient 3 flaky sur 8. La compilation initiale sous charge, un
locator strict qui résout à deux éléments en mode production seulement, et une
assertion `not.toHaveText` satisfaite par l'absence de l'élément. Les trois se
lisent dans `error-context.md` : le snapshot d'échec ne contenait que 12
éléments, ce qui disait immédiatement que la page n'était pas rendue.

**Le mode production révèle ce que le développement cache.** Le doublon de
`schedules-page` ne se voit qu'avec `npm run start`. Lancer au moins une fois
sous `playwright.ci.config.ts` avant de conclure.

## Prochaine étape

Le spec entre dans la whitelist CI, 9 entrées, aucune morte. Reste ouvert le
compose de production de Lune & Soleil et le durcissement `iptables`, tous deux
inchangés depuis SP-583.

---

# 9 septembre 2026, troisième partie : la documentation prise en défaut, puis un filet sur les ports

| Champ | Valeur |
|---|---|
| Ticket | SP-586, SP-587 |
| Documents produits | `scripts/ops/check-public-ports.sh`, `scripts/ops/smartplanning-ports-check.cron` |
| Documents modifiés | `README.md`, `CLAUDE.md`, `docs/deployment.md`, `docs/database-architecture.md`, `docs/analytics.md`, `scripts/ops/README.md`, 4 agents, `seo-content.md` |
| Contrôles | CI verte sur SP-586 (run 34328307270), script SP-587 prouvé par mutation sur le VPS |
| Jira | SP-586 créé et clos, SP-587 créé |
| Mémoire | fiche d'état réécrite, `tableau-recree-a-chaque-rendu` corrigée |
| Production | cron installé et actif sur le VPS |
| Pull request | #88 mergée, #89 ouverte |

## Ce qui a été fait

### L'audit de la documentation (SP-586)

Demande de vérifier que README, `CLAUDE.md`, agents, skills, hooks, journal,
mémoire, `docs/` et Jira étaient à jour. Méthode retenue : confronter chaque
affirmation chiffrée ou pointant vers un chemin au dépôt **par une commande**,
jamais la relire. C'est ce qui a fait la différence, la plupart des défauts
étant invisibles à la lecture.

**Le plus grave était dans un agent.** `nextjs-architect` décrivait une colonne
d'isolation `tenantId`. Mesure : zéro occurrence dans `schema.prisma`, contre 53
`companyId`. Plus trois répertoires inexistants et un `lib/env.ts` fantôme. Un
agent invoqué sur cette base écrivait un filtre d'isolation sur une colonne qui
n'existe pas, sur la classe de défaut la plus grave du projet.

**Le README empêchait d'installer le projet.** `docker-compose up -d` échoue, il
n'y a aucun compose à la racine, et les trois ports comme les identifiants
Adminer étaient faux.

**Deux documents disaient l'inverse du réel.** `deployment.md` donnait les ports
en publication nue alors que SP-583 les avait passés sur la boucle locale la
veille : un lecteur en aurait conclu que la faille était toujours ouverte. Et il
annonçait un CI déclenché sur toutes les branches, alors qu'il ne l'est que sur
`main`.

Tous les compteurs remesurés. Le tableau des tests du README était déjà périmé
par SP-585, livré la veille.

### Le filet sur les ports (SP-587)

Question posée sur les deux points laissés ouverts par SP-583. Vérification
faite sur le VPS plutôt que paraphrase du journal, et **l'un des deux n'était
plus ouvert** : Lune & Soleil a été déployé depuis, et publie correctement son
port en `127.0.0.1:3002`. La leçon avait été appliquée au second projet sans
que le garde-fou existe.

Restait le durcissement `iptables`. La règle `DOCKER-USER` a été écrite,
montrée, puis **écartée après mesure** : `iptables-persistent` n'est pas
installé, donc la règle disparaîtrait au premier redémarrage sans bruit, et deux
des trois ponts Docker portent des noms générés qu'un réseau recréé change. Deux
modes de panne silencieuse ajoutés pour se prémunir d'un défaut dont la
fermeture est vérifiée.

Un cron de surveillance a été livré à la place. Il détecte au lieu de prévenir,
ce qui suffit sur une machine administrée seul dont la surface publique se
limite à trois ports.

## Les écarts

**J'ai relayé deux points ouverts sans les vérifier.** « Lune & Soleil et le
durcissement iptables, inchangés depuis SP-583 » : la première moitié était
fausse depuis le déploiement de la boutique. Recopier une liste de points
ouverts sans la confronter à l'état réel, c'est exactement le défaut que
l'audit du même jour venait de corriger dans la documentation.

**Le point de conception du script n'était pas celui attendu.** Le premier
réflexe était qu'un cron sur le VPS ne pouvait rien prouver, la règle de SP-583
disant que `curl localhost` répond toujours. Mesure faite, viser l'adresse
publique **depuis le VPS lui-même** discrimine correctement : `injoignable` sur
`51.77.146.72:3000` là où `127.0.0.1:3000` répond 200. Aucune machine tierce
n'était nécessaire.

**Ma première recherche du cron TLS a conclu à tort qu'il n'était pas
installé.** Je cherchais dans la crontab root et dans `/var/www`, il vit dans
`/etc/cron.d/` et `/opt/smartplanning/ops/`. Vérifier à plusieurs endroits avant
de conclure à une absence.

## Prochaine étape

Les essais en cours n'ont toujours pas été regardés en base depuis le 26 août,
alors que les convertir reste le premier objectif post-CDA.

L'epic SP-342 « Chatbot IA Mistral » et ses deux sous-tickets dorment depuis
sept mois, sans une ligne de code ni de documentation. À fermer ou à assumer
comme backlog, c'est une décision produit.

Le durcissement `iptables` reste ouvert, désormais assumé par écrit plutôt que
simplement reporté.
