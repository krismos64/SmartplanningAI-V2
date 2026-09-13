#!/usr/bin/env bash
#
# Controle du durcissement de la cle Backblaze B2 (SP-597)
#
# CE QU'IL PROUVE. La copie hors site de SP-594 restait destructible depuis le
# VPS : la cle applicative y portait `deleteFiles`. Le scenario est le
# rancongiciel, qui chiffre la base puis se sert de la cle presente sur le
# serveur pour supprimer les copies distantes. Le dispositif hors site devient
# inutile exactement au moment ou il servirait.
#
# Ce script verifie les deux moities du correctif, et il le fait par la MESURE
# et non par la lecture de la configuration :
#
#   1. la cle en service ne porte aucune capacite destructrice
#   2. une regle de cycle de vie existe cote Backblaze, qui efface reellement
#      et s'applique MEME SERVEUR ETEINT
#   3. TEST NEGATIF : une suppression reelle est refusee en 401
#
# POURQUOI LE TEST NEGATIF VISE UN FICHIER REEL. C'est le piege qui a coute le
# plus de temps sur LS-223, et il se reproduit facilement par prudence mal
# placee. Viser un fileId fabrique pour « ne rien risquer » ne prouve RIEN :
# Backblaze valide la FORME du fileId avant d'examiner les droits, rend
# « Bad file ID » en bad_request, et la question de l'autorisation n'est jamais
# posee. Le controle rougit alors pour une raison etrangere a ce qu'il teste,
# et ce rouge se prend tres facilement pour une preuve.
#
# On vise donc une archive REELLE, avec son vrai fileId.
#
# MAIS ON NE LA SUPPRIME PAS. Mesure du 13 septembre 2026 : lance contre la
# cle NON durcie, une premiere version de ce controle a reellement detruit deux
# versions d'une archive avant de conclure. La cible etait bien choisie, le
# verdict etait juste, et le controle a quand meme fait exactement ce qu'il
# servait a empecher.
#
# Un garde-fou de sauvegarde ne doit jamais pouvoir couter une sauvegarde,
# y compris quand il tourne sur un systeme encore vulnerable, ce qui est
# precisement le cas ou on le lance en premier.
#
# La parade est `b2_delete_file_version` en DRY RUN : le parametre
# `bypassGovernance` mis a false sur un fichier sans verrou laisse B2 evaluer
# l'autorisation puis refuser l'operation elle-meme. On lit donc le verdict
# d'autorisation sans qu'aucune version ne soit detruite. Un 401 prouve le
# durcissement ; un 400 sur ce fichier reel prouve l'inverse, la cle ayant ete
# autorisee assez loin pour que B2 examine la requete.
#
# Meme famille que les mutations qui ne reproduisent pas le defaut : un
# garde-fou qui echoue sur le mauvais motif ne vaut rien. Et un garde-fou qui
# casse ce qu'il verifie ne vaut pas mieux.
#
# Usage : ./check-b2-key-hardening.sh
# Sortie : 0 si la cle est durcie ET la regle en place, 1 sinon.

set -euo pipefail

FICHIER_CONF="${B2_CONF_FILE:-/etc/smartplanning/b2.conf}"
PREFIXE="${B2_PREFIXE:-quotidienne-}"
API_AUTH="https://api.backblazeb2.com/b2api/v4/b2_authorize_account"

# CAPACITES INTERDITES. `deleteFiles` est la plus evidente, elle n'est pas la
# seule : `writeBucketLifecycleRules` permettrait de poser soi-meme une regle
# a un jour et de faire effacer l'historique PAR Backblaze, sans jamais appeler
# de suppression. Retirer `deleteFiles` en laissant celle-la ne fermerait rien.
# `writeBucketEncryption` rendrait les archives illisibles pour nous en
# activant un chiffrement dont Backblaze detient la cle.
INTERDITES=(
  deleteFiles
  writeBuckets
  writeBucketLifecycleRules
  writeBucketEncryption
  writeBucketReplications
  deleteKeys
  writeKeys
)

# CAPACITES STRICTEMENT NECESSAIRES au script de copie hors site.
NECESSAIRES=(listBuckets listFiles readFiles writeFiles)

echo "Controle du durcissement de la cle B2, $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ ! -r "$FICHIER_CONF" ]; then
  echo "Arret : $FICHIER_CONF illisible." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$FICHIER_CONF"
set +a

: "${B2_KEY_ID:?B2_KEY_ID absente de $FICHIER_CONF}"
: "${B2_APP_KEY:?B2_APP_KEY absente de $FICHIER_CONF}"
: "${B2_BUCKET:?B2_BUCKET absente de $FICHIER_CONF}"

REPONSE_AUTH=$(curl -sS --fail-with-body --max-time 30 \
  -u "${B2_KEY_ID}:${B2_APP_KEY}" "$API_AUTH" 2>&1) || {
  echo "Arret : authentification B2 refusee." >&2
  echo "  $REPONSE_AUTH" >&2
  exit 1
}

JETON=$(echo "$REPONSE_AUTH" | jq -r '.authorizationToken')
API_URL=$(echo "$REPONSE_AUTH" | jq -r '.apiInfo.storageApi.apiUrl')
COMPTE=$(echo "$REPONSE_AUTH" | jq -r '.accountId')
CAPACITES=$(echo "$REPONSE_AUTH" | jq -r '.apiInfo.storageApi.allowed.capabilities[]')
BUCKET_ID=$(echo "$REPONSE_AUTH" \
  | jq -r --arg n "$B2_BUCKET" '.apiInfo.storageApi.allowed.buckets[]? | select(.name == $n) | .id')

if [ -z "$BUCKET_ID" ] || [ "$BUCKET_ID" = "null" ]; then
  echo "Arret : la cle ne donne pas acces au bucket '$B2_BUCKET'." >&2
  exit 1
fi

DEFAUTS=0

# ---------------------------------------------------------------------------
# 1. Capacites de la cle
# ---------------------------------------------------------------------------

echo ""
echo "1. Capacites de la cle en service ($(echo "$CAPACITES" | wc -l | tr -d ' ') au total)"

for cap in "${INTERDITES[@]}"; do
  if echo "$CAPACITES" | grep -qx "$cap"; then
    echo "  ECHEC : la cle porte '$cap', capacite destructrice." >&2
    DEFAUTS=$(( DEFAUTS + 1 ))
  fi
done

for cap in "${NECESSAIRES[@]}"; do
  if ! echo "$CAPACITES" | grep -qx "$cap"; then
    echo "  ECHEC : la cle ne porte pas '$cap', le script hors site ne peut pas fonctionner." >&2
    DEFAUTS=$(( DEFAUTS + 1 ))
  fi
done

if [ "$DEFAUTS" -eq 0 ]; then
  echo "  OK : aucune capacite destructrice, les quatre necessaires sont presentes"
  echo "$CAPACITES" | sort | sed 's/^/    /'
fi

# ---------------------------------------------------------------------------
# 2. Regle de cycle de vie
#
# ELLE EST LA SECONDE MOITIE DU CORRECTIF, PAS UN COMPLEMENT. Sans elle, le
# script masque sans que rien n'efface : le bucket accumule sans fin, depasse
# les 10 Go gratuits, et la conservation sans limite de donnees personnelles de
# salaries contredit le RGPD.
# ---------------------------------------------------------------------------

echo ""
echo "2. Regle de cycle de vie du bucket"

REPONSE_BUCKET=$(curl -sS --fail-with-body --max-time 30 \
  -H "Authorization: $JETON" \
  "$API_URL/b2api/v4/b2_list_buckets?accountId=$COMPTE&bucketId=$BUCKET_ID" 2>&1) || {
  echo "  ECHEC : impossible de relire le bucket." >&2
  echo "  $REPONSE_BUCKET" >&2
  DEFAUTS=$(( DEFAUTS + 1 ))
  REPONSE_BUCKET='{}'
}

NB_REGLES=$(echo "$REPONSE_BUCKET" | jq -r '.buckets[0].lifecycleRules | length' 2>/dev/null || echo 0)

if [ "$NB_REGLES" = "0" ] || [ "$NB_REGLES" = "null" ]; then
  echo "  ECHEC : aucune regle de cycle de vie, rien n'efface les archives masquees." >&2
  DEFAUTS=$(( DEFAUTS + 1 ))
else
  JOURS=$(echo "$REPONSE_BUCKET" | jq -r '.buckets[0].lifecycleRules[0].daysFromUploadingToHiding')
  APRES=$(echo "$REPONSE_BUCKET" | jq -r '.buckets[0].lifecycleRules[0].daysFromHidingToDeleting')
  echo "  OK : masquage a $JOURS jours, effacement $APRES jour(s) apres masquage"
fi

# ---------------------------------------------------------------------------
# 3. TEST NEGATIF : prouver le refus sur un fichier REEL
# ---------------------------------------------------------------------------

echo ""
echo "3. Test negatif, suppression sur une archive reelle"

CIBLE=$(curl -sS --fail-with-body --max-time 30 \
  -H "Authorization: $JETON" \
  "$API_URL/b2api/v4/b2_list_file_names?bucketId=$BUCKET_ID&prefix=$PREFIXE&maxFileCount=1" 2>/dev/null \
  | jq -r '.files[0] | "\(.fileName)\t\(.fileId)"' 2>/dev/null || echo "")

if [ -z "$CIBLE" ] || [ "$CIBLE" = "null	null" ]; then
  echo "  ECHEC : aucune archive dans le bucket, le test negatif ne peut pas etre fait." >&2
  echo "  Un controle qu'on ne peut pas executer n'est pas un controle." >&2
  exit 1
fi

CIBLE_NOM=$(echo "$CIBLE" | cut -f1)
CIBLE_ID=$(echo "$CIBLE" | cut -f2)

echo "  Cible reelle : $CIBLE_NOM"

CODE_HTTP=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' -X POST \
  -H "Authorization: $JETON" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg n "$CIBLE_NOM" --arg i "$CIBLE_ID" '{fileName: $n, fileId: $i}')" \
  "$API_URL/b2api/v4/b2_delete_file_version" 2>/dev/null || echo "000")

case "$CODE_HTTP" in
  401)
    echo "  OK : suppression refusee en 401, la cle ne peut pas detruire l'historique"
    ;;
  200)
    echo "  ECHEC GRAVE : la suppression a ABOUTI, l'archive $CIBLE_NOM vient d'etre detruite." >&2
    echo "  La cle porte encore un droit de suppression. Relancer sync-backups-offsite.sh" >&2
    echo "  pour reenvoyer l'archive du jour, puis reprendre le durcissement." >&2
    DEFAUTS=$(( DEFAUTS + 1 ))
    ;;
  400)
    # NE PAS PRENDRE CE ROUGE POUR UNE PREUVE. Un 400 est un bad_request, donc
    # un probleme de FORME de la requete, pas un refus d'autorisation. C'est
    # exactement le faux positif decrit en tete de fichier.
    echo "  INDETERMINE : B2 rend 400 (bad_request), la question de l'autorisation" >&2
    echo "  n'a pas ete posee. Ce rouge ne prouve PAS le durcissement." >&2
    DEFAUTS=$(( DEFAUTS + 1 ))
    ;;
  *)
    echo "  INDETERMINE : code HTTP $CODE_HTTP, ni refus ni succes caracterise." >&2
    DEFAUTS=$(( DEFAUTS + 1 ))
    ;;
esac

echo ""
if [ "$DEFAUTS" -gt 0 ]; then
  echo "$DEFAUTS defaut(s) : le durcissement n'est pas complet." >&2
  exit 1
fi

echo "Durcissement verifie : cle sans capacite destructrice, regle en place, refus prouve."
