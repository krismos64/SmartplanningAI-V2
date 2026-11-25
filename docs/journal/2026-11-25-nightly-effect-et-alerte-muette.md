# 25 novembre 2026, nightly rouge sur effect et alerte restée muette cinq nuits

| Champ              | Valeur                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | aucun, correctif rapide rattaché à SP-596                                                                                          |
| Documents produits | cette entrée                                                                                                                       |
| Documents modifiés | `package.json`, `package-lock.json`, `.github/workflows/nightly-e2e.yml`                                                           |
| Contrôles          | `npm run audit:prod` conforme, type-check OK, lint 0 erreur, `npm run test` : 230 fichiers, 3626 tests verts, `prisma generate` OK |
| Jira               | commentaire sur SP-596                                                                                                             |
| Mémoire            | `ou-en-est-le-projet.md`, `npm-audit-lire-omit-dev.md`, `audit-documentation-13-septembre.md`                                      |

## Ce qui a été fait

**La nightly était rouge depuis le 20 novembre**, cinq nuits, sur le job Unit
Tests. `npm run audit:prod` voyait GHSA-7589-6fvf-x4pw, publiée le 19 novembre
à 20:51 UTC : un ReDoS dans `Schema.TemplateLiteral` d'`effect`, versions
jusqu'à 3.22.0. Chemin unique : `@prisma/client` > `prisma` > `@prisma/config`,
qui épingle `effect` à `3.21.0` exactement.

Contrairement à picomatch le 18 novembre, une version corrigée existait
(3.22.1). Ajout de `"effect": "^3.22.1"` dans `overrides`, résolu en 3.22.5. Le
lockfile ne change que la ligne `effect`. `prisma validate` et
`prisma generate` passent avec cette version.

**L'alerte n'en était pas une.** Le job Notify Failure a tourné chaque nuit,
avec succès : il commentait l'issue #72, ouverte le 12 août et jamais
refermée, 14 commentaires de bot. Rien ne la fermait au retour au vert, donc
chaque nouvel épisode s'empilait dans un vieux fil sans notification visible.
Deux changements : l'issue créée est assignée au propriétaire du dépôt, et un
job `close-on-success` ferme toute issue `nightly-failure` ouverte à la
première nightly verte.

**Prouvé en production le jour même.** PR #133 mergée (`44b47eb`), CI et CD
verts, image `sha-44b47eb` healthy depuis 07:40 UTC, aucune erreur dans
journald. La nightly de 11:02 UTC sur `44b47eb` est verte, Notify Failure
sauté, Close Tracking Issue a fermé #72 à 11:10:37 UTC avec son commentaire.

## Les écarts

- **L'image de production garde `effect` 3.21.0** dans la CLI Prisma globale
  (`npm install -g prisma@6.19.3` du Dockerfile), que l'override ne couvre
  pas. Non exploitable : cette CLI ne tourne qu'au job `migrate` du CD, sur
  notre propre configuration, hors de toute requête HTTP. La corriger
  demanderait de copier la CLI du builder au lieu de l'installer en global,
  ce qui touche le chemin des migrations
- `prisma migrate status` non rejoué en local, Postgres arrêté. La CI le
  couvre par ses migrations sur base réelle
- La notification de l'assignation n'est prouvée qu'au prochain échec
- Le cron de la nightly est réglé sur 2 h UTC, mais les runs du 16 au 25
  novembre ont démarré entre 9 h et 12 h UTC : GitHub les retarde. Le README
  annonçait 2 h et 45 à 60 minutes, pour 8 à 16 minutes mesurées, corrigé

## Prochaine étape

- Lire l'activité de JULIENNE, essai jusqu'au 2 décembre
- Décider de la CLI Prisma de l'image (copie depuis le builder)
- Confirmer dans l'espace client OVH l'origine du redémarrage de 15:17 UTC
- Surveillance externe de disponibilité, aucune aujourd'hui

## Audit documentaire de fin de session

Rejoué selon la méthode de la mémoire, par la mesure. Conformes : compteurs du
README (230 fichiers et 3626 tests unitaires, E2E 28 fichiers et 275 tests dont
143 en whitelist, 26 tests publics, 22 modèles, 16 enums, 65 index, 24
migrations, 66 pages, 18 routes, 32 actions, 24 services, 21 templates
email), seuils de couverture, scripts npm cités tous présents, neuf scripts
ops tous documentés, six hooks testés en exécution (`.env` refusé en code 2,
export non-async signalé, `SessionStart` affichant cette entrée), cinq agents
et deux skills. VPS : Nginx identique au dépôt, sept scripts ops identiques,
`read-funnel-steps.sh` et `test-cd-rollback.sh` absents comme avant (lancés
depuis le poste). Jira : SP-602 seul ouvert.

Écarts corrigés : ligne nightly du README (horaire et durée), mécanisme
d'alerte et limite de l'override dans `deployment.md` (2.21), `CLAUDE.md` et
l'agent `docker-devops`.

## Incident : VPS figé de 15:02 à 15:17 UTC

Constaté en suivant le redéploiement de la PR #134 : le job `migrate` du CD
échoue à 15:07 UTC sur `ssh-keyscan`, avant toute action sur la machine. Le CD
n'est donc pas en cause. De 15:10 à 15:14 UTC, depuis le poste et depuis un
récupérateur externe : HTTPS en timeout, port 22 fermé, `http://` en 502 sans
en-tête `Server` (ce n'était pas notre Nginx). SmartPlanning, Umami et Lune &
Soleil étaient tous injoignables.

Revenu à 15:18 UTC sans intervention de notre part. Lu sur la machine :

- démarrage à 15:17:53, sur le noyau 6.8.0-151 installé le matin même par
  `unattended-upgrades` (auparavant 6.8.0-134, depuis le 8 juillet)
- le démarrage précédent s'arrête net à 15:02:18, sans séquence d'arrêt, OOM
  ni panique noyau : gel ou arrêt brutal, vu de l'intérieur
- `sar` avant le gel : CPU inoccupé à 98 %, mémoire utilisée à 15 %, disque
  quasi inactif. Ce n'est pas une surcharge
- aucun `Automatic-Reboot` configuré : le redémarrage vient de l'extérieur
  (hyperviseur OVH ou action manuelle), **origine à confirmer dans l'espace
  client OVH**

Après redémarrage : sept conteneurs healthy, aucun redémarrage en boucle,
`sha-44b47eb` toujours en place, aucune erreur dans journald, timers de
sauvegarde programmés pour la nuit, pages en 200.

**Aucune surveillance n'a rien signalé.** `check-tls-expiry.sh` et
`check-public-ports.sh` tournent sur le VPS lui-même, donc se taisent quand il
tombe. Rien ne surveille la production depuis l'extérieur.

La PR #134 (documentation seule) est mergée, mais son image `sha-6fd915e`
n'est pas déployée : la production tourne sur `sha-44b47eb`, code identique.
Elle partira avec le prochain merge.
