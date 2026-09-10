# Restaurer la base de production (SP-593, SP-594)

Procédure à exécuter sur le VPS, en cas de perte ou de corruption des données.
Elle est écrite pour être suivie sous pression, sans avoir à lire les scripts.

**À lire en entier avant de commencer.** Une restauration écrase des données :
l'étape la plus importante est de sauvegarder l'état actuel d'abord, même
corrompu.

## Quand l'utiliser

- Suppression accidentelle de données (un `DELETE` ou un `DROP` trop large)
- Corruption logique après une migration
- Retour arrière applicatif qui laisse le schéma en avant, cas décrit en
  section 7 de `docs/deployment.md`

**Ce n'est pas la procédure pour un rollback applicatif.** Si l'application est
cassée mais les données saines, le CD restaure l'image précédente tout seul
(SP-588), et un rollback manuel se fait par `IMAGE_TAG`.

## Ce qui existe

| Élément | Valeur |
|---|---|
| Archives | `/var/backups/smartplanning/quotidienne-AAAAMMJJ-HHMMSS.dump.gpg` |
| Répertoire | `0700`, root |
| Format | PostgreSQL `custom`, chiffré GPG AES256 |
| Clé | `/etc/smartplanning/backup.key`, `0600`, root |
| Fréquence | quotidienne, 03:20 UTC |
| Rétention | 30 jours |
| Conteneur | `smartplanning-postgres`, en `read_only: true` |
| **Copie hors site** | Backblaze B2, bucket `smartplanning-backups`, quotidienne 04:10 UTC (SP-594) |
| **Clé hors VPS** | gestionnaire de mots de passe, et `~/.smartplanning/backup.key` sur le poste |

## Étape 0, avant tout : sauvegarder l'état actuel

Même si la base semble perdue. Sans cette étape, une restauration qui se révèle
partir de la mauvaise archive est sans retour.

```bash
sudo /opt/smartplanning/ops/backup-database.sh
```

Si ce script échoue parce que la base est trop abîmée, continuer quand même,
mais le noter : on part sans filet.

## Étape 1, choisir l'archive

```bash
sudo find /var/backups/smartplanning -name "*.dump.gpg" -printf '%T@ %p\n' \
  | sort -rn | head -10 | cut -d' ' -f2-
```

**Ne pas utiliser `sudo ls /var/backups/smartplanning/*.gpg`** : le shell
développe le joker avant `sudo`, donc sans les droits sur un répertoire en
`0700`, et renvoie « aucun fichier » à tort.

Prendre la plus récente **antérieure à l'incident**. Une archive postérieure a
déjà enregistré les dégâts.

## Étape 2, vérifier l'archive AVANT de toucher à la production

```bash
sudo /opt/smartplanning/ops/test-backup-restore.sh
```

Ce script déchiffre la dernière archive, la restaure dans une base temporaire,
compte les tables et les lignes, puis supprime cette base. Il ne touche jamais
la production, et refuse de s'exécuter si la base cible porte son nom.

Il affiche le nombre de tables, d'entreprises et d'utilisateurs restaurés :
comparer ces chiffres à ce qui est attendu avant d'aller plus loin. S'ils
paraissent faux, changer d'archive.

Pour tester une archive plus ancienne que la dernière, la copier temporairement
comme la plus récente, ou suivre l'étape 3 en visant une base de test.

## Étape 3, restaurer

```bash
cd /var/backups/smartplanning
ARCHIVE=quotidienne-AAAAMMJJ-HHMMSS.dump.gpg   # celle choisie a l'etape 1

# 3.1 Déchiffrer
sudo gpg --batch --decrypt --passphrase-file /etc/smartplanning/backup.key \
  --output /tmp/restauration.dump "$ARCHIVE"

# 3.2 Couper l'application, pour éviter les écritures concurrentes
cd /var/www/smartplanning
sudo docker compose --env-file .env stop app

# 3.3 Écrire l'archive dans le conteneur
# `docker cp` est REFUSÉ ici : le conteneur tourne en read_only depuis le
# durcissement SP-157, et le démon répond « container rootfs is marked
# read-only » même vers un tmpfs inscriptible. On passe par docker exec.
sudo docker exec -i smartplanning-postgres sh -c 'cat > /tmp/r.dump' < /tmp/restauration.dump

# 3.4 Restaurer
set -a; . /var/www/smartplanning/.env; set +a
sudo docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" smartplanning-postgres \
  pg_restore --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --clean --if-exists /tmp/r.dump

# 3.5 Relancer l'application
sudo docker compose --env-file .env start app
```

`--clean --if-exists` supprime les objets avant de les recréer. C'est ce qui
rend la restauration idempotente, et c'est aussi ce qui la rend destructive :
d'où l'étape 0.

## Étape 4, vérifier

```bash
# L'application répond
HEALTH_KEY=$(grep -oP 'HEALTH_API_KEY=\K.*' /var/www/smartplanning/.env)
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $HEALTH_KEY" http://localhost:3000/api/health

# Les données sont là
sudo docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" smartplanning-postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "SELECT (SELECT count(*) FROM companies) AS entreprises,
          (SELECT count(*) FROM users) AS utilisateurs,
          (SELECT count(*) FROM employees) AS collaborateurs;"
```

Puis vérifier depuis l'extérieur : `curl -s -o /dev/null -w "%{http_code}"
https://smartplanning.fr/`, et se connecter à un compte réel.

## Étape 5, nettoyer

**À ne pas oublier.** Les fichiers intermédiaires sont des dumps en clair, qui
portent les données personnelles de toutes les entreprises clientes, sur un
disque non chiffré et partagé avec un second projet.

```bash
sudo docker exec smartplanning-postgres rm -f /tmp/r.dump
sudo rm -f /tmp/restauration.dump
```

## Si la restauration échoue

**`pg_restore` signale des erreurs mais se termine.** Lire la sortie : des
avertissements sur des objets absents sont normaux avec `--clean --if-exists`
sur une base partiellement vide. Des erreurs sur des tables métier ne le sont
pas.

**Le déchiffrement échoue.** La clé ne correspond pas à l'archive. Vérifier
qu'elle n'a pas été régénérée depuis : une archive chiffrée avec une clé perdue
est irrécupérable, il n'y a pas de contournement.

**Le conteneur PostgreSQL ne démarre plus.** Restaurer d'abord le service, la
base ensuite. Les données vivent dans un volume Docker, indépendant du
conteneur.

## Restaurer quand le VPS est perdu (SP-594)

La procédure ci-dessus suppose que le VPS répond. S'il a disparu, panne
matérielle, incident OVH ou rançongiciel, les archives restent disponibles chez
Backblaze B2 et la clé dans le gestionnaire de mots de passe.

**Prouvé le 10 septembre 2026** sur un poste de développement : 23 tables,
200 objets, dix comptages identiques à la production.

```bash
# 1. S'authentifier (identifiants B2 depuis le gestionnaire de mots de passe)
R=$(curl -sS -u "<keyID>:<applicationKey>" \
  https://api.backblazeb2.com/b2api/v4/b2_authorize_account)
T=$(echo "$R" | jq -r .authorizationToken)
D=$(echo "$R" | jq -r .apiInfo.storageApi.downloadUrl)

# 2. Lister les archives disponibles
U=$(echo "$R" | jq -r .apiInfo.storageApi.apiUrl)
B=$(echo "$R" | jq -r '.apiInfo.storageApi.allowed.buckets[0].id')
curl -sS -H "Authorization: $T" \
  "$U/b2api/v4/b2_list_file_names?bucketId=$B&maxFileCount=100" \
  | jq -r '.files[] | "\(.fileName)  \(.contentLength) octets"'

# 3. Télécharger celle qui convient
curl -sS -H "Authorization: $T" -o archive.dump.gpg \
  "$D/file/smartplanning-backups/quotidienne-AAAAMMJJ-HHMMSS.dump.gpg"

# 4. Déchiffrer VERS UN FICHIER, jamais dans un pipe vers head :
#    `gpg | head` fait sortir gpg en code 2 par SIGPIPE sur une archive saine.
gpg --batch --decrypt --passphrase-file <cle> --output archive.dump archive.dump.gpg
head -c 5 archive.dump    # doit afficher PGDMP

# 5. Restaurer dans un PostgreSQL 16
docker run -d --name pg-restauration -e POSTGRES_PASSWORD=<mdp> \
  -e POSTGRES_DB=verification postgres:16-alpine
docker exec -i pg-restauration sh -c 'cat > /tmp/a.dump' < archive.dump
docker exec pg-restauration pg_restore -U postgres -d verification --no-owner /tmp/a.dump

# 6. Vérifier
docker exec pg-restauration psql -U postgres -d verification -tAc \
  "select count(*) from pg_tables where schemaname='public'"   # attendu : 23
```

**`pg_restore` doit être en version 16.** Un client 15 refuse l'archive avec
« unsupported version (1.15) in file header ». Un `grep` sur cette sortie
compterait zéro objet, ce qui ressemble à une archive vide alors que
l'archive est saine.

Le dump déchiffré contient les données personnelles de tous les salariés de
toutes les entreprises clientes : le supprimer dès la restauration terminée,
et arrêter le conteneur de test.

## Limite qui subsiste

Le disque du VPS n'est pas chiffré (`ext4` nu, aucun volume LUKS). Un accès
fichier sur la machine donne accès à `/etc/smartplanning/backup.key`, donc aux
archives locales. Les archives distantes restent protégées tant que la clé
d'application B2 et la passphrase ne sont pas compromises ensemble.
