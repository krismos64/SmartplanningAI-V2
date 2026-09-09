#!/usr/bin/env bash
#
# Test de restauration de la derniere sauvegarde
#
# POURQUOI CE SCRIPT EXISTE. Une sauvegarde jamais restauree ne prouve rien.
# `backup-database.sh` verifie que l'archive est lisible par
# `pg_restore --list`, ce qui controle son en-tete et sa table des matieres,
# pas qu'elle se REVERSE dans une base vivante. Entre les deux se cachent les
# defauts qui ne se voient que le jour de la panne : un dump tronque apres
# l'en-tete, une extension absente de l'image, un proprietaire de table qui
# n'existe pas sur la cible.
#
# CE QU'IL FAIT. Il dechiffre la derniere sauvegarde, cree une base temporaire
# DANS le conteneur PostgreSQL de production, y restaure l'archive, compte les
# tables et les lignes de quelques tables cles, puis supprime la base
# temporaire.
#
# CE QU'IL NE TOUCHE PAS. La base de production. La restauration vise une base
# de nom different, creee pour l'occasion et supprimee a la fin, y compris en
# cas d'echec. Le script REFUSE de s'executer si le nom de la base cible est
# celui de la production.
#
# Usage : ./test-backup-restore.sh
# Sortie : 0 si la restauration aboutit et que la base contient des donnees.

set -euo pipefail

FICHIER_ENV="${FICHIER_ENV:-/var/www/smartplanning/.env}"
REP_SAUVEGARDE="${BACKUP_DIR:-/var/backups/smartplanning}"
CONTENEUR="${CONTENEUR_DB:-smartplanning-postgres}"
FICHIER_CLE="${BACKUP_KEY_FILE:-/etc/smartplanning/backup.key}"

echo "Test de restauration, $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ ! -r "$FICHIER_ENV" ] || [ ! -r "$FICHIER_CLE" ]; then
  echo "Arret : environnement ou cle de chiffrement illisible." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$FICHIER_ENV"
set +a

: "${POSTGRES_USER:?POSTGRES_USER absente}"
: "${POSTGRES_DB:?POSTGRES_DB absente}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD absente}"

DERNIERE=$(find "$REP_SAUVEGARDE" -maxdepth 1 -name 'quotidienne-*.dump.gpg' \
  -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -1 || true)

if [ -z "$DERNIERE" ]; then
  echo "Arret : aucune sauvegarde a restaurer dans $REP_SAUVEGARDE." >&2
  exit 1
fi

echo "  Sauvegarde testee : $(basename "$DERNIERE")"

BASE_TEST="restauration_test_$(date -u +%Y%m%d%H%M%S)"

# GARDE-FOU ABSOLU. Le seul defaut irrattrapable de ce script serait de viser
# la base de production. La verification est explicite, et non deduite du nom
# genere ci-dessus qui pourrait changer.
if [ "$BASE_TEST" = "$POSTGRES_DB" ]; then
  echo "Arret : la base de test porte le nom de la production." >&2
  exit 1
fi

CLAIR="/tmp/restauration-test-$$.dump"
COPIE_INTERNE="/tmp/restauration-test-$$.dump"

nettoyer() {
  rm -f "$CLAIR"
  docker exec "$CONTENEUR" rm -f "$COPIE_INTERNE" >/dev/null 2>&1 || true
  # La base temporaire part dans tous les cas, y compris si la restauration a
  # echoue a mi-chemin : une base orpheline occupe le disque partage et
  # ressemble a s'y meprendre a une base metier lors d'un audit ulterieur.
  docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTENEUR" \
    dropdb --username "$POSTGRES_USER" --if-exists "$BASE_TEST" \
    >/dev/null 2>&1 || true
}
trap nettoyer EXIT

echo "  Dechiffrement"
if ! gpg --batch --quiet --decrypt \
  --passphrase-file "$FICHIER_CLE" \
  --output "$CLAIR" "$DERNIERE" 2>/dev/null; then
  echo "Arret : dechiffrement impossible, la cle ne correspond pas." >&2
  exit 1
fi

echo "  Creation de la base $BASE_TEST"
if ! docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTENEUR" \
  createdb --username "$POSTGRES_USER" "$BASE_TEST" >/dev/null 2>&1; then
  echo "Arret : creation de la base de test impossible." >&2
  exit 1
fi

# `docker cp` est refuse par le demon sur un conteneur `read_only: true`
# (durcissement SP-157). On ecrit par `docker exec`, voir backup-database.sh.
if ! docker exec -i "$CONTENEUR" sh -c "cat > '$COPIE_INTERNE'" < "$CLAIR"; then
  echo "Arret : ecriture de l'archive dans le conteneur impossible." >&2
  exit 1
fi

echo "  Restauration"
# `--no-owner` : les roles de la production n'existent pas forcement tels quels
# pour une base creee a la volee, et un echec de reattribution de proprietaire
# masquerait un vrai probleme de donnees.
#
# La sortie d'erreur est conservee : pg_restore signale par des avertissements
# des objets qu'il n'a pas pu creer, et ces avertissements sont precisement ce
# qu'on veut voir avant une vraie restauration d'urgence.
if ! docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTENEUR" \
  pg_restore --username "$POSTGRES_USER" --dbname "$BASE_TEST" \
  --no-owner --no-privileges "$COPIE_INTERNE" 2>/tmp/restore-$$.err; then
  echo "Arret : la restauration a echoue." >&2
  sed 's/^/  /' "/tmp/restore-$$.err" >&2 || true
  rm -f "/tmp/restore-$$.err"
  exit 1
fi

AVERTISSEMENTS=$(wc -l < "/tmp/restore-$$.err" 2>/dev/null | tr -d ' ' || echo 0)
rm -f "/tmp/restore-$$.err"

# ---------------------------------------------------------------------------
# Controles sur la base restauree
#
# Une restauration qui « reussit » sur une base vide reussit aussi. On compte
# donc ce qui a reellement ete reverse.
# ---------------------------------------------------------------------------

compter() {
  docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTENEUR" \
    psql --username "$POSTGRES_USER" --dbname "$BASE_TEST" -tAc "$1" 2>/dev/null | tr -d ' '
}

NB_TABLES=$(compter "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")

if [ -z "$NB_TABLES" ] || [ "$NB_TABLES" -lt 20 ]; then
  echo "Arret : $NB_TABLES tables restaurees, la base est incomplete." >&2
  exit 1
fi

# Quelques tables metier : une base structurellement complete mais vide de
# donnees signalerait un dump de schema seul (`--schema-only`), qui ne
# permettrait aucune reprise.
NB_COMPANIES=$(compter "SELECT count(*) FROM companies;" || echo "0")
NB_USERS=$(compter "SELECT count(*) FROM users;" || echo "0")

echo "  Tables restaurees   : $NB_TABLES"
echo "  Entreprises         : $NB_COMPANIES"
echo "  Utilisateurs        : $NB_USERS"
if [ "$AVERTISSEMENTS" -gt 0 ]; then
  echo "  Avertissements pg_restore : $AVERTISSEMENTS ligne(s)"
fi

if [ "${NB_USERS:-0}" -lt 1 ]; then
  echo "Arret : aucun utilisateur restaure, le dump ne porte pas de donnees." >&2
  exit 1
fi

echo "Restauration verifiee, base de test supprimee."
