#!/usr/bin/env bash
#
# Hook PostToolUse (Edit|Write) : verifie mecaniquement deux pieges du projet.
#
# Pourquoi il existe, et en quoi il differe de hook-rappel-regles.sh. Ce
# dernier RAPPELLE une regle a lire, en se fondant sur le chemin du fichier.
# C'est le bon outil pour une convention qui demande du jugement.
#
# Les deux pieges couverts ici ne demandent aucun jugement : ils se constatent.
# Un rappel les traite donc moins bien qu'une verification, parce qu'un rappel
# repete a chaque ecriture finit par etre lu comme du bruit, alors qu'un
# constat ne se declenche que lorsque le defaut est reellement present.
#
# Les deux sont documentes trois fois chacun dans .claude/rules/ et se sont
# quand meme produits. Ils partagent un profil : INVISIBLES a la verification
# habituelle. Ni type-check, ni lint, ni npm run test ne les voient.
#
#   1. Whitelist E2E   un spec absent du testMatch de playwright.ci.config.ts
#                      ne tourne pas en CI. Aucune erreur, aucun avertissement,
#                      la suite passe au vert en testant moins qu'on croit.
#                      Audit de juillet 2026 : 6 entrees mortes.
#
#   2. 'use server'    un export non-async dans un fichier 'use server' donne
#                      un 503 EN PRODUCTION, pas une erreur de build. Le defaut
#                      ne se voit qu'apres deploiement.
#
# Il AVERTIT, il ne bloque pas, et sort toujours en 0. Un faux positif qui
# bloque une ecriture coute plus cher que le defaut qu'il attrape : sur le
# point 2 notamment, l'analyse est textuelle et ne comprend pas le TypeScript.

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

input=$(cat 2>/dev/null) || exit 0
fichier=$(echo "$input" | jq -r '.tool_input.file_path // ""' 2>/dev/null) || exit 0
[ -z "$fichier" ] && exit 0
[ -f "$fichier" ] || exit 0

relatif=${fichier#"$PWD"/}
avertissements=()

# --- 1. Whitelist E2E de la CI --------------------------------------------
#
# testMatch liste des chemins RELATIFS A testDir ('./e2e/specs'). La
# comparaison porte donc sur le chemin ampute de ce prefixe, pas sur le
# basename : 'auth.spec.ts' et 'auth/forgot-reset-password.spec.ts' coexistent
# dans la liste, un basename seul les confondrait.

case "$relatif" in
    e2e/specs/*.spec.ts)
        config="playwright.ci.config.ts"
        cle=${relatif#e2e/specs/}

        if [ -f "$config" ] && ! grep -qF "'$cle'" "$config" 2>/dev/null; then
            # Absent de la whitelist. Ce n'est pas forcement un defaut : la
            # whitelist est volontairement restreinte aux tests critiques, le
            # reste tourne en nightly. On signale sans trancher.
            avertissements+=(
"Whitelist E2E : '$cle' n'est PAS dans le testMatch de $config.
    Ce spec ne tournera donc pas en CI, seulement en nightly. C'est un choix
    valide pour un test non critique. Si le spec couvre l'auth, le RBAC, un
    CRUD principal ou le workflow conges, il doit y figurer.
    Verifier aussi qu'aucune entree de la liste ne pointe vers un fichier
    renomme ou supprime : une entree morte ne fait echouer aucune config."
            )
        fi
        ;;
esac

# --- 2. 'use server' n'exporte que de l'async ------------------------------
#
# Analyse textuelle volontairement simple, sur les exports de premier niveau
# (colonne 0). Elle attrape le cas reel : une constante, un type ou un schema
# Zod laisse dans un fichier d'actions.
#
# 'export type', 'export interface' et 'export default async' sont exclus :
# les deux premiers disparaissent a la compilation et ne produisent aucun
# export a l'execution, le troisieme est async.

premiere_ligne=$(grep -m1 -v '^\s*$' "$fichier" 2>/dev/null | tr -d " \t")
case "$premiere_ligne" in
    "'useserver'"*|'"useserver"'*)
        fautifs=$(grep -nE '^export ' "$fichier" 2>/dev/null \
            | grep -vE '^[0-9]+:export (async |type |interface |default async )' \
            | grep -vE '^[0-9]+:export \{[^}]*\} from' \
            | head -5 || true)

        if [ -n "$fautifs" ]; then
            avertissements+=(
"'use server' STRICT : ce fichier exporte autre chose qu'une fonction async.
$(printf '%s\n' "$fautifs" | sed 's/^/      /')
    Un export non-async dans un fichier 'use server' provoque un 503 EN
    PRODUCTION, pas une erreur de build : ni type-check ni les tests ne le
    verront. Deplacer types, constantes et schemas Zod dans un fichier separe.
    Detail : .claude/rules/prisma-pieges.md"
            )
        fi
        ;;
esac

[ ${#avertissements[@]} -eq 0 ] && exit 0

{
    echo "VERIFICATION MECANIQUE ($relatif) :"
    for a in "${avertissements[@]}"; do
        echo "  - $a"
    done
    echo
    echo "Ces deux controles portent sur des defauts que type-check, lint et"
    echo "les tests ne voient pas. Traiter avant de conclure."
} >&2

exit 0
