#!/usr/bin/env bash
#
# Sauvegarde quotidienne chiffree de la base de production
#
# CE QU'IL FERME. Mesure du 9 septembre 2026 sur le VPS, en verifiant les
# affirmations de la politique de confidentialite : la base SmartPlanning
# n'etait sauvegardee NULLE PART. Aucune tache cron, aucun timer systemd,
# aucun fichier de dump. Le second projet de la machine, lui, avait dix
# sauvegardes quotidiennes. Une panne disque, un DROP malheureux ou un
# chiffrement par rancongiciel emportait les donnees de tous les clients, sans
# recours.
#
# La politique de confidentialite annoncait pourtant « Sauvegardes regulieres
# et chiffrees ». Ce script rend cette phrase vraie, plutot que de la retirer.
#
# POURQUOI CHIFFRER, alors que le script voisin de Lune & Soleil ne le fait
# pas. Un dump contient l'integralite des donnees personnelles des salaries de
# toutes les entreprises clientes, noms, adresses, emails et absences. Le
# disque n'est PAS chiffre (ext4 nu, aucun volume LUKS, verifie le
# 9 septembre 2026) et la machine est PARTAGEE avec un autre projet. Un dump
# en clair y est donc une base de donnees personnelles lisible par quiconque
# obtient un acces fichier.
#
# OU IL TOURNE : sur l'HOTE, par `smartplanning-backup.timer`, jamais dans la
# composition Docker. Les moments ou la sauvegarde compte le plus sont ceux ou
# la composition est arretee, un `down` avant manipulation ou un retour arriere
# en cours. Un conteneur de sauvegarde s'arreterait avec elle.
#
# POURQUOI `docker exec` ET NON UN `pg_dump` DE L'HOTE. `pg_dump` est absent de
# cette machine, et un client plus ancien que le serveur REFUSE de s'executer
# contre lui. Le client vit donc dans le conteneur, ou il est par construction
# a la meme version que le serveur.
#
# FORMAT `custom` ET NON DU SQL BRUT : c'est le format que `pg_restore --list`
# sait valider, et celui qui permet une restauration selective.
#
# Usage : ./backup-database.sh
# Sortie : 0 si la sauvegarde est produite ET verifiee, 1 sinon.

set -euo pipefail

FICHIER_ENV="${FICHIER_ENV:-/var/www/smartplanning/.env}"
REP_SAUVEGARDE="${BACKUP_DIR:-/var/backups/smartplanning}"
CONTENEUR="${CONTENEUR_DB:-smartplanning-postgres}"

# CLE DE CHIFFREMENT. Passphrase symetrique, lue dans un fichier a part et
# JAMAIS dans le .env de l'application : le .env est copie par le CD et lu par
# le conteneur, la cle de sauvegarde ne doit pas suivre ce chemin.
FICHIER_CLE="${BACKUP_KEY_FILE:-/etc/smartplanning/backup.key}"

# RETENTION EN JOURS, 30.
#
# Le disque est partage avec un second projet depuis septembre 2026. Une
# sauvegarde qui s'accumule sans limite est un mecanisme de saturation a
# retardement, et elle arreterait LES DEUX projets un jour ou personne ne
# regarde.
#
# 30 jours et non 14 : le RGPD donne un mois a une personne pour exercer ses
# droits, et une suppression contestee doit pouvoir etre reconstituee sur cette
# duree. Un dump pese quelques mega-octets, 30 copies restent negligeables
# devant les 63 Go libres mesures.
RETENTION="${RETENTION_JOURS:-30}"

echo "Sauvegarde de la base SmartPlanning, $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---------------------------------------------------------------------------
# Gardes d'entree
#
# CHAQUE ETAPE QUI NE PEUT PAS CONCLURE ARRETE LE SCRIPT. Une sauvegarde qui
# echoue en silence est pire que pas de sauvegarde du tout : le systeme parait
# protege et ne l'est pas. C'est exactement le defaut du healthcheck du CD
# corrige en SP-588.
# ---------------------------------------------------------------------------

if [ ! -r "$FICHIER_ENV" ]; then
  echo "Arret : $FICHIER_ENV illisible, les identifiants sont introuvables." >&2
  exit 1
fi

if [ ! -r "$FICHIER_CLE" ]; then
  echo "Arret : cle de chiffrement absente ($FICHIER_CLE)." >&2
  echo "  La creer avec : openssl rand -base64 48 | sudo tee $FICHIER_CLE" >&2
  echo "  puis : sudo chmod 600 $FICHIER_CLE" >&2
  exit 1
fi

# Le fichier n'est jamais affiche : les journaux de systemd sont lisibles par
# plus de monde que le fichier lui-meme, qui est en 0600.
set -a
# shellcheck disable=SC1090
. "$FICHIER_ENV"
set +a

: "${POSTGRES_USER:?POSTGRES_USER absente de $FICHIER_ENV}"
: "${POSTGRES_DB:?POSTGRES_DB absente de $FICHIER_ENV}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD absente de $FICHIER_ENV}"

if ! docker inspect "$CONTENEUR" >/dev/null 2>&1; then
  echo "Arret : le conteneur $CONTENEUR n'existe pas." >&2
  exit 1
fi

# UN CONTENEUR ARRETE NE SE SAUVEGARDE PAS, et le dire est le but. Sans ce
# controle, le `docker exec` echouerait avec un message de Docker plutot
# qu'avec la cause.
ETAT=$(docker inspect --format '{{.State.Status}}' "$CONTENEUR")
if [ "$ETAT" != "running" ]; then
  echo "Arret : le conteneur $CONTENEUR est '$ETAT' et non 'running'." >&2
  exit 1
fi

mkdir -p "$REP_SAUVEGARDE"
# 0700 : meme chiffres, les dumps ne se laissent pas lister par n'importe qui
# sur une machine partagee.
chmod 700 "$REP_SAUVEGARDE"

HORODATAGE=$(date -u +%Y%m%d-%H%M%S)
SAUVEGARDE="$REP_SAUVEGARDE/quotidienne-$HORODATAGE.dump"
CHIFFREE="$SAUVEGARDE.gpg"

# Tout fichier intermediaire part, y compris sur sortie en erreur : un dump en
# clair oublie sur le disque annulerait l'interet du chiffrement.
nettoyer() {
  rm -f "$SAUVEGARDE" "$SAUVEGARDE.err" "$SAUVEGARDE.verif"
}
trap nettoyer EXIT

# ---------------------------------------------------------------------------
# Le dump
#
# ECRIT SUR LA SORTIE STANDARD PUIS REDIRIGE, et non `--file` dans le
# conteneur : le fichier resterait alors DANS le conteneur, donc perdu au
# premier remplacement d'image.
#
# `-i` sans `-t` : pas de pseudo-terminal, qui corromprait un flux binaire.
# ---------------------------------------------------------------------------

echo "  Dump depuis $CONTENEUR"

if ! docker exec -i \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  "$CONTENEUR" \
  pg_dump --format=custom --username "$POSTGRES_USER" "$POSTGRES_DB" \
  > "$SAUVEGARDE" 2>"$SAUVEGARDE.err"; then
  echo "Arret : pg_dump a echoue." >&2
  # Le mot de passe voyage par l'environnement du `docker exec` et n'apparait
  # dans aucun message de pg_dump. Cette sortie est donc affichable.
  sed 's/^/  /' "$SAUVEGARDE.err" >&2 || true
  exit 1
fi
rm -f "$SAUVEGARDE.err"

# ---------------------------------------------------------------------------
# Verification AVANT chiffrement, trois controles
#
# Une taille non nulle ne prouve rien : un dump interrompu a mi-chemin fait
# plusieurs mega-octets et n'est pas restaurable.
# ---------------------------------------------------------------------------

if [ ! -s "$SAUVEGARDE" ]; then
  echo "Arret : la sauvegarde n'a pas ete creee ou est vide." >&2
  exit 1
fi

TAILLE=$(wc -c < "$SAUVEGARDE" | tr -d ' ')
if [ "$TAILLE" -lt 1024 ]; then
  echo "Arret : sauvegarde suspecte, $TAILLE octets seulement." >&2
  exit 1
fi

# Le controle d'integrite ci-dessous ecrit dans le tmpfs du conteneur, limite a
# 100 Mo. Au-dela, il echouerait par manque de place et non par corruption, ce
# qui ferait echouer la sauvegarde pour une mauvaise raison. Le jour ou la base
# depasse ce seuil, il faudra verifier autrement, par exemple en montant un
# volume dedie.
TMPFS_MAX=$((90 * 1024 * 1024))
if [ "$TAILLE" -gt "$TMPFS_MAX" ]; then
  echo "Arret : dump de $TAILLE octets, au-dela des 90 Mo verifiables dans le tmpfs." >&2
  echo "  La sauvegarde est produite mais NON verifiee : adapter le controle." >&2
  exit 1
fi

# CONTROLE D'INTEGRITE, dans le conteneur, meme motif que pg_dump.
#
# LE FICHIER EST COPIE DANS LE CONTENEUR, ET CE DETOUR EST OBLIGATOIRE.
# `pg_restore --list -` NE LIT PAS l'entree standard : il cherche un fichier
# litteralement nomme « - ». `/dev/stdin` echoue autrement, l'archive au format
# custom devant etre NAVIGABLE et non lue en flux. Piege documente par le
# script voisin de Lune & Soleil, qui avait rejete une sauvegarde parfaitement
# valide avant correction.
#
# `docker cp` NE FONCTIONNE PAS ICI, et c'est voulu : le conteneur PostgreSQL
# tourne en `read_only: true` depuis le durcissement OWASP de SP-157, et le
# demon refuse alors toute copie avec « container rootfs is marked read-only »,
# meme vers un tmpfs inscriptible. Mesure du 9 septembre 2026, premiere
# execution reelle de ce script.
#
# On passe donc par `docker exec` avec redirection, qui ecrit par le processus
# et non par l'API de copie. Le tmpfs /tmp du conteneur fait 100 Mo, ce qui
# borne la taille du dump verifiable par ce chemin ; le controle de taille
# ci-dessous le signalerait avant d'y arriver.
COPIE_INTERNE="/tmp/verification-smartplanning-$HORODATAGE.dump"
if ! docker exec -i "$CONTENEUR" sh -c "cat > '$COPIE_INTERNE'" < "$SAUVEGARDE"; then
  echo "Arret : ecriture de la sauvegarde dans le conteneur impossible." >&2
  exit 1
fi

nettoyer_copie() {
  docker exec "$CONTENEUR" rm -f "$COPIE_INTERNE" >/dev/null 2>&1 || true
}

if ! docker exec "$CONTENEUR" pg_restore --list "$COPIE_INTERNE" >/dev/null 2>&1; then
  echo "Arret : la sauvegarde est illisible, integrite non verifiee." >&2
  nettoyer_copie
  exit 1
fi

NB_OBJETS=$(docker exec "$CONTENEUR" pg_restore --list "$COPIE_INTERNE" 2>/dev/null | grep -c '^[0-9]' || true)
nettoyer_copie

# Une base SmartPlanning porte 22 modeles, donc largement plus de 20 objets
# entre tables, index et contraintes. Un dump qui en contiendrait moins
# signale une base vide ou une restauration partielle en cours.
if [ "$NB_OBJETS" -lt 20 ]; then
  echo "Arret : seulement $NB_OBJETS objets dans la sauvegarde, base suspecte." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Chiffrement
#
# GPG symetrique en AES256. La passphrase est passee par un descripteur de
# fichier et non en argument : les arguments d'un processus sont lisibles dans
# /proc par tout utilisateur de la machine, qui est partagee.
# ---------------------------------------------------------------------------

echo "  Chiffrement"

if ! gpg --batch --yes --quiet \
  --symmetric --cipher-algo AES256 \
  --passphrase-file "$FICHIER_CLE" \
  --output "$CHIFFREE" \
  "$SAUVEGARDE"; then
  echo "Arret : le chiffrement a echoue." >&2
  rm -f "$CHIFFREE"
  exit 1
fi

# Le dump en clair part immediatement, le trap le ferait de toute facon mais
# le laisser vivre jusqu'a la fin du script elargit inutilement la fenetre.
rm -f "$SAUVEGARDE"

if [ ! -s "$CHIFFREE" ]; then
  echo "Arret : le fichier chiffre est vide." >&2
  exit 1
fi

# CONTROLE DU CHIFFRE. Un fichier chiffre qui ne se dechiffre pas est un
# fichier perdu, et on ne s'en apercevrait que le jour de la restauration,
# c'est-a-dire le pire jour. On verifie donc que la passphrase le rouvre et
# que le contenu est bien l'archive attendue.
#
# LE DECHIFFREMENT VA DANS UN FICHIER, JAMAIS DANS UN PIPE VERS `head`.
# `gpg ... | head -c 5` ferme le tuyau des les cinq premiers octets lus, gpg
# recoit SIGPIPE et sort en CODE 2 alors que le dechiffrement est parfaitement
# valide. Mesure du 9 septembre 2026, premiere execution reelle : le controle
# rejetait une sauvegarde saine dont l'en-tete etait bien « PGDMP ». Un
# garde-fou qui echoue sur du bon travail est pire qu'absent, il aurait fait
# echouer toutes les sauvegardes en annoncant une corruption inexistante.
TEMOIN="$SAUVEGARDE.verif"
if ! gpg --batch --quiet --decrypt \
  --passphrase-file "$FICHIER_CLE" \
  --output "$TEMOIN" "$CHIFFREE" 2>/dev/null; then
  echo "Arret : le fichier chiffre ne se dechiffre pas." >&2
  rm -f "$CHIFFREE" "$TEMOIN"
  exit 1
fi

if [ "$(head -c 5 "$TEMOIN")" != "PGDMP" ]; then
  echo "Arret : le contenu dechiffre n'est pas une archive PostgreSQL." >&2
  rm -f "$CHIFFREE" "$TEMOIN"
  exit 1
fi
rm -f "$TEMOIN"

chmod 600 "$CHIFFREE"
TAILLE_FINALE=$(wc -c < "$CHIFFREE" | tr -d ' ')

# ---------------------------------------------------------------------------
# Rotation
# ---------------------------------------------------------------------------

SUPPRIMES=$(find "$REP_SAUVEGARDE" -maxdepth 1 -name 'quotidienne-*.dump.gpg' \
  -mtime "+$RETENTION" -print -delete 2>/dev/null | wc -l | tr -d ' ')

# Un dump en clair qui trainerait d'une execution interrompue avant le trap.
find "$REP_SAUVEGARDE" -maxdepth 1 -name 'quotidienne-*.dump' -delete 2>/dev/null || true

RESTANTES=$(find "$REP_SAUVEGARDE" -maxdepth 1 -name 'quotidienne-*.dump.gpg' | wc -l | tr -d ' ')

echo "  Sauvegarde verifiee : $NB_OBJETS objets, $TAILLE_FINALE octets chiffres"
echo "  Rotation : $SUPPRIMES supprimee(s), $RESTANTES conservee(s)"
echo "Termine, $(date -u +%Y-%m-%dT%H:%M:%SZ)"
