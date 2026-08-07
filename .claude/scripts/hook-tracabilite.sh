#!/usr/bin/env bash
#
# Hook Stop : verifie les canaux de tracabilite en fin de session.
#
# Pourquoi il existe. Le skill `sprint` enonce la cloture sur cinq canaux :
# depot, journal, Jira, Confluence, memoire. Une consigne ecrite mais non
# verifiee s'erode en silence, chaque oubli ressemblant a un cas isole. Le
# journal precedent en est la preuve : `development-log.md` a cesse d'etre tenu
# au 12 mai 2026 et personne ne l'a vu pendant trois mois.
#
# Ce hook rend deterministe ce qui n'etait qu'une intention. Il couvre deux
# canaux, les seuls verifiables sans appel reseau :
#
#   Journal  une session qui produit des commits doit laisser une entree du
#            jour dans docs/journal/
#   Jira     les cles SP-XXX citees dans les commits du jour sont rappelees,
#            pour qu'aucune ne soit close sans commentaire
#
# Pas d'acces API Jira volontairement. Le verifier reellement exigerait un
# jeton en .env, donc un secret de plus sur un depot public, lu par un hook qui
# bloque justement la lecture des .env. Le rappel par cle de commit couvre le
# cas reel, oublier de commenter un ticket sur lequel on vient de travailler.
#
# Il AVERTIT, il ne bloque pas, et sort toujours en 0 : une session peut
# legitimement s'arreter en cours de travail, et tout travail ne merite pas une
# entree de journal.

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

aujourdhui=$(date +%Y-%m-%d)

# Commits du jour, toutes branches locales. Sans commit, la session n'a rien
# produit qui merite d'etre trace : sortir avant d'avertir sur quoi que ce soit.
commits=$(git log --since="$aujourdhui 00:00" --format="%s" 2>/dev/null)
[ -z "$commits" ] && exit 0
nb=$(printf '%s\n' "$commits" | grep -c . || true)

avertissements=()

# 1. Journal : une entree portant la date du jour
if ! ls docs/journal/"$aujourdhui"-*.md >/dev/null 2>&1; then
    avertissements+=("Journal : aucune entree docs/journal/$aujourdhui-*.md pour $nb commit(s) du jour")
fi

# 2. Jira : cles citees dans les commits du jour
cles=$(printf '%s\n' "$commits" | grep -oE '\bSP-[0-9]+\b' | sort -u | tr '\n' ' ' | sed 's/ $//')
if [ -n "$cles" ]; then
    avertissements+=("Jira : tickets cites aujourd'hui, verifier qu'ils portent l'etat reel : $cles")
fi

[ ${#avertissements[@]} -eq 0 ] && exit 0

{
    echo "TRACABILITE, canaux a verifier avant de clore :"
    for a in "${avertissements[@]}"; do
        echo "  - $a"
    done
    echo
    echo "Le skill sprint porte la cloture complete. Rappel du format d'une"
    echo "entree de journal : docs/journal/README.md."
    echo
    echo "Si la session s'arrete en cours de travail, ou si les commits du jour"
    echo "ne meritent pas d'entree, ignorer cet avertissement et le dire a"
    echo "Christophe plutot que de creer une entree vide."
} >&2

exit 0
