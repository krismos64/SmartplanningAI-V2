#!/usr/bin/env bash
#
# Surveillance de l'expiration des certificats TLS servis par smartplanning.fr
#
# Contexte : le 18 aout 2026, le site a servi un certificat expire depuis le
# 23 fevrier, soit pres de six mois sans aucune alerte. Certbot renouvelait
# pourtant correctement : le certificat sur le disque du VPS etait valide.
# Le DNS avait bascule vers le CDN Hostinger, qui presentait son propre
# certificat expire. Un controle portant sur /etc/letsencrypt/ n'aurait rien vu.
#
# Ce script interroge donc le certificat REELLEMENT SERVI en HTTPS, resolution
# DNS publique comprise. C'est le seul point de vue qui correspond a celui du
# visiteur, et le seul qui aurait detecte l'incident.
#
# Sortie : 0 si tous les domaines sont sains, 1 si au moins une alerte est levee.

set -uo pipefail

readonly DOMAINS=(
  "smartplanning.fr"
  "www.smartplanning.fr"
  "analytics.smartplanning.fr"
)

# Seuil d'alerte. Let's Encrypt renouvelle a 30 jours de la fin, une alerte a
# 21 jours laisse donc une semaine de marge avant de devenir urgente, sans
# se declencher a chaque cycle de renouvellement normal.
readonly SEUIL_JOURS="${SEUIL_JOURS:-21}"
readonly ENV_FILE="${ENV_FILE:-/var/www/smartplanning/.env}"
readonly ETAT_DIR="${ETAT_DIR:-/var/lib/smartplanning-tls-check}"
readonly TIMEOUT=15

alertes=()

# Recupere la date d'expiration du certificat servi, en secondes epoch.
# Echoue si le handshake TLS n'aboutit pas, ce qui est en soi une alerte.
lire_expiration() {
  local domaine="$1" cert notafter
  cert=$(echo | timeout "$TIMEOUT" openssl s_client \
    -servername "$domaine" -connect "$domaine:443" 2>/dev/null) || return 1
  [[ -z "$cert" ]] && return 1
  notafter=$(echo "$cert" | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  [[ -z "$notafter" ]] && return 1
  date -d "$notafter" +%s 2>/dev/null
}

# Verifie que le certificat couvre bien le domaine interroge. Un certificat
# valide mais emis pour un autre nom (cas du CDN tiers) doit lever une alerte.
lire_sujet() {
  local domaine="$1"
  echo | timeout "$TIMEOUT" openssl s_client \
    -servername "$domaine" -connect "$domaine:443" 2>/dev/null |
    openssl x509 -noout -subject -ext subjectAltName 2>/dev/null
}

envoyer_alerte() {
  local sujet="$1" corps="$2"

  if [[ ! -r "$ENV_FILE" ]]; then
    echo "ERREUR: $ENV_FILE illisible, alerte non envoyee" >&2
    return 1
  fi

  # Les identifiants restent dans le .env de l'application. Aucun secret
  # n'est duplique ici, et rien n'est passe en argument de ligne de commande
  # (visible dans ps). Tout transite par l'environnement de python3.
  SMTP_HOST=$(grep -oP '^SMTP_HOST=\K.*' "$ENV_FILE" | tr -d '"' | head -1) \
  SMTP_PORT=$(grep -oP '^SMTP_PORT=\K.*' "$ENV_FILE" | tr -d '"' | head -1) \
  SMTP_USER=$(grep -oP '^SMTP_USER=\K.*' "$ENV_FILE" | tr -d '"' | head -1) \
  SMTP_PASSWORD=$(grep -oP '^SMTP_PASSWORD=\K.*' "$ENV_FILE" | tr -d '"' | head -1) \
  SMTP_FROM=$(grep -oP '^SMTP_FROM=\K.*' "$ENV_FILE" | tr -d '"' | head -1) \
  DEST=$(grep -oP '^CONTACT_EMAIL=\K.*' "$ENV_FILE" | tr -d '"' | head -1) \
  SUJET="$sujet" CORPS="$corps" \
  python3 - <<'PYTHON'
import os, smtplib, ssl, sys
from email.message import EmailMessage

msg = EmailMessage()
msg["Subject"] = os.environ["SUJET"]
msg["From"] = os.environ["SMTP_FROM"]
msg["To"] = os.environ["DEST"]
msg.set_content(os.environ["CORPS"])

try:
    with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.environ["SMTP_PORT"]), timeout=30) as s:
        s.starttls(context=ssl.create_default_context())
        s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
        s.send_message(msg)
except Exception as e:
    print(f"ERREUR envoi SMTP: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON
}

maintenant=$(date +%s)

for domaine in "${DOMAINS[@]}"; do
  if ! expiration=$(lire_expiration "$domaine"); then
    alertes+=("$domaine : handshake TLS impossible (port 443 injoignable, DNS casse ou service arrete)")
    continue
  fi

  jours=$(( (expiration - maintenant) / 86400 ))
  fin=$(date -d "@$expiration" "+%d/%m/%Y")

  if (( jours < 0 )); then
    alertes+=("$domaine : certificat EXPIRE depuis $(( -jours )) jours (fin le $fin). Le site est inaccessible pour les visiteurs.")
  elif (( jours <= SEUIL_JOURS )); then
    alertes+=("$domaine : expire dans $jours jours (le $fin)")
  fi

  # Le certificat doit couvrir le nom interroge. Detecte le cas ou un
  # intermediaire tiers presente son propre certificat, valide mais etranger.
  if ! lire_sujet "$domaine" | grep -qi -- "$domaine"; then
    alertes+=("$domaine : le certificat servi ne couvre pas ce domaine. Un intermediaire (CDN, proxy) repond peut-etre a la place du VPS.")
  fi
done

if (( ${#alertes[@]} == 0 )); then
  echo "$(date '+%Y-%m-%d %H:%M:%S') OK, tous les certificats sont valides au-dela de $SEUIL_JOURS jours"
  # L'etat sain efface la trace d'anti-repetition : une nouvelle degradation
  # redeclenchera donc un envoi immediat.
  rm -f "$ETAT_DIR/derniere-alerte" 2>/dev/null
  exit 0
fi

corps="Surveillance TLS de smartplanning.fr, $(date '+%d/%m/%Y a %H:%M').

Anomalies detectees :

$(printf '  - %s\n' "${alertes[@]}")

Verifications utiles :

  Certificat reellement servi
    echo | openssl s_client -servername smartplanning.fr \\
      -connect smartplanning.fr:443 2>/dev/null | openssl x509 -noout -dates

  Certificat sur le disque du VPS
    sudo certbot certificates

  Resolution DNS publique (doit renvoyer 51.77.146.72)
    dig +short smartplanning.fr A

Si les deux premieres commandes divergent, le trafic ne parvient pas au VPS :
verifier le DNS avant de toucher a certbot. C'est ce qui s'est produit le
18 aout 2026.

Message automatique de $(hostname), script scripts/ops/check-tls-expiry.sh"

# Anti-repetition : une seule alerte par periode de 24 h, pour qu'une panne
# durable ne genere pas un email par execution. Un changement du contenu de
# l'alerte force en revanche un nouvel envoi.
mkdir -p "$ETAT_DIR"
signature=$(printf '%s\n' "${alertes[@]}" | sha256sum | cut -d' ' -f1)
trace="$ETAT_DIR/derniere-alerte"

if [[ -f "$trace" ]]; then
  precedente=$(cut -d' ' -f1 "$trace")
  horodatage=$(cut -d' ' -f2 "$trace")
  if [[ "$precedente" == "$signature" ]] && (( maintenant - horodatage < 86400 )); then
    echo "$(date '+%Y-%m-%d %H:%M:%S') alerte identique deja envoyee il y a moins de 24 h, envoi supprime"
    printf '%s\n' "${alertes[@]}" >&2
    exit 1
  fi
fi

if envoyer_alerte "[SmartPlanning] Alerte certificat TLS" "$corps"; then
  echo "$signature $maintenant" > "$trace"
  echo "$(date '+%Y-%m-%d %H:%M:%S') alerte envoyee"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') ECHEC de l'envoi de l'alerte" >&2
fi

printf '%s\n' "${alertes[@]}" >&2
exit 1
