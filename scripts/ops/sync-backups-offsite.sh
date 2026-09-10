#!/usr/bin/env bash
#
# Copie hors site des sauvegardes chiffrees, vers Backblaze B2
#
# CE QU'IL FERME. SP-593 a mis en place la sauvegarde quotidienne, chiffree et
# verifiee. Mais tout vivait sur le meme disque : les archives dans
# /var/backups/smartplanning/, la cle qui les dechiffre dans
# /etc/smartplanning/backup.key, et la base elle-meme. Photocopier un document
# et ranger la photocopie dans le meme tiroir ne protege pas de l'incendie du
# tiroir. Une panne disque, un incident OVH ou un chiffrement par rancongiciel
# emportait les trois d'un coup.
#
# Ce script envoie chaque nuit les archives vers un fournisseur DIFFERENT
# d'OVH. C'est le point : un stockage objet OVH aurait couvert le disque mort,
# pas la panne globale du fournisseur.
#
# CE QU'IL NE FAIT PAS. Il ne chiffre rien : les fichiers arrivent deja
# chiffres en AES256 par backup-database.sh, et la passphrase ne quitte jamais
# le VPS. Backblaze ne stocke donc que des octets illisibles pour lui. C'est
# aussi pourquoi le chiffrement cote serveur du bucket doit rester desactive,
# il n'ajouterait qu'une couche dont NOUS ne detenons pas la cle.
#
# POURQUOI L'API NATIVE B2 ET NON S3. L'API S3-compatible impose une signature
# AWS v4, quelques dizaines de lignes de HMAC en shell, donc du code fragile a
# maintenir pour rien. L'API native B2 s'utilise en curl simple. Aucun outil
# supplementaire n'est installe sur le VPS : curl, jq et sha1sum y sont deja,
# verifie le 10 septembre 2026.
#
# RETENTION. 30 jours ici comme sur le VPS. Une copie hors site qui
# s'accumulerait sans fin finirait par depasser les 10 Go gratuits, et la
# conservation sans limite de donnees personnelles de salaries contredirait le
# RGPD.
#
# Usage : ./sync-backups-offsite.sh
# Sortie : 0 si l'envoi est fait ET verifie, 1 sinon.

set -euo pipefail

REP_SAUVEGARDE="${BACKUP_DIR:-/var/backups/smartplanning}"

# IDENTIFIANTS B2, dans un fichier a part, en 0600.
#
# JAMAIS dans le .env de l'application : celui-ci est copie par le CD et lu par
# le conteneur. Une cle d'ecriture sur le stockage de secours n'a rien a faire
# dans un conteneur expose au reseau. Meme raisonnement que la cle de
# chiffrement en SP-593.
FICHIER_CONF="${B2_CONF_FILE:-/etc/smartplanning/b2.conf}"

RETENTION="${RETENTION_JOURS:-30}"
PREFIXE="${B2_PREFIXE:-quotidienne-}"

API_AUTH="https://api.backblazeb2.com/b2api/v4/b2_authorize_account"

echo "Copie hors site des sauvegardes, $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---------------------------------------------------------------------------
# Gardes d'entree
#
# MEME PRINCIPE QUE SP-593 : chaque etape qui ne peut pas conclure arrete le
# script. Un envoi qui echoue en silence recree exactement le defaut que ce
# ticket corrige, un dispositif qui parait proteger et ne protege pas.
# ---------------------------------------------------------------------------

if [ ! -r "$FICHIER_CONF" ]; then
  echo "Arret : $FICHIER_CONF illisible, identifiants B2 introuvables." >&2
  echo "  Attendu : B2_KEY_ID, B2_APP_KEY, B2_BUCKET." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$FICHIER_CONF"
set +a

: "${B2_KEY_ID:?B2_KEY_ID absente de $FICHIER_CONF}"
: "${B2_APP_KEY:?B2_APP_KEY absente de $FICHIER_CONF}"
: "${B2_BUCKET:?B2_BUCKET absente de $FICHIER_CONF}"

if [ ! -d "$REP_SAUVEGARDE" ]; then
  echo "Arret : $REP_SAUVEGARDE n'existe pas, rien a envoyer." >&2
  exit 1
fi

# LA PLUS RECENTE, et non toutes : ce script tourne apres la sauvegarde du
# jour. Les precedentes sont deja hors site, les renvoyer couterait des appels
# d'API pour rien.
#
# LE NOM PORTE L'HORODATAGE (quotidienne-AAAAMMJJ-HHMMSS), donc un tri
# lexicographique suffit et donne le meme resultat qu'un tri par date de
# modification. On evite ainsi `find -printf`, absent du find BSD : le script
# tourne sur Ubuntu, mais il doit rester eprouvable hors ligne sur un Mac, et
# un garde-fou qu'on ne peut pas tester est un garde-fou qu'on ne teste pas.
DERNIERE=$(find "$REP_SAUVEGARDE" -maxdepth 1 -name "${PREFIXE}*.dump.gpg" 2>/dev/null \
  | sort | tail -1)

if [ -z "$DERNIERE" ]; then
  echo "Arret : aucune archive ${PREFIXE}*.dump.gpg dans $REP_SAUVEGARDE." >&2
  exit 1
fi

NOM=$(basename "$DERNIERE")
TAILLE=$(wc -c < "$DERNIERE" | tr -d ' ')

if [ "$TAILLE" -lt 1024 ]; then
  echo "Arret : $NOM ne fait que $TAILLE octets, archive suspecte." >&2
  exit 1
fi

# UNE ARCHIVE DU JOUR, PAS UNE VIEILLE. Si backup-database.sh a cesse de
# tourner, la plus recente peut dater de plusieurs jours : ce script
# l'enverrait sans broncher et le hors-site paraitrait sain alors que la
# sauvegarde locale est morte. On refuse au-dela de 48 h, ce qui laisse passer
# un decalage d'horaire ou un timer rejoue tard, mais pas un arret reel.
# `stat -c` est GNU, `stat -f` est BSD : on prend celui qui repond, pour la
# meme raison de testabilite que le tri ci-dessus.
if MODIF=$(stat -c %Y "$DERNIERE" 2>/dev/null); then
  :
elif MODIF=$(stat -f %m "$DERNIERE" 2>/dev/null); then
  :
else
  echo "Arret : impossible de lire la date de $NOM." >&2
  exit 1
fi

AGE_S=$(( $(date +%s) - MODIF ))
if [ "$AGE_S" -gt 172800 ]; then
  echo "Arret : $NOM date de $(( AGE_S / 3600 )) h, la sauvegarde locale a cesse." >&2
  echo "  Verifier smartplanning-backup.timer avant de relancer." >&2
  exit 1
fi

echo "  Archive : $NOM, $TAILLE octets"

# ---------------------------------------------------------------------------
# Authentification
#
# Le jeton vaut 24 h, on en prend un neuf a chaque execution : le script
# tourne une fois par jour, mettre un cache en place couterait plus de code que
# l'appel qu'il economise.
# ---------------------------------------------------------------------------

# Le -u de curl construit lui-meme l'en-tete Basic : les identifiants ne
# passent donc pas par la ligne de commande d'un autre processus.
REPONSE_AUTH=$(curl -sS --max-time 30 -u "${B2_KEY_ID}:${B2_APP_KEY}" "$API_AUTH" 2>&1) || {
  echo "Arret : appel d'authentification B2 impossible." >&2
  echo "  $REPONSE_AUTH" >&2
  exit 1
}

if ! echo "$REPONSE_AUTH" | jq -e '.authorizationToken' >/dev/null 2>&1; then
  echo "Arret : authentification B2 refusee." >&2
  # B2 RENVOIE UN `message` VIDE SUR `bad_auth_token`, mesure le
  # 10 septembre 2026 : n'afficher que `.message` ne montrait donc RIEN, et le
  # diagnostic devenait impossible depuis le journal. On retombe sur `.code`,
  # puis sur la reponse entiere. Aucun des deux ne contient la cle.
  echo "$REPONSE_AUTH" \
    | jq -r 'if (.message // "") != "" then .message elif (.code // "") != "" then .code else tostring end' 2>/dev/null \
    | sed 's/^/  /' >&2

  # AIDE AU DIAGNOSTIC SANS REVELER LE SECRET. La premiere mise en service a
  # bute sur une cle collee depuis un rendu visuel, ou `K003` etait devenu
  # `ЧKOO` : un caractere cyrillique et deux lettres O a la place des zeros.
  # Invisible a l'oeil, et la longueur seule ne suffisait pas a le voir.
  LONGUEUR=${#B2_APP_KEY}
  # LA CLE EST EN BASE64 : `/` et `+` y sont legitimes, ne pas les signaler.
  # Seuls comptent les caracteres hors de cet alphabet, typiquement du
  # cyrillique ou une ponctuation typographique introduite par un copier-coller
  # depuis un rendu visuel. Premier defaut de mise en service, 10 septembre
  # 2026 : `K003` etait devenu `ЧKOO`, un Tche cyrillique suivi de deux lettres
  # O a la place des zeros.
  HORS_BASE64=$(printf '%s' "$B2_APP_KEY" | tr -d 'A-Za-z0-9+/=' | wc -c | tr -d ' ')
  if [ "$LONGUEUR" -ne 31 ] || [ "$HORS_BASE64" -ne 0 ] || [ "${B2_APP_KEY:0:1}" != "K" ]; then
    echo "  Indice de forme : une cle applicative B2 fait 31 caracteres base64" >&2
    echo "  (lettres, chiffres, + et /) et commence par K. Ici : $LONGUEUR caracteres," >&2
    echo "  dont $HORS_BASE64 hors base64, commencant par '${B2_APP_KEY:0:1}'." >&2
  else
    echo "  La cle a une forme valide : le refus vient donc de sa VALEUR." >&2
    echo "  Des sosies visuels (O pour 0, l pour 1) survivent a un controle de" >&2
    echo "  forme. La recopier depuis le gestionnaire de mots de passe, sans" >&2
    echo "  passer par un affichage intermediaire." >&2
  fi
  exit 1
fi

JETON=$(echo "$REPONSE_AUTH" | jq -r '.authorizationToken')
API_URL=$(echo "$REPONSE_AUTH" | jq -r '.apiInfo.storageApi.apiUrl')

# LE bucketId VIENT DE LA REPONSE D'AUTHENTIFICATION, pas d'une valeur ecrite
# en dur. La cle d'application etant restreinte a un seul bucket, B2 le renvoie
# dans allowed.buckets. Si la cle etait plus large, on le resoudrait par son
# nom ; ici, une divergence entre le bucket autorise et B2_BUCKET est une
# erreur de configuration qu'il vaut mieux voir tout de suite.
BUCKET_ID=$(echo "$REPONSE_AUTH" \
  | jq -r --arg n "$B2_BUCKET" '.apiInfo.storageApi.allowed.buckets[]? | select(.name == $n) | .id')

if [ -z "$BUCKET_ID" ] || [ "$BUCKET_ID" = "null" ]; then
  echo "Arret : la cle B2 ne donne pas acces au bucket '$B2_BUCKET'." >&2
  echo "  Buckets autorises :" >&2
  echo "$REPONSE_AUTH" | jq -r '.apiInfo.storageApi.allowed.buckets[]?.name // "(aucun, cle non restreinte)"' \
    | sed 's/^/    /' >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Envoi
# ---------------------------------------------------------------------------

REPONSE_URL=$(curl -sS --max-time 30 \
  -H "Authorization: $JETON" \
  "$API_URL/b2api/v4/b2_get_upload_url?bucketId=$BUCKET_ID" 2>&1) || {
  echo "Arret : impossible d'obtenir une URL d'envoi." >&2
  echo "  $REPONSE_URL" >&2
  exit 1
}

URL_ENVOI=$(echo "$REPONSE_URL" | jq -r '.uploadUrl // empty')
JETON_ENVOI=$(echo "$REPONSE_URL" | jq -r '.authorizationToken // empty')

if [ -z "$URL_ENVOI" ] || [ -z "$JETON_ENVOI" ]; then
  echo "Arret : URL d'envoi non obtenue." >&2
  echo "$REPONSE_URL" | jq -r '.message // .' 2>/dev/null | sed 's/^/  /' >&2
  exit 1
fi

# LE SHA1 EST CALCULE LOCALEMENT ET VERIFIE PAR B2 A LA RECEPTION. Un transfert
# tronque est donc rejete par le serveur, pas accepte silencieusement. C'est la
# difference entre « envoye » et « arrive intact », meme distinction qu'entre
# un email accepte par le relais et un email delivre (SP-579).
SHA1=$(sha1sum "$DERNIERE" | cut -d' ' -f1)

echo "  Envoi vers b2://$B2_BUCKET/$NOM"

REPONSE_ENVOI=$(curl -sS --max-time 300 \
  -H "Authorization: $JETON_ENVOI" \
  -H "X-Bz-File-Name: $NOM" \
  -H "Content-Type: application/octet-stream" \
  -H "Content-Length: $TAILLE" \
  -H "X-Bz-Content-Sha1: $SHA1" \
  --data-binary "@$DERNIERE" \
  "$URL_ENVOI" 2>&1) || {
  echo "Arret : l'envoi a echoue." >&2
  echo "  $REPONSE_ENVOI" >&2
  exit 1
}

FICHIER_ID=$(echo "$REPONSE_ENVOI" | jq -r '.fileId // empty')
if [ -z "$FICHIER_ID" ]; then
  echo "Arret : envoi refuse par B2." >&2
  echo "$REPONSE_ENVOI" | jq -r '.message // .' 2>/dev/null | sed 's/^/  /' >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Verification APRES envoi
#
# LE CRITERE D'ACCEPTATION DU TICKET EST EXPLICITE : verifier la copie hors
# site, pas seulement l'envoi. Un code 200 dit que la requete a abouti, pas que
# le fichier est lisible et complet cote B2. On relit donc la liste distante et
# on compare taille et empreinte a ce qu'on a envoye.
# ---------------------------------------------------------------------------

REPONSE_LISTE=$(curl -sS --max-time 30 \
  -H "Authorization: $JETON" \
  "$API_URL/b2api/v4/b2_list_file_names?bucketId=$BUCKET_ID&prefix=$PREFIXE&maxFileCount=1000" 2>&1) || {
  echo "Arret : impossible de relire la liste distante." >&2
  echo "  $REPONSE_LISTE" >&2
  exit 1
}

DISTANT=$(echo "$REPONSE_LISTE" | jq -r --arg n "$NOM" \
  '.files[]? | select(.fileName == $n) | "\(.contentLength) \(.contentSha1)"' | head -1)

if [ -z "$DISTANT" ]; then
  echo "Arret : $NOM absent du bucket apres envoi." >&2
  exit 1
fi

TAILLE_DISTANTE=$(echo "$DISTANT" | cut -d' ' -f1)
SHA1_DISTANT=$(echo "$DISTANT" | cut -d' ' -f2)

if [ "$TAILLE_DISTANTE" != "$TAILLE" ]; then
  echo "Arret : taille distante $TAILLE_DISTANTE, attendue $TAILLE." >&2
  exit 1
fi

if [ "$SHA1_DISTANT" != "$SHA1" ]; then
  echo "Arret : empreinte distante $SHA1_DISTANT, attendue $SHA1." >&2
  exit 1
fi

echo "  Verifie hors site : $TAILLE_DISTANTE octets, sha1 concordant"

# ---------------------------------------------------------------------------
# Rotation distante
#
# La rotation ne fait pas echouer le script : la copie du jour est faite et
# verifiee, c'est ce qui compte. Un echec de menage se signale sans annuler le
# travail utile.
# ---------------------------------------------------------------------------

LIMITE_MS=$(( ($(date +%s) - RETENTION * 86400) * 1000 ))
SUPPRIMES=0
ECHECS=0

while read -r ancien_nom ancien_id; do
  [ -z "$ancien_nom" ] && continue
  if curl -sS --max-time 30 -X POST \
    -H "Authorization: $JETON" \
    -H "Content-Type: application/json" \
    -d "$(jq -nc --arg n "$ancien_nom" --arg i "$ancien_id" '{fileName: $n, fileId: $i}')" \
    "$API_URL/b2api/v4/b2_delete_file_version" >/dev/null 2>&1; then
    SUPPRIMES=$(( SUPPRIMES + 1 ))
  else
    ECHECS=$(( ECHECS + 1 ))
  fi
done < <(echo "$REPONSE_LISTE" | jq -r --argjson lim "$LIMITE_MS" \
  '.files[]? | select(.uploadTimestamp < $lim) | "\(.fileName) \(.fileId)"')

# LE COMPTE SE RELIT, IL NE SE CALCULE PAS. Une premiere version ajoutait 1 a
# la liste lue apres envoi en supposant que le nouveau fichier n'y figurait pas
# encore : il y etait deja, et le script annoncait « environ 2 conservees » sur
# un bucket qui n'en contenait qu'une. Sur un dispositif de sauvegarde, un
# compteur approximatif est un compteur qui ment, et c'est precisement ce qu'on
# ne veut pas quand il faudra decider si une restauration est possible.
REPONSE_FINALE=$(curl -sS --max-time 30 \
  -H "Authorization: $JETON" \
  "$API_URL/b2api/v4/b2_list_file_names?bucketId=$BUCKET_ID&prefix=$PREFIXE&maxFileCount=1000" 2>/dev/null) || true

RESTANTES=$(echo "$REPONSE_FINALE" | jq -r '.files | length' 2>/dev/null || echo "?")

echo "  Rotation distante : $SUPPRIMES supprimee(s), $RESTANTES conservee(s) hors site"
if [ "$ECHECS" -gt 0 ]; then
  echo "  Attention : $ECHECS suppression(s) distante(s) en echec, a surveiller." >&2
fi

echo "Termine, $(date -u +%Y-%m-%dT%H:%M:%SZ)"
