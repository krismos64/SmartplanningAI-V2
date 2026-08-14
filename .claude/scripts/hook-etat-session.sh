#!/usr/bin/env bash
#
# Hook SessionStart : pose l'etat de depart du projet dans le contexte.
#
# Pourquoi il existe. CLAUDE.md demande de lire la derniere entree de
# docs/journal/ en debut de session, et la memoire repete la consigne. Aucun
# mecanisme ne l'appliquait : chaque session commencait donc soit par trois ou
# quatre appels d'outils pour reconstruire l'etat, soit, quand ils etaient
# sautes, par un travail parti d'un etat perime.
#
# SessionStart a une propriete que les autres hooks n'ont pas : son STDOUT est
# injecte comme contexte visible par l'assistant. Ce que ce script affiche est
# donc lu avant le premier message, sans consommer un seul appel d'outil.
#
# Ce qu'il montre, et pourquoi seulement cela. Le budget est un ecran, pas
# davantage : un hook de demarrage verbeux paie du contexte a chaque session,
# y compris les sessions courtes qui n'en ont aucun usage. Quatre blocs :
#
#   Branche et working tree   ou l'on travaille, et si quelque chose traine
#   Ecart avec origin/main    ce qui est commite mais pas encore livre
#   Derniers commits          la trajectoire recente, en une ligne chacun
#   Derniere entree de journal  le pourquoi, que git ne porte pas
#
# Le journal est resume par son titre et sa section d'ouverture, pas affiche
# en entier : une entree fait couramment 150 lignes, l'assistant peut toujours
# la lire en entier si le sujet s'y rattache.
#
# Il n'echoue jamais : hors depot git, sur un depot vide ou sans journal, il
# sort en 0 sans rien dire. Un hook de demarrage qui casse bloquerait toutes
# les sessions du projet.

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

# Un depot sans aucun commit n'a ni HEAD ni log : rien a raconter.
git rev-parse HEAD >/dev/null 2>&1 || exit 0

echo "ETAT DU PROJET AU DEMARRAGE (hook SessionStart, non sollicite)"
echo

# --- Branche et working tree ---------------------------------------------

branche=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
modifies=$(git status --porcelain 2>/dev/null | grep -cv '^??' || true)
non_suivis=$(git status --porcelain 2>/dev/null | grep -c '^??' || true)

printf 'Branche      : %s' "$branche"
if [ "$branche" = "main" ]; then
    printf '  (ne jamais coder directement ici, creer une branche)'
fi
printf '\n'

if [ "${modifies:-0}" -eq 0 ] && [ "${non_suivis:-0}" -eq 0 ]; then
    echo "Working tree : propre"
else
    printf 'Working tree : %s modifie(s), %s non suivi(s)\n' \
        "${modifies:-0}" "${non_suivis:-0}"
fi

# --- Ecart avec la reference distante ------------------------------------
#
# Sans fetch : un hook de demarrage ne fait pas d'appel reseau, il retarderait
# chaque session. La reference locale de origin/main suffit a signaler du
# travail non pousse, qui est le cas qu'on veut attraper.

if git rev-parse --verify origin/main >/dev/null 2>&1; then
    avance=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
    if [ "${avance:-0}" -gt 0 ]; then
        printf 'Non livre    : %s commit(s) absent(s) de origin/main\n' "$avance"
    fi
fi

# --- Derniers commits -----------------------------------------------------

echo
echo "Derniers commits :"
git log -5 --format='  %h  %s' 2>/dev/null || true

# --- Derniere entree de journal -------------------------------------------
#
# Le tri est lexicographique sur un nom de fichier en AAAA-MM-JJ-sujet.md,
# donc chronologique par construction. Plusieurs entrees peuvent porter la
# meme date, la derniere du tri est alors la plus recemment nommee.

derniere=$(ls docs/journal/[0-9]*.md 2>/dev/null | sort | tail -1)

echo
if [ -n "$derniere" ]; then
    echo "Derniere entree de journal : $derniere"
    # Titre, puis les premieres lignes de PROSE. Les lignes de tableau sont
    # ecartees : chaque entree ouvre sur un tableau de metadonnees dont la
    # ligne 'Documents modifies' fait a elle seule 400 caracteres, et qui
    # redit ce que git montre deja. Ce qu'on veut ici est le pourquoi, qui
    # vit dans la prose qui suit.
    sed -n '1,60p' "$derniere" 2>/dev/null \
        | grep -v '^\s*$' \
        | grep -v '^\s*|' \
        | grep -v '^\s*```' \
        | cut -c1-160 \
        | head -8 \
        | sed 's/^/  /'
    echo
    echo "  (extrait. Lire l'entree en entier si le travail s'y rattache)"
else
    echo "Aucune entree dans docs/journal/."
fi

echo
echo "Le detail par domaine vit dans .claude/rules/, charge selon les chemins"
echo "touches. Le skill sprint porte le cycle de travail complet."

exit 0
