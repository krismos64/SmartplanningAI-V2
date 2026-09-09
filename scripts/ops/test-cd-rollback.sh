#!/usr/bin/env bash
#
# Test du comportement de deploiement du CD, sans VPS
#
# Contexte : jusqu'a SP-588, le script de deploiement de .github/workflows/cd.yml
# se terminait ainsi quand le healthcheck echouait 30 fois de suite :
#
#     echo "Healthcheck timeout apres 150s"
#     echo "Deploiement termine (avec warnings)"
#
# Le job continuait, et l'etape suivante ecrivait « Deploiement reussi » dans le
# resume GitHub. Un conteneur qui ne demarrait jamais devenait donc la version de
# production, annoncee comme un succes, sans aucune alerte ni retour arriere.
#
# CE QUE FAIT CE SCRIPT
#
# Il extrait le corps du heredoc DEPLOY_SCRIPT depuis le workflow lui-meme, donc
# le code reellement deploye et non une copie qui se perimerait, puis le rejoue
# avec des `docker`, `curl` et `sleep` simules. Quatre scenarios sont couverts :
#
#   1. healthcheck OK             -> sortie 0, une seule recreation, pas de rollback
#   2. healthcheck en echec       -> sortie 1, rollback vers le tag precedent
#   3. rollback en echec aussi    -> sortie 1, message d'intervention manuelle
#   4. premier deploiement        -> sortie 1, aucune tentative de rollback
#
# Le scenario 2 verifie le tag exact passe a docker compose, pas seulement le
# fait qu'un rollback ait eu lieu : c'est la difference entre « le rollback a
# tourne » et « le rollback a restaure la bonne version ».
#
# POURQUOI SIMULER PLUTOT QUE DEPLOYER
#
# Prouver ce comportement en conditions reelles demanderait de casser la
# production volontairement. Le defaut vise est une logique de branchement en
# bash, qui se teste integralement hors ligne.
#
# Verifie par mutation le 9 septembre 2026 : rejoue avec l'ancien code, le
# scenario 2 sort en 0 (workflow vert sur une production morte), contre 1 avec
# le code corrige.
#
# Usage : ./scripts/ops/test-cd-rollback.sh
# Sortie : 0 si tous les scenarios passent, 1 sinon.

set -uo pipefail

WORKFLOW="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/.github/workflows/cd.yml"
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

FAILURES=0

pass() { echo "  OK   $1"; }
fail() { echo "  ECHEC $1"; FAILURES=$((FAILURES + 1)); }

# --- Extraction du script de deploiement depuis le workflow ---------------
python3 - "$WORKFLOW" "$WORKDIR/deploy.sh" <<'PY'
import sys, yaml
workflow, out = sys.argv[1], sys.argv[2]
with open(workflow) as f:
    doc = yaml.safe_load(f)
steps = doc['jobs']['deploy']['steps']
step = next(s for s in steps if s.get('name') == 'Deploy to VPS via SSH')
body = step['run'].split("<< 'DEPLOY_SCRIPT'\n", 1)[1].rsplit('DEPLOY_SCRIPT', 1)[0]
with open(out, 'w') as f:
    f.write(body)
PY

if [ ! -s "$WORKDIR/deploy.sh" ]; then
  echo "Impossible d'extraire DEPLOY_SCRIPT depuis $WORKFLOW"
  exit 1
fi

# Le script fait « cd /var/www/smartplanning », qui n'existe pas ici.
mkdir -p "$WORKDIR/root/var/www/smartplanning"
echo "HEALTH_API_KEY=cle-de-test" > "$WORKDIR/root/var/www/smartplanning/.env"
sed "s#cd /var/www/smartplanning#cd $WORKDIR/root/var/www/smartplanning#" \
  "$WORKDIR/deploy.sh" > "$WORKDIR/deploy_local.sh"

# --- Simulations ----------------------------------------------------------
mkdir -p "$WORKDIR/stubs"

# docker : journalise les recreations avec leur IMAGE_TAG, ce qui permet de
# prouver vers quelle version le rollback a bascule.
cat > "$WORKDIR/stubs/docker" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "compose" ] && [[ "$*" == *"force-recreate"* ]]; then
  echo "RECREATE ${IMAGE_TAG:-}" >> "$CALL_LOG"
else
  echo "docker ${1:-}" >> "$CALL_LOG"
fi
if [ "${1:-}" = "inspect" ]; then
  [ "${NO_PREVIOUS:-0}" = "1" ] && exit 1
  echo "ghcr.io/krismos64/smartplanningai-v2:sha-OLD123"
fi
exit 0
STUB

# curl : le code HTTP suit le scenario. FAIL_FIRST_N premiers appels en echec,
# les suivants a OK_CODE, ce qui distingue le healthcheck du deploiement de
# celui qui suit le rollback.
cat > "$WORKDIR/stubs/curl" <<'STUB'
#!/usr/bin/env bash
N=$(cat "$CURL_COUNT" 2>/dev/null || echo 0)
N=$((N + 1))
echo "$N" > "$CURL_COUNT"
if [ "$N" -le "${FAIL_FIRST_N:-0}" ]; then
  echo -n "${FAIL_CODE:-000}"
else
  echo -n "${OK_CODE:-200}"
fi
STUB

# sleep : 30 tentatives a 5 secondes rendraient le test inutilisable.
printf '#!/usr/bin/env bash\nexit 0\n' > "$WORKDIR/stubs/sleep"
chmod +x "$WORKDIR/stubs/docker" "$WORKDIR/stubs/curl" "$WORKDIR/stubs/sleep"

run_scenario() {
  local name="$1" fail_n="$2" ok_code="$3" no_previous="${4:-0}"
  export CALL_LOG="$WORKDIR/calls_$name.log"
  export CURL_COUNT="$WORKDIR/count_$name"
  : > "$CALL_LOG"
  : > "$CURL_COUNT"
  PATH="$WORKDIR/stubs:$PATH" \
  IMAGE_TAG="sha-NEW456" \
  FAIL_FIRST_N="$fail_n" \
  FAIL_CODE="000" \
  OK_CODE="$ok_code" \
  NO_PREVIOUS="$no_previous" \
    bash "$WORKDIR/deploy_local.sh" > "$WORKDIR/out_$name.log" 2>&1
  echo $?
}

echo "Test du deploiement CD (SP-588)"
echo

# --- Scenario 1 : healthcheck OK -----------------------------------------
echo "Scenario 1 : le healthcheck repond 200"
RC=$(run_scenario nominal 0 200)
[ "$RC" -eq 0 ] && pass "sortie 0" || fail "sortie $RC, attendu 0"
if grep -q "Deploiement termine et verifie\|Déploiement terminé et vérifié" "$WORKDIR/out_nominal.log"; then
  pass "succes annonce"
else
  fail "le message de succes est absent"
fi
RECREATES=$(grep -c "RECREATE" "$WORKDIR/calls_nominal.log" || true)
[ "$RECREATES" -eq 1 ] && pass "une seule recreation, pas de rollback" \
  || fail "$RECREATES recreations, attendu 1"

# --- Scenario 2 : healthcheck en echec, rollback qui repond --------------
echo
echo "Scenario 2 : le healthcheck echoue, la version precedente repond"
RC=$(run_scenario rollback 30 200)
[ "$RC" -eq 1 ] && pass "sortie 1, le workflow passe au rouge" || fail "sortie $RC, attendu 1"
if grep -q "RECREATE sha-OLD123" "$WORKDIR/calls_rollback.log"; then
  pass "rollback vers sha-OLD123, le tag capture avant remplacement"
else
  fail "aucune recreation avec le tag precedent"
fi
if grep -q "Deploiement termine et verifie\|Déploiement terminé et vérifié" "$WORKDIR/out_rollback.log"; then
  fail "le message de succes apparait malgre l'echec"
else
  pass "aucun message de succes"
fi
if grep -qi "migrations non annul" "$WORKDIR/out_rollback.log"; then
  pass "la limite sur les migrations est rappelee"
else
  fail "rien ne signale que les migrations restent appliquees"
fi

# --- Scenario 3 : le rollback echoue aussi -------------------------------
echo
echo "Scenario 3 : la version precedente ne repond pas non plus"
RC=$(run_scenario worst 999 000)
[ "$RC" -eq 1 ] && pass "sortie 1" || fail "sortie $RC, attendu 1"
if grep -qi "intervention manuelle" "$WORKDIR/out_worst.log"; then
  pass "intervention manuelle demandee"
else
  fail "aucun appel a une intervention manuelle"
fi

# --- Scenario 4 : premier deploiement ------------------------------------
echo
echo "Scenario 4 : aucun conteneur en place"
RC=$(run_scenario first 30 200 1)
[ "$RC" -eq 1 ] && pass "sortie 1" || fail "sortie $RC, attendu 1"
if grep -q "RECREATE sha-OLD123" "$WORKDIR/calls_first.log"; then
  fail "rollback tente alors qu'aucune version precedente n'existe"
else
  pass "aucun rollback tente"
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  echo "Tous les scenarios passent."
  exit 0
fi
echo "$FAILURES verification(s) en echec."
exit 1
