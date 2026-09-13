#!/usr/bin/env bash
#
# Remplace la cle Backblaze B2 en service par une cle sans droit de destruction
# (SP-597)
#
# CE QU'IL FERME. SP-594 a mis les sauvegardes hors du VPS, mais la cle
# applicative qui y vit porte `deleteFiles` sur `smartplanning-backups`. Un
# rancongiciel qui prend la machine chiffre la base, puis se sert de cette cle
# pour effacer les copies distantes : le dispositif hors site devient inutile
# exactement au moment ou il servirait.
#
# POURQUOI UN SCRIPT ET NON LA CONSOLE. Le formulaire de creation de Backblaze
# n'offre que trois prereglages, « Read and Write », « Read Only » et « Write
# Only », et AUCUNE page de sa documentation ne dit quelles capacites chacun
# accorde. Mesure du 13 septembre 2026 : la cle en service, creee en « Read and
# Write », porte DIX-HUIT capacites. « Write Only » retirerait `readFiles` et
# `listFiles`, dont le script hors site a besoin pour verifier les empreintes et
# pour restaurer : le durcissement casserait la sauvegarde, ce qui est pire que
# le risque ferme.
#
# Deviner demanderait un essai et une cle morte a chaque fois. `b2_create_key`
# nomme les capacites une par une, c'est la seule voie exacte.
#
# CE QU'IL RETIRE, ET POURQUOI PAS SEULEMENT `deleteFiles`. Trois autres
# capacites de la cle actuelle detruisent aussi bien, par un chemin different :
#
#   writeBucketLifecycleRules  poser soi-meme une regle a un jour et faire
#                              effacer l'historique PAR Backblaze, sans jamais
#                              appeler de suppression
#   writeBucketEncryption      activer un chiffrement dont Backblaze detient la
#                              cle, rendant les archives illisibles pour NOUS
#   writeBuckets               changer le bucket sous le script
#
# Retirer `deleteFiles` en laissant celles-la ne fermerait rien.
#
# LE SECRET NE TRANSITE PAR AUCUNE CONVERSATION NI AUCUNE LIGNE DE COMMANDE. La
# cle maitresse est LUE depuis un fichier 600 root, jamais passee en argument :
# tout `ps` la lirait. La nouvelle cle applicative est ecrite directement dans
# b2.conf sans etre affichee. La maitresse est effacee au `shred` en fin de
# course, y compris si le script echoue.
#
# ORDRE IMPOSE, ET IL COMPTE. La regle de cycle de vie du bucket doit exister
# AVANT la bascule : sans elle, le script hors site masque sans que rien
# n'efface, le bucket accumule sans fin et la conservation sans limite de
# donnees de salaries contredirait le RGPD. Le script refuse de basculer si la
# regle manque.
#
# CE QU'IL NE FAIT PAS. Il ne revoque pas l'ancienne cle. La revocation se fait
# depuis la console Backblaze et SE VERIFIE ensuite : retirer une valeur d'un
# fichier ne la desactive pas, et elle est deja passee par un historique de
# session. Le script rappelle le geste et laisse l'ancien keyID en clair pour
# le retrouver dans la console.
#
# Usage : sudo ./rotate-b2-key.sh
#         sudo B2_MASTER_FILE=/chemin/autre ./rotate-b2-key.sh
# Sortie : 0 si la nouvelle cle est en service ET prouvee, 1 sinon.

set -euo pipefail

FICHIER_CONF="${B2_CONF_FILE:-/etc/smartplanning/b2.conf}"
FICHIER_MAITRESSE="${B2_MASTER_FILE:-/etc/smartplanning/master.key}"
NOM_NOUVELLE_CLE="${B2_KEY_NAME:-smartplanning-vps-sp597}"
API_AUTH="https://api.backblazeb2.com/b2api/v4/b2_authorize_account"

# LES QUATRE SEULES CAPACITES DONT LE SCRIPT HORS SITE A BESOIN.
#   listBuckets  resoudre le bucketId depuis la reponse d'authentification
#   listFiles    relire la liste distante pour verifier l'envoi et la rotation
#   readFiles    relire taille et empreinte, et RESTAURER
#   writeFiles   envoyer, et masquer via b2_hide_file
CAPACITES="listBuckets,listFiles,readFiles,writeFiles"

echo "Rotation de la cle B2, $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---------------------------------------------------------------------------
# Effacement garanti de la cle maitresse
#
# LE PIEGE SERAIT DE N'EFFACER QU'EN FIN DE CHEMIN NOMINAL. Un `exit 1` au
# milieu laisserait la cle maitresse sur le disque, c'est-a-dire exactement le
# secret le plus large du compte, sur la machine qu'on cherche a ne plus faire
# confiance. Le piege est pose avant tout ce qui peut echouer.
# ---------------------------------------------------------------------------

effacer_maitresse() {
  if [ -f "$FICHIER_MAITRESSE" ]; then
    shred -u "$FICHIER_MAITRESSE" 2>/dev/null \
      || { rm -f "$FICHIER_MAITRESSE"; echo "  (shred indisponible, efface par rm)" >&2; }
    echo "  Cle maitresse effacee de $FICHIER_MAITRESSE"
  fi
}
trap effacer_maitresse EXIT

# ---------------------------------------------------------------------------
# Gardes d'entree
# ---------------------------------------------------------------------------

if [ ! -r "$FICHIER_CONF" ]; then
  echo "Arret : $FICHIER_CONF illisible." >&2
  exit 1
fi

if [ ! -r "$FICHIER_MAITRESSE" ]; then
  echo "Arret : $FICHIER_MAITRESSE illisible, cle maitresse absente." >&2
  echo "" >&2
  echo "  La creer depuis la console Backblaze (App Keys, Master Application Key)," >&2
  echo "  puis la deposer SANS qu'elle passe par un affichage intermediaire :" >&2
  echo "" >&2
  printf '    pbpaste | tr -d '"'"'\\n'"'"' | ssh smartplanning \\\n' >&2
  echo "      \"sudo tee $FICHIER_MAITRESSE >/dev/null && sudo chmod 600 $FICHIER_MAITRESSE\"" >&2
  echo "" >&2
  echo "  Format attendu : deux lignes, keyID puis applicationKey, ou" >&2
  echo "  B2_MASTER_KEY_ID=... et B2_MASTER_KEY=... " >&2
  exit 1
fi

# LE FICHIER DOIT ETRE EN 600. Mesure LS-223 : le fichier depose etait en 644,
# donc lisible par tout compte du serveur, y compris `deploy` et l'utilisateur
# du conteneur. Un secret d'administration lisible par le service qu'il protege
# annule l'interet de l'avoir sorti du .env.
DROITS=$(stat -c %a "$FICHIER_MAITRESSE" 2>/dev/null || stat -f %Lp "$FICHIER_MAITRESSE" 2>/dev/null || echo "?")
if [ "$DROITS" != "600" ]; then
  echo "Arret : $FICHIER_MAITRESSE est en $DROITS, attendu 600." >&2
  echo "  sudo chmod 600 $FICHIER_MAITRESSE" >&2
  exit 1
fi

command -v jq >/dev/null || { echo "Arret : jq absent." >&2; exit 1; }

set -a
# shellcheck disable=SC1090
. "$FICHIER_CONF"
set +a

: "${B2_KEY_ID:?B2_KEY_ID absente de $FICHIER_CONF}"
: "${B2_APP_KEY:?B2_APP_KEY absente de $FICHIER_CONF}"
: "${B2_BUCKET:?B2_BUCKET absente de $FICHIER_CONF}"

ANCIEN_KEY_ID="$B2_KEY_ID"

# ---------------------------------------------------------------------------
# Lecture de la cle maitresse
#
# DEUX FORMATS ACCEPTES, parce que la console presente le keyID et la cle sur
# deux lignes et que les recopier en `VARIABLE=valeur` est une occasion de plus
# d'introduire un sosie visuel. Le piege de la mise en service du 10 septembre
# 2026 reste vif : `K003` etait devenu `ЧKOO`, un Tche cyrillique et deux
# lettres O a la place des zeros.
# ---------------------------------------------------------------------------

if grep -q '^B2_MASTER_KEY_ID=' "$FICHIER_MAITRESSE" 2>/dev/null; then
  MASTER_ID=$(grep '^B2_MASTER_KEY_ID=' "$FICHIER_MAITRESSE" | head -1 | cut -d= -f2- | tr -d '\r\n "'"'")
  MASTER_KEY=$(grep '^B2_MASTER_KEY=' "$FICHIER_MAITRESSE" | head -1 | cut -d= -f2- | tr -d '\r\n "'"'")
else
  MASTER_ID=$(sed -n '1p' "$FICHIER_MAITRESSE" | tr -d '\r\n "'"'")
  MASTER_KEY=$(sed -n '2p' "$FICHIER_MAITRESSE" | tr -d '\r\n "'"'")
fi

if [ -z "$MASTER_ID" ] || [ -z "$MASTER_KEY" ]; then
  echo "Arret : cle maitresse illisible, keyID ou applicationKey manquant." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 1. La regle de cycle de vie doit exister AVANT la bascule
# ---------------------------------------------------------------------------

echo ""
echo "1. Regle de cycle de vie du bucket, prealable a la bascule"

AUTH_ANCIENNE=$(curl -sS --fail-with-body --max-time 30 \
  -u "${ANCIEN_KEY_ID}:${B2_APP_KEY}" "$API_AUTH" 2>&1) || {
  echo "Arret : la cle actuellement en service ne s'authentifie pas." >&2
  echo "  $AUTH_ANCIENNE" >&2
  exit 1
}

JETON_A=$(echo "$AUTH_ANCIENNE" | jq -r '.authorizationToken')
URL_A=$(echo "$AUTH_ANCIENNE" | jq -r '.apiInfo.storageApi.apiUrl')
COMPTE=$(echo "$AUTH_ANCIENNE" | jq -r '.accountId')
BUCKET_ID=$(echo "$AUTH_ANCIENNE" \
  | jq -r --arg n "$B2_BUCKET" '.apiInfo.storageApi.allowed.buckets[]? | select(.name == $n) | .id')

if [ -z "$BUCKET_ID" ] || [ "$BUCKET_ID" = "null" ]; then
  echo "Arret : la cle en service ne donne pas acces a '$B2_BUCKET'." >&2
  exit 1
fi

REGLES=$(curl -sS --fail-with-body --max-time 30 \
  -H "Authorization: $JETON_A" \
  "$URL_A/b2api/v4/b2_list_buckets?accountId=$COMPTE&bucketId=$BUCKET_ID" 2>/dev/null \
  | jq -r '.buckets[0].lifecycleRules | length' 2>/dev/null || echo 0)

if [ "$REGLES" = "0" ] || [ "$REGLES" = "null" ]; then
  echo "Arret : aucune regle de cycle de vie sur '$B2_BUCKET'." >&2
  echo "" >&2
  echo "  Basculer maintenant retirerait le droit de supprimer SANS que rien" >&2
  echo "  n'efface a la place : le bucket accumulerait sans fin. Poser la regle" >&2
  echo "  d'abord, puis relancer." >&2
  exit 1
fi

echo "  OK : $REGLES regle(s) en place, l'effacement reel est assure cote Backblaze"

# ---------------------------------------------------------------------------
# 2. Creation de la cle restreinte
# ---------------------------------------------------------------------------

echo ""
echo "2. Creation de la cle restreinte, capacites nommees une par une"

AUTH_MAITRESSE=$(curl -sS --fail-with-body --max-time 30 \
  -u "${MASTER_ID}:${MASTER_KEY}" "$API_AUTH" 2>&1) || {
  echo "Arret : la cle maitresse ne s'authentifie pas." >&2
  echo "$AUTH_MAITRESSE" \
    | jq -r 'if (.message // "") != "" then .message elif (.code // "") != "" then .code else tostring end' 2>/dev/null \
    | sed 's/^/  /' >&2
  echo "  Verifier qu'elle a ete collee sans affichage intermediaire." >&2
  exit 1
}

if ! echo "$AUTH_MAITRESSE" | jq -e '.apiInfo.storageApi.capabilities | index("writeKeys")' >/dev/null 2>&1; then
  echo "Arret : cette cle ne porte pas writeKeys, ce n'est pas une cle maitresse." >&2
  echo "  Une cle applicative ne peut pas en creer une autre." >&2
  exit 1
fi

JETON_M=$(echo "$AUTH_MAITRESSE" | jq -r '.authorizationToken')
URL_M=$(echo "$AUTH_MAITRESSE" | jq -r '.apiInfo.storageApi.apiUrl')

# EN API v4 LE PARAMETRE EST `bucketIds`, UNE LISTE. `bucketId` au singulier
# rend un 400 : « The bucketId parameter has been deprecated in favor of
# bucketIds list ». Mesure LS-223, et c'est `--fail-with-body` qui permet de
# LIRE ce message : `--fail` seul ne montrerait que « error: 400 ».
CORPS=$(jq -nc \
  --arg a "$COMPTE" \
  --arg n "$NOM_NOUVELLE_CLE" \
  --arg c "$CAPACITES" \
  --arg b "$BUCKET_ID" \
  '{accountId: $a, keyName: $n, capabilities: ($c | split(",")), bucketIds: [$b]}')

REPONSE_CLE=$(curl -sS --fail-with-body --max-time 30 -X POST \
  -H "Authorization: $JETON_M" \
  -H "Content-Type: application/json" \
  -d "$CORPS" \
  "$URL_M/b2api/v4/b2_create_key" 2>&1) || {
  echo "Arret : creation de la cle refusee." >&2
  echo "$REPONSE_CLE" \
    | jq -r 'if (.message // "") != "" then .message elif (.code // "") != "" then .code else tostring end' 2>/dev/null \
    | sed 's/^/  /' >&2
  exit 1
}

NOUVEAU_ID=$(echo "$REPONSE_CLE" | jq -r '.applicationKeyId // empty')
NOUVELLE_CLE=$(echo "$REPONSE_CLE" | jq -r '.applicationKey // empty')

if [ -z "$NOUVEAU_ID" ] || [ -z "$NOUVELLE_CLE" ]; then
  echo "Arret : reponse de creation sans cle exploitable." >&2
  exit 1
fi

# LA VALEUR N'EST JAMAIS AFFICHEE, seulement son identifiant, qui n'est pas un
# secret et sert a retrouver la cle dans la console.
echo "  Cle creee : $NOUVEAU_ID"
echo "  Capacites demandees : $CAPACITES"

# ---------------------------------------------------------------------------
# 3. Verifier la nouvelle cle AVANT de la mettre en service
#
# CE QUE BACKBLAZE DECLARE N'EST PAS FORCEMENT CE QU'IL APPLIQUE. On relit donc
# les capacites reellement accordees plutot que de supposer que la demande a ete
# honoree telle quelle.
# ---------------------------------------------------------------------------

echo ""
echo "3. Controle de la nouvelle cle avant mise en service"

AUTH_NOUVELLE=$(curl -sS --fail-with-body --max-time 30 \
  -u "${NOUVEAU_ID}:${NOUVELLE_CLE}" "$API_AUTH" 2>&1) || {
  echo "Arret : la nouvelle cle ne s'authentifie pas, b2.conf est laisse INTACT." >&2
  echo "  $AUTH_NOUVELLE" >&2
  exit 1
}

ACCORDEES=$(echo "$AUTH_NOUVELLE" | jq -r '.apiInfo.storageApi.allowed.capabilities[]' | sort | tr '\n' ' ')
echo "  Capacites accordees : $ACCORDEES"

for interdite in deleteFiles writeBuckets writeBucketLifecycleRules writeBucketEncryption writeKeys deleteKeys; do
  if echo "$ACCORDEES" | grep -qw "$interdite"; then
    echo "Arret : la nouvelle cle porte '$interdite', b2.conf est laisse INTACT." >&2
    exit 1
  fi
done

for requise in listBuckets listFiles readFiles writeFiles; do
  if ! echo "$ACCORDEES" | grep -qw "$requise"; then
    echo "Arret : la nouvelle cle ne porte pas '$requise', b2.conf est laisse INTACT." >&2
    exit 1
  fi
done

NOUVEAU_BUCKET=$(echo "$AUTH_NOUVELLE" \
  | jq -r --arg n "$B2_BUCKET" '.apiInfo.storageApi.allowed.buckets[]? | select(.name == $n) | .id')
if [ "$NOUVEAU_BUCKET" != "$BUCKET_ID" ]; then
  echo "Arret : la nouvelle cle ne donne pas acces a '$B2_BUCKET', b2.conf est laisse INTACT." >&2
  exit 1
fi

echo "  OK : quatre capacites, aucune destructrice, bucket correct"

# ---------------------------------------------------------------------------
# 4. Mise en service
#
# SAUVEGARDE DE L'ANCIEN FICHIER, en 600, pour pouvoir revenir en arriere si la
# copie nocturne se revelait cassee. Elle se supprime une fois la revocation
# prouvee, et pas avant : effacer les deux en meme temps laisserait sans recours.
# ---------------------------------------------------------------------------

echo ""
echo "4. Mise en service"

SAUVEGARDE_CONF="${FICHIER_CONF}.avant-sp597"
cp -p "$FICHIER_CONF" "$SAUVEGARDE_CONF"
chmod 600 "$SAUVEGARDE_CONF"
echo "  Ancien fichier conserve : $SAUVEGARDE_CONF"

# ECRITURE PAR FICHIER TEMPORAIRE PUIS `mv`, qui est atomique. Une ecriture en
# place interrompue laisserait un b2.conf tronque, donc une sauvegarde hors site
# morte sans que rien ne le signale avant la nuit suivante.
TEMPORAIRE=$(mktemp)
chmod 600 "$TEMPORAIRE"
{
  echo "B2_KEY_ID=$NOUVEAU_ID"
  echo "B2_APP_KEY=$NOUVELLE_CLE"
  echo "B2_BUCKET=$B2_BUCKET"
} > "$TEMPORAIRE"
mv "$TEMPORAIRE" "$FICHIER_CONF"
chmod 600 "$FICHIER_CONF"
chown root:root "$FICHIER_CONF" 2>/dev/null || true

echo "  $FICHIER_CONF mis a jour, 600 root"

# ---------------------------------------------------------------------------
# 5. Ce qui reste a faire a la main
# ---------------------------------------------------------------------------

echo ""
echo "5. Reste a faire, dans cet ordre"
echo ""
echo "  a. Prouver le durcissement, test negatif sur fichier reel :"
echo "       sudo /opt/smartplanning/ops/check-b2-key-hardening.sh"
echo ""
echo "  b. Prouver que la copie nocturne fonctionne toujours :"
echo "       sudo systemctl start smartplanning-backup-offsite.service"
echo "       sudo journalctl -u smartplanning-backup-offsite.service -n 20 --no-pager"
echo ""
echo "  c. REVOQUER l'ancienne cle depuis la console Backblaze."
echo "     Ancien keyID : $ANCIEN_KEY_ID"
echo "     Retirer une valeur d'un fichier ne la desactive pas : elle est deja"
echo "     passee par un historique de session. La revocation SE VERIFIE,"
echo "     l'ancienne cle devant rendre 401 sur b2_authorize_account."
echo ""
echo "  d. Une fois la revocation prouvee, effacer la sauvegarde :"
echo "       sudo shred -u $SAUVEGARDE_CONF"
echo ""
echo "Termine, $(date -u +%Y-%m-%dT%H:%M:%SZ)"
