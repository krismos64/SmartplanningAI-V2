#!/usr/bin/env bash
#
# Surveillance des ports applicatifs joignables depuis Internet
#
# Contexte : le 8 septembre 2026 (SP-583), smartplanning-app et
# smartplanning-umami repondaient directement sur http://51.77.146.72:3000 et
# :3001, application complete et /api/auth/session compris, en contournant
# Nginx, TLS et la limitation de debit. Un mot de passe saisi par le port 3000
# voyageait en clair.
#
# `ufw status` donnait pourtant ces ports fermes. Docker insere ses regles DNAT
# dans iptables EN AMONT de la chaine d'ufw, donc « -p 3000:3000 » publie sur
# toutes les interfaces et le pare-feu de l'hote ne s'y applique pas.
#
# Le correctif tient a une convention d'ecriture : publier en
# « 127.0.0.1:3000:3000 » plutot qu'en « 3000:3000 ». Rien ne l'impose
# mecaniquement, la chaine DOCKER-USER etant vide sur cette machine. Ce script
# est le filet : il ne previent pas la reapparition du defaut, il la detecte.
#
# POURQUOI VISER L'IP PUBLIQUE ET NON localhost
#
# `curl localhost:3000` repond 200 sur le VPS meme quand le port est
# correctement restreint : c'est precisement la mesure qui ne prouve rien, et
# celle qui avait laisse passer SP-583. Ce script interroge donc l'adresse
# publique de la machine, seul point de vue qui distingue un port restreint
# d'un port ouvert. Verifie par mutation le 9 septembre 2026 : un serveur de
# test ouvert sur 0.0.0.0:3009 a bien ete detecte (200), et les ports
# applicatifs correctement publies repondent « injoignable ».
#
# Sortie : 0 si aucun port n'est expose, 1 si au moins une alerte est levee.

set -uo pipefail

# Ports applicatifs qui ne doivent JAMAIS repondre depuis Internet.
# Nginx est le seul point d'entree : 80 et 443 sont donc absents de cette
# liste, ils doivent au contraire rester ouverts.
#
# 3000 smartplanning-app, 3001 smartplanning-umami, 3002 lune-soleil-app,
# 5432 PostgreSQL, 6379 Redis. Ajouter ici tout nouveau service.
readonly PORTS_INTERDITS=(3000 3001 3002 3003 5432 6379 8080)

# Ports qui doivent au contraire repondre : leur silence est aussi une anomalie,
# le site etant alors hors ligne.
readonly PORTS_ATTENDUS=(80 443)

readonly ENV_FILE="${ENV_FILE:-/var/www/smartplanning/.env}"
readonly ETAT_DIR="${ETAT_DIR:-/var/lib/smartplanning-ports-check}"
readonly TIMEOUT=5

alertes=()

# Adresse publique de la machine. Determinee localement plutot que par un
# service tiers : pas de dependance reseau externe, et le resultat reste juste
# meme si l'IP change.
ip_publique() {
  local iface
  iface=$(ip -o route get 1.1.1.1 2>/dev/null | awk '{print $5; exit}')
  [[ -z "$iface" ]] && return 1
  ip -o -4 addr show "$iface" 2>/dev/null | awk '{print $4}' | cut -d/ -f1 | head -1
}

# Vrai si le port repond sur l'adresse donnee. On ne juge pas du code HTTP :
# toute reponse, meme une erreur applicative, prouve que le port est joignable.
port_repond() {
  local adresse="$1" port="$2"
  timeout "$TIMEOUT" bash -c "</dev/tcp/$adresse/$port" 2>/dev/null
}

envoyer_alerte() {
  local sujet="$1" corps="$2"

  if [[ ! -r "$ENV_FILE" ]]; then
    echo "ERREUR: $ENV_FILE illisible, alerte non envoyee" >&2
    return 1
  fi

  # Meme approche que check-tls-expiry.sh : les identifiants restent dans le
  # .env de l'application, rien n'est duplique ici, et rien ne passe en
  # argument de ligne de commande (visible dans ps).
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

if ! IP=$(ip_publique) || [[ -z "$IP" ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ERREUR: adresse publique indeterminable, controle impossible" >&2
  exit 1
fi

# Garde-fou : si l'adresse trouvee est une boucle locale ou une adresse privee,
# le controle serait faux positif de bout en bout. Mieux vaut echouer bruyamment.
if [[ "$IP" =~ ^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.) ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ERREUR: $IP n'est pas une adresse publique, controle non concluant" >&2
  exit 1
fi

for port in "${PORTS_INTERDITS[@]}"; do
  if port_repond "$IP" "$port"; then
    alertes+=("port $port JOIGNABLE depuis Internet sur $IP, il devrait etre publie sur 127.0.0.1")
  fi
done

# Un port attendu qui ne repond plus signale une panne, pas une exposition.
# Le distinguer evite de confondre les deux dans l'email.
for port in "${PORTS_ATTENDUS[@]}"; do
  if ! port_repond "$IP" "$port"; then
    alertes+=("port $port INJOIGNABLE sur $IP, Nginx est peut-etre arrete")
  fi
done

if (( ${#alertes[@]} == 0 )); then
  echo "$(date '+%Y-%m-%d %H:%M:%S') OK, aucun port applicatif expose sur $IP, 80 et 443 repondent"
  # L'etat sain efface la trace d'anti-repetition : une nouvelle degradation
  # redeclenchera donc un envoi immediat.
  rm -f "$ETAT_DIR/derniere-alerte" 2>/dev/null
  exit 0
fi

corps="Surveillance des ports publics du VPS, $(date '+%d/%m/%Y a %H:%M').

Adresse controlee : $IP

Anomalies detectees :

$(printf '  - %s\n' "${alertes[@]}")

Un port applicatif joignable depuis Internet contourne Nginx, donc TLS et la
limitation de debit. Un mot de passe saisi par ce port voyage en clair.

Verifications utiles, DEPUIS UNE AUTRE MACHINE :

  curl http://$IP:3000
  curl http://$IP:3000/api/auth/session

Sur le VPS, ce qui ecoute reellement sur toutes les interfaces :

  ss -tlnp | grep -E '0\.0\.0\.0|\[::\]'
  docker ps --format '{{.Names}}\t{{.Ports}}'

Correctif : dans le fichier compose du service concerne, publier le port sur la
boucle locale plutot que sur toutes les interfaces.

  ports:
    - '127.0.0.1:3000:3000'   # et non '3000:3000'

Attention, « ufw status » donnera ce port ferme meme quand il repond : Docker
insere ses regles DNAT en amont de la chaine d'ufw. Ne pas s'y fier, et ne
jamais verifier depuis le VPS, ou curl localhost repondra toujours.

C'est l'incident SP-583 du 8 septembre 2026.

Message automatique de $(hostname), script scripts/ops/check-public-ports.sh"

# Anti-repetition : une seule alerte par periode de 24 h, pour qu'une exposition
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

if envoyer_alerte "[SmartPlanning] Port applicatif expose sur Internet" "$corps"; then
  echo "$signature $maintenant" > "$trace"
  echo "$(date '+%Y-%m-%d %H:%M:%S') alerte envoyee"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') ECHEC de l'envoi de l'alerte" >&2
fi

printf '%s\n' "${alertes[@]}" >&2
exit 1
