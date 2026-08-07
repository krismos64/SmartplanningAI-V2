#!/usr/bin/env bash
#
# Hook Stop : avertit s'il reste du travail non livre en fin de session.
#
# Pourquoi il existe. Un commit local ne livre rien : la CI ne tourne pas, le CD
# ne se declenche pas, et une fonctionnalite declaree terminee ne l'est pas. Sur
# ce projet un push sans PR ne declenche meme aucun workflow, il faut une PR,
# fut-elle en draft, pour obtenir le retour de la CI.
#
# Ce hook AVERTIT, il ne bloque pas : une session peut legitimement s'arreter en
# cours de travail. Il sort toujours en 0.
#
# Il ecrit sur stderr, lu par l'assistant, pas par l'utilisateur.

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

git rev-parse --git-dir >/dev/null 2>&1 || exit 0

branche=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0
[ "$branche" = "HEAD" ] && exit 0   # detache, hors perimetre

avertissements=()

# 1. Modifications non commitees
if ! git diff --quiet HEAD 2>/dev/null; then
    n=$(git status --porcelain 2>/dev/null | grep -cv '^??' || true)
    [ "${n:-0}" -gt 0 ] && avertissements+=("$n fichier(s) modifie(s) non commite(s)")
fi

# 2. Commits absents de main distante
if git rev-parse --verify origin/main >/dev/null 2>&1; then
    non_livres=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
    if [ "${non_livres:-0}" -gt 0 ]; then
        if [ "$branche" = "main" ]; then
            avertissements+=("$non_livres commit(s) sur main local, non pousses")
        else
            avertissements+=("$non_livres commit(s) sur '$branche' absents de origin/main")
        fi
    fi
fi

[ ${#avertissements[@]} -eq 0 ] && exit 0

{
    echo "TRACABILITE, canal depot non clos :"
    for a in "${avertissements[@]}"; do
        echo "  - $a"
    done
    echo
    echo "Un commit local ne livre rien : sans PR, aucun workflow ne se"
    echo "declenche sur ce projet. Si un travail vient d'etre declare termine,"
    echo "il ne l'est pas : pousser, ouvrir la PR meme en draft, attendre la CI."
    echo
    echo "Rappel du choix projet : les push sont groupes en fin de sprint pour"
    echo "economiser les minutes GitHub Actions. Un travail non pousse en cours"
    echo "de sprint est donc normal, le signaler suffit."
    echo
    echo "Si la session s'arrete volontairement en cours de travail, ignorer cet"
    echo "avertissement et le dire a Christophe."
} >&2

exit 0
