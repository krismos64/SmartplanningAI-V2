#!/usr/bin/env bash
#
# Lecture des etapes du tunnel de conversion enregistrees par Umami
#
# Contexte : SP-591 a instrumente les neuf etapes qui vont de la visite au
# paiement. L'instrumentation est deployee depuis le 9 septembre 2026, mais
# aucune etape n'avait jamais ete observee en conditions reelles : au
# 11 septembre 2026, la table `website_event` comptait 3879 lignes et zero
# evenement `funnel-`. Un tunnel jamais parcouru ne prouve rien.
#
# Ce script est l'outil de lecture du parcours de verification. Il se lance
# depuis le poste de developpement, entre chaque etape du parcours, pour voir
# ce qui est reellement arrive en base plutot que de deduire d'un clic qu'un
# evenement est parti.
#
# POURQUOI LIRE LA BASE ET NON LE TABLEAU DE BORD
#
# L'API `/api/send` d'Umami repond HTTP 200 avec `{"beep":"boop"}` et
# n'enregistre rien quand le User-Agent ne ressemble pas a un navigateur : ni
# erreur, ni trace, ni code d'echec. Une reponse acceptee ne prouve donc pas un
# evenement enregistre, et seule la base tranche. Meme famille de piege qu'un
# email accepte par le relais SMTP sans etre delivre.
#
# LE COMPTE N'EST PAS UN TAUX DE CONVERSION
#
# Les etapes 1 a 3 partent du navigateur et ne s'emettent qu'apres acceptation
# du consentement analytics, que la quasi-totalite des visiteurs refuse
# (mesure du 10 septembre 2026 : 401 requetes Nginx et 86 visiteurs distincts
# pour zero session Umami). Les etapes 4 a 9 partent du serveur et voient tout
# le monde. Diviser une etape serveur par une etape navigateur donne donc un
# taux faussement excellent. Le script affiche les deux groupes separement
# pour rendre la confusion difficile.
#
# Usage :
#   scripts/ops/read-funnel-steps.sh              # etat complet du tunnel
#   scripts/ops/read-funnel-steps.sh --depuis 1h  # seulement la derniere heure
#   scripts/ops/read-funnel-steps.sh --detail     # une ligne par evenement
#
# Sortie : 0 si la lecture aboutit, 1 si la base est injoignable.
#
# @ticket SP-591

set -uo pipefail

readonly HOTE_SSH="smartplanning"
readonly CONTENEUR_DB="smartplanning-postgres"
readonly UTILISATEUR_DB="smartplanning"
readonly BASE_DB="umami"

# Intervalle PostgreSQL. Vide signifie « tout l'historique ».
FENETRE=""
DETAIL=0

while [ $# -gt 0 ]; do
  case "$1" in
    --depuis)
      if [ $# -lt 2 ]; then
        echo "ERREUR : --depuis attend une duree, par exemple « 1h » ou « 30 minutes »." >&2
        exit 1
      fi
      FENETRE="$2"
      shift 2
      ;;
    --detail)
      DETAIL=1
      shift
      ;;
    -h | --help)
      sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "ERREUR : argument inconnu « $1 »." >&2
      exit 1
      ;;
  esac
done

# Clause temporelle commune aux requetes. Construite une fois pour que la
# fenetre affichee et la fenetre interrogee ne puissent pas diverger.
if [ -n "$FENETRE" ]; then
  readonly CLAUSE_TEMPS="and created_at >= now() - interval '${FENETRE}'"
  readonly LIBELLE_FENETRE="depuis ${FENETRE}"
else
  readonly CLAUSE_TEMPS=""
  readonly LIBELLE_FENETRE="tout l'historique"
fi

# Execute une requete SQL dans le conteneur PostgreSQL du VPS.
#
# stderr n'est pas redirige vers stdout : une erreur de connexion doit se voir
# comme une erreur, et non se confondre avec un resultat vide. C'est le defaut
# qui a fait lire « zero evenement » a une commande qui echouait en realite sur
# un role PostgreSQL inexistant.
interroger() {
  local requete="$1"
  # SC2029 : l'expansion cote client est voulue, les valeurs interpolees sont
  # des constantes de ce fichier et non des entrees utilisateur.
  # shellcheck disable=SC2029
  ssh "$HOTE_SSH" \
    "docker exec ${CONTENEUR_DB} psql -U ${UTILISATEUR_DB} -d ${BASE_DB} -c \"${requete}\""
}

echo "Tunnel de conversion SmartPlanning, ${LIBELLE_FENETRE}"
echo "Lecture directe de la base umami sur le VPS."
echo

# Le CROSS JOIN sur la liste des etapes attendues fait apparaitre les etapes a
# zero. Un GROUP BY seul ne montrerait que ce qui existe, et une etape muette
# resterait invisible : c'est precisement ce qu'on cherche a voir.
# Le code de sortie est teste directement sur l'affectation : lire `$?` une
# ligne plus loin marche, mais depend d'un ordre fragile qu'une insertion
# anodine casserait sans rien signaler.
if ! LECTURE=$(interroger "
with etapes(rang, nom, chemin) as (values
  (1, 'funnel-cta-click',              'navigateur'),
  (2, 'funnel-signup-start',           'navigateur'),
  (3, 'funnel-signup-complete',        'navigateur'),
  (4, 'funnel-first-team',             'serveur'),
  (5, 'funnel-first-employee',         'serveur'),
  (6, 'funnel-first-schedule',         'serveur'),
  (7, 'funnel-invitation-accepted',    'serveur'),
  (8, 'funnel-checkout-opened',        'serveur'),
  (9, 'funnel-subscription-confirmed', 'serveur')
)
select
  e.rang,
  e.nom            as etape,
  e.chemin,
  count(w.event_id) as vus,
  coalesce(to_char(max(w.created_at), 'DD/MM HH24:MI'), '-') as dernier
from etapes e
left join website_event w
  on w.event_name = e.nom
  ${CLAUSE_TEMPS}
group by e.rang, e.nom, e.chemin
order by e.rang;
"); then
  echo "ERREUR : lecture de la base impossible. Verifier l'acces SSH et le conteneur ${CONTENEUR_DB}." >&2
  exit 1
fi

# Une sortie vide sur une commande reussie signalerait une requete qui ne rend
# rien la ou neuf lignes sont attendues : anomalie, pas resultat.
if [ -z "$LECTURE" ]; then
  echo "ERREUR : la requete a abouti mais n'a rien rendu, alors que neuf etapes sont attendues." >&2
  exit 1
fi

echo "$LECTURE"
echo

if [ "$DETAIL" -eq 1 ]; then
  echo "Detail evenement par evenement :"
  interroger "
    select
      to_char(created_at, 'DD/MM HH24:MI:SS') as horodatage,
      event_name as etape
    from website_event
    where event_name like 'funnel-%'
      ${CLAUSE_TEMPS}
    order by created_at desc
    limit 50;
  "
  echo
fi

# Rappel affiche a chaque execution plutot que range dans une documentation :
# la mauvaise lecture est tentante au moment precis ou on regarde le tableau.
cat <<'RAPPEL'
Lecture :
  Les etapes 1 a 3 dependent du consentement analytics, refuse par la
  quasi-totalite des visiteurs. Leur compte est un plancher, pas un volume.
  Les etapes 4 a 9 partent du serveur et voient tous les comptes.

  Comparer les etapes 4 a 9 entre elles, ou suivre une etape dans le temps.
  Ne jamais diviser une etape serveur par une etape navigateur.
RAPPEL
