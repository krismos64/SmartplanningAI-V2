# 8 septembre 2026, une désinscription qui révèle trois défauts sans rapport

| Champ | Valeur |
|---|---|
| Ticket | SP-580 (deux lots), SP-581 |
| Documents produits | ce journal, `src/lib/audit-author.ts`, migration `20260908085434_sp580_audit_log_survit_a_son_auteur`, `events-service-plugin-contract.test.ts` |
| Documents modifiés | `docker-compose.prod.yml`, `Dockerfile`, `cd.yml`, `schema.prisma`, `profile.ts`, `audit.service.ts`, `audit-logs.ts`, `types/audit.ts`, trois écrans d'administration, trois fichiers de tests |
| Contrôles | type-check vert, lint sans erreur, 3276 tests Vitest verts sur 196 fichiers, CI complète verte sur la PR #83 (run 34210579843), E2E comprises |
| Jira | SP-580 créé et commenté, SP-581 créé |
| Mémoire | 4 fiches créées, 1 corrigée (`lire-les-logs-du-vps`) |

## Ce qui a été fait

Session ouverte sur une question de Christophe : « hier j'ai eu une inscription
puis un désabonnement, tu peux analyser son parcours ». L'analyse n'a rien
trouvé sur le départ lui-même, et trois défauts sérieux à côté.

### Le parcours mesuré

Entreprise Serra Propreté, arrivée sur l'accueil le 7 septembre à 16h12 UTC,
inscrite à 16h18, compte supprimé à 16h27. Quinze minutes en tout, dont neuf
dans l'application. 566 requêtes depuis une IP unique, aucune erreur 5xx, les
seuls 404 portant sur des routes `_rsc` de prefetch, invisibles pour lui.

L'ordre des faits : inscription à 16h18:26, connexion refusée à 16h18:39 en
`EmailNotVerified` treize secondes plus tard, avant que l'email ait pu être lu,
validation du lien à 16h18:53, connexion réussie à 16h18:58. Puis création
d'une équipe, d'un employé nommé « Test Employé », un passage par les messages,
les paramètres d'apparence et le profil, et la suppression du compte à 16h27:20.

**159 des 566 requêtes portent sur `/app/dashboard/schedules`**, soit plus du
quart, en rafales réparties sur sept minutes. C'est de très loin l'écran le plus
sollicité de la session, et le dernier avant la suppression. Il a donc passé
l'essentiel de son essai sur le planning, pas sur le reste.

Ce que les données ne disent pas : pourquoi il est parti. Rien n'a échoué
techniquement pendant ces neuf minutes. Les rafales sur `schedules` se lisent
aussi bien comme un usage intensif que comme une difficulté à obtenir ce qu'il
cherchait, et le log ne tranche pas. Le dire plutôt que d'inventer une cause
faisait partie de la réponse.

### Ce que la suppression a revélé

Les logs montrent trois `deleteAccount` en onze secondes, les deux premiers en
erreur `P2034`, write conflict or deadlock. L'utilisateur a vu **deux fois
« une erreur est survenue lors de la suppression »** avant que le troisième
essai passe.

`logAuditAction` partait en fire-and-forget juste avant la transaction qui
supprime l'utilisateur. Les deux écritures portaient sur la même ligne,
`audit_logs` référençant `User` par clé étrangère, et Postgres abandonnait la
transaction. Le troisième essai n'a réussi que parce que l'audit avait fini
d'écrire entre-temps, pas parce que le code le garantissait.

Le fire-and-forget reste juste pour Stripe, les emails ou Redis, qui ne
partagent aucune ligne avec la transaction. Ici il créait une course sur la
même clé.

### L'audit ne traçait rien de toute façon

En lisant le schéma pour corriger, la FK portait `onDelete: Cascade` sur un
`userId` NOT NULL. L'audit `DELETE` écrit juste avant la suppression était donc
effacé avec son auteur. Vérification en production : **1517 lignes dans
`audit_logs`, dont zéro action `DELETE` sur `entityType` USER**.

La suppression de compte, l'événement qui justifie le plus une trace, était le
seul du produit à n'en laisser aucune. Le code revendiquait pourtant une
traçabilité RGPD Article 30, en commentaire, depuis SP-444.

Arbitrage soumis à Christophe entre trois options, `SetNull` retenue. La
colonne passe nullable, l'identité reste dans `details` où `deleteAccount`
dépose email, rôle et entreprise. La clé étrangère ne pointe plus vers une
personne supprimée, ce qui sert aussi la minimisation RGPD.

### Le compose de production avait dérivé du dépôt

Défaut sans rapport avec le précédent, trouvé en cherchant l'origine d'une
erreur `ENOENT` sur le cache d'images. Le fichier réellement utilisé est
`/var/www/smartplanning/docker-compose.yml`, absent du dépôt et édité à la
main. Deux `.bak` datés de mars et d'août confirment des éditions successives.

Le CD faisait un `docker compose up` dessus sans jamais le copier depuis le
dépôt. Rien ne pouvait donc corriger la dérive.

## Les écarts

**Un correctif qui paraissait complet et ne l'était pas.** Le diff donnait le
défaut comme évident : le tmpfs était monté sur `/.next/cache` quand Next.js
écrit dans `/app/.next/cache/images`. J'ai corrigé le chemin, puis testé
l'écriture réelle dans un conteneur plutôt que de conclure. Elle échouait
toujours, en `Permission denied` cette fois.

Un tmpfs se monte en `root:root` par défaut, quand le conteneur tourne en
`nextjs`. Sans `uid`/`gid`, le montage tombe au bon endroit et reste interdit en
écriture. Et l'uid/gid attendu n'était pas non plus celui du Dockerfile :
`adduser --system` sans `--ingroup` place `nextjs` dans `nogroup` (65533) au
lieu de `nodejs` (1001), ce qui privait d'effet le `chown -R nextjs:nodejs`
juste en dessous, sans doute depuis toujours.

Trois défauts empilés, chacun suffisant seul. Sans le test d'écriture, le
correctif partait en production en paraissant complet, ce qui est le pire des
cas. Les deux tests négatifs conservés le prouvent : sans `uid/gid` l'écriture
échoue en `Permission denied`, sur l'ancien chemin en `Read-only file system`,
l'erreur exacte relevée en production.

**Un lint que j'ai déclaré vert à tort.** J'ai lu la fin de la sortie de
`npm run lint`, où ne figuraient que des avertissements Prettier préexistants,
et j'en ai conclu que c'était propre. La CI a rejeté la PR sur deux erreurs
ESLint venant de mon propre code, une assertion de type inutile et un mock
`async` sans `await`. La sortie est trop longue pour sa fin : seul un filtre sur
`Error:` distingue ce qui bloque.

**J'ai analysé la session sur le mauvais fichier de log.** Une fiche mémoire
disait pourtant que le trafic HTTPS vit dans `smartplanning-access.log` et non
`access.log`. Je l'ai contredite sur deux vérifications fausses : un `ls`
tronqué par un `head -20`, l'ordre alphabetique plaçant les 30 fichiers
`access.log*` avant, et un `grep` sans `sudo` sur `sites-enabled/` qui ne
renvoyait rien, ces fichiers n'étant pas lisibles autrement. J'en ai conclu
qu'aucun `access_log` n'était déclaré et que la fiche était périmée.

Conséquence : ma première analyse du parcours ne reposait que sur les logs
applicatifs, et j'ai décrit un parcours de neuf minutes là où il y en avait
quinze, sans voir les 159 requêtes sur le planning. La fiche avait raison sur
toute la ligne, elle a été complétée des deux pièges qui m'ont fait douter.

**Une mesure qui a corrigé mon propre diagnostic.** Mon premier script de
vérification de la whitelist E2E annonçait 8 entrées mortes sur 8. C'était mon
script qui testait les chemins depuis la racine au lieu du `testDir`. La
whitelist est saine.

### La piste du planning, instruite

Les 159 requêtes sur `/app/dashboard/schedules` désignaient un endroit, pas une
cause. Le parcours a donc été rejoué au navigateur sur un compte neuf
reproduisant sa situation : une entreprise, une équipe, un employé, aucun
planning.

**Changer de vue jour, semaine ou mois casse la page entière.** L'error boundary
remplace tout l'écran par « Une erreur est survenue », avec
`Cannot read properties of undefined (reading 'set')`. Le calendrier disparaît,
il faut recharger. Reproduit plusieurs fois.

La cause est un garde qui teste la mauvaise chose. Le calendrier resynchronise
ses events après le montage, et l'effet vérifiait seulement que le plugin
existe. Or `createEventsServicePlugin()` renvoie un objet dont `$app` vaut
`undefined` jusqu'au `beforeRender($app)` de Schedule-X, et `set()` le
déréférence sans garde. Lu directement dans le code du paquet, et confirmé par
la documentation via Context7.

Le déclenchement dépend du timing, ce qui explique qu'il soit passé inaperçu :
sur une machine rapide et un compte déjà peuplé la fenêtre est étroite, elle
s'élargit quand les données arrivent tardivement, donc sur un compte neuf. Soit
exactement la situation de quelqu'un qui découvre le produit.

Cela ne prouve pas que ce défaut a causé son départ, aucune donnée ne le dira.
Mais il a passé sept minutes sur cet écran, et cet écran cassait.

**Le test de composant ne pouvait pas voir le défaut** : son mock de
`@schedule-x/events-service` renvoie un objet toujours prêt, donc il simulait
un plugin qui ne se comporte pas comme le vrai. Le test ajouté porte sur le
contrat du paquet réel, sans mock.

Deux observations connexes consignées dans SP-581, non traitées. La page émet
10 requêtes POST par chargement sur un compte vide, mesuré au navigateur, ce
qui correspond aux rafales de 10 par seconde vues dans ses logs et aux 78
réponses de 98 octets sur 159, soit des réponses vides. Et la navigation entre
semaines ne répond pas toujours au premier clic.

## Ce qui reste ouvert

Le critère 3 du lot 1 ne peut se vérifier qu'après merge et redéploiement :
l'arrêt des `ENOENT` dans les logs de production. La correction du Dockerfile
suppose un rebuild de l'image.

Le `scp` ajouté au CD écrasera le compose du VPS au prochain déploiement. Les 18
variables référencées ont été vérifiées présentes dans le `.env` du serveur, et
le fichier actuel sauvegardé en `docker-compose.yml.avant-sp580`.

Hors périmètre, déjà noté le 31 août et toujours ouvert : la relance automatique
avant expiration du token d'invitation à 48 heures. L'action manuelle demandée
sur le compte de Cassy Bouson, dont le token expirait le 2 septembre, n'a pas
été faite.

Deux observations sans ticket. Le refus `EmailNotVerified` arrive treize
secondes après l'inscription, avant que l'email ait pu être lu : c'est le
comportement voulu depuis SP-526, mais c'est la première interaction après
inscription et c'est un échec.

La piste des 159 requêtes sur le planning a été instruite et a donné SP-581,
livré dans la même PR. Restent ouvertes les deux observations qu'elle a
soulevées, le volume de requêtes de la page et la navigation entre semaines qui
ne répond pas toujours.

Sur le départ lui-même, la question reste sans réponse et le restera : demander
la raison au moment de la suppression donnerait ce qu'aucun log ne porte.
