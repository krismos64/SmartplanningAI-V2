# 8 septembre 2026, une désinscription qui révèle deux défauts sans rapport

| Champ | Valeur |
|---|---|
| Ticket | SP-580, deux lots |
| Documents produits | ce journal, `src/lib/audit-author.ts`, migration `20260908085434_sp580_audit_log_survit_a_son_auteur` |
| Documents modifiés | `docker-compose.prod.yml`, `Dockerfile`, `cd.yml`, `schema.prisma`, `profile.ts`, `audit.service.ts`, `audit-logs.ts`, `types/audit.ts`, trois écrans d'administration, trois fichiers de tests |
| Contrôles | type-check vert, lint sans erreur, 3273 tests Vitest verts sur 195 fichiers, CI complète verte sur la PR #83 (run 34207890590), E2E comprises |
| Jira | SP-580 créé |
| Mémoire | 4 fiches créées, 1 corrigée (`lire-les-logs-du-vps`) |

## Ce qui a été fait

Session ouverte sur une question de Christophe : « hier j'ai eu une inscription
puis un désabonnement, tu peux analyser son parcours ». L'analyse n'a rien
trouvé sur le départ lui-même, et deux défauts sérieux à côté.

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

Surtout, **159 requêtes sur `/app/dashboard/schedules`** concentrent l'essentiel
de la session, et l'écran de planning est le dernier consulté avant la
suppression. Le log ne dit pas si c'est un usage intensif ou une difficulté,
mais il désigne l'endroit à regarder si l'on veut comprendre ce départ. C'est la
piste à instruire, et elle demande autre chose qu'un log : demander la raison au
moment de la suppression, ou rejouer ce parcours sur l'écran en question.
