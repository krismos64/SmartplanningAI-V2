#!/usr/bin/env bash
#
# PreToolUse (Read|Edit|Write) : protege les fichiers de secrets.
#
# Un hook qui sort en code 2 bloque l'appel AVANT l'evaluation des regles de
# permission : il prime sur toute regle allow. C'est la couche principale, pas
# un filet de secours.
#
# POLITIQUE
#
#   Fichiers d'environnement (.env et variantes)
#     Ecriture AUTORISEE. Ajouter ou modifier une variable, generer un secret
#     avec openssl : rien de tout cela n'exige de lire l'existant.
#     Lecture BLOQUEE. Une valeur lue entre dans le contexte de l'assistant,
#     donc dans l'historique de session sur disque, et peut ressortir dans une
#     sortie de commande ou un message d'erreur. Pour diagnostiquer, lister les
#     noms de variables suffit.
#
#   Cles privees, certificats, magasins de secrets
#     Lecture ET ecriture BLOQUEES. Une cle privee se genere, elle ne s'edite
#     jamais a la main.
#
#   Fichiers d'exemple (.env.example et variantes)
#     Autorises : ils ne portent que des noms et des formats.
#
#   docs/analytics.credentials.md
#     Bloque en lecture : ce fichier gitignore porte des identifiants de
#     production (VPS, base). Meme raisonnement que pour un .env.
#
# Une regle deny de settings.json ne sait pas distinguer la lecture de
# l'ecriture sur un meme chemin. C'est ce hook qui porte la nuance.

set -u
input=$(cat)

file=$(echo "$input" | jq -r '.tool_input.file_path // ""' 2>/dev/null)
[ -z "$file" ] && exit 0

tool=$(echo "$input" | jq -r '.tool_name // ""' 2>/dev/null)
base=$(basename "$file")

# Comparaisons insensibles a la casse. macOS monte un systeme de fichiers
# insensible a la casse par defaut : ".ENV" et ".env" y designent le meme
# fichier, un motif sensible a la casse se contourne donc en changeant une
# lettre. Les motifs ci-dessous s'appliquent tous a cette forme minuscule.
base_min=$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')
file_min=$(printf '%s' "$file" | tr '[:upper:]' '[:lower:]')

# Fichiers d'exemple : toujours autorises
case "$base_min" in
  .env.example|.env.sample|.env.template|.env.dist) exit 0 ;;
esac

# Cles privees, certificats, magasins de secrets : bloques dans les deux sens
case "$base_min" in
  *.pem|*.key|*.p12|*.pfx|*.jks|*.keystore|*.crt|*.cer|*.der|*.asc|*.gpg|*.ppk|id_rsa*|id_dsa*|id_ecdsa*|id_ed25519*)
    echo "Hook BLOCK: acces refuse a une cle ou un certificat." >&2
    echo "Fichier : $file" >&2
    echo "" >&2
    echo "Lecture et ecriture bloquees. Une cle privee se genere, elle ne" >&2
    echo "s'edite pas a la main : utiliser ssh-keygen ou openssl, dont la" >&2
    echo "sortie va directement dans le fichier sans passer par l'assistant." >&2
    exit 2 ;;
esac

case "$file_min" in
  */secrets/*|*/.secrets/*|*/.ssh/*|*/.gnupg/*|*/.aws/*|*/.config/gcloud/*|*/.kube/*|*/.docker/config.json)
    echo "Hook BLOCK: acces refuse a un repertoire de secrets." >&2
    echo "Fichier : $file" >&2
    exit 2 ;;
esac

# Fichiers de configuration portant couramment des jetons d'authentification
case "$base_min" in
  .npmrc|.netrc|.pgpass|credentials|credentials.json|.git-credentials)
    if [ "$tool" = "Read" ]; then
      echo "Hook BLOCK: ce fichier porte couramment un jeton d'authentification." >&2
      echo "Fichier : $file" >&2
      echo "" >&2
      echo "Lecture bloquee : un jeton lu entrerait dans l'historique de session." >&2
      exit 2
    fi
    exit 0 ;;
esac

# Identifiants de production documentes : lecture bloquee
case "$file_min" in
  *docs/analytics.credentials.md)
    if [ "$tool" = "Read" ]; then
      echo "Hook BLOCK: ce fichier porte des identifiants de production." >&2
      echo "Fichier : $file" >&2
      echo "" >&2
      echo "Les acces VPS et base passent par l'alias SSH configure :" >&2
      echo "  ssh smartplanning" >&2
      echo "Aucune tache ne devrait exiger de lire ces valeurs en clair." >&2
      exit 2
    fi
    exit 0 ;;
esac

# Fichiers d'environnement : ecriture autorisee, lecture bloquee
case "$base_min" in
  .env|.env.*|*.env)
    if [ "$tool" = "Read" ]; then
      echo "Hook BLOCK: lecture refusee sur un fichier d'environnement." >&2
      echo "Fichier : $file" >&2
      echo "" >&2
      echo "L'ECRITURE reste autorisee, seule la lecture des valeurs est" >&2
      echo "bloquee : une valeur lue entrerait dans l'historique de session." >&2
      echo "" >&2
      echo "Alternatives sans lire les valeurs :" >&2
      echo "  Lister les variables definies, sans leur contenu" >&2
      echo "    grep -oE '^[A-Z_]+=' \"$file\"" >&2
      echo "  Verifier qu'une variable est renseignee" >&2
      echo "    grep -qE '^NOM_VARIABLE=.+' \"$file\" && echo presente" >&2
      echo "  Comparer avec le fichier d'exemple" >&2
      echo "    comm -23 <(grep -oE '^[A-Z_]+=' .env.example | sort) \\" >&2
      echo "             <(grep -oE '^[A-Z_]+=' \"$file\" | sort)" >&2
      echo "" >&2
      echo "Si la lecture d'une valeur est reellement necessaire, Christophe" >&2
      echo "peut retirer temporairement ce blocage." >&2
      exit 2
    fi
    exit 0 ;;
esac

exit 0
