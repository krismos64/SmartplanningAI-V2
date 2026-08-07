#!/usr/bin/env bash
#
# Hook PostToolUse (Edit|Write) : rappelle la regle applicable au chemin modifie.
#
# Pourquoi il existe. CLAUDE.md ne porte plus que les principes, le detail vit
# dans .claude/rules/ et n'est pas charge d'office : c'est ce qui evite de payer
# 1000 lignes de contexte a chaque session. Le risque de ce decoupage est
# qu'une session modifie une zone sensible sans avoir lu la regle correspondante.
#
# Ce hook ferme ce trou. Il regarde le fichier qui vient d'etre ecrit et, si le
# chemin releve d'un domaine a regle, signale la regle a lire.
#
# Il AVERTIT, il ne bloque pas, et sort toujours en 0. Il reste silencieux sur
# les chemins sans regle : un hook qui parle a chaque ecriture devient un bruit
# qu'on apprend a ignorer.

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

input=$(cat 2>/dev/null) || exit 0
fichier=$(echo "$input" | jq -r '.tool_input.file_path // ""' 2>/dev/null) || exit 0
[ -z "$fichier" ] && exit 0

# Chemin relatif au projet, pour que les motifs restent lisibles
relatif=${fichier#"$PWD"/}

regles=()

# Isolation multi-tenant : Server Actions, API, auth, notifications, Prisma
case "$relatif" in
    *actions/*|*/actions/*|src/app/api/*|*/lib/auth*|*/lib/notifications*|*service.ts|prisma/schema.prisma)
        regles+=("multi-tenant.md : filtre companyId obligatoire, jamais de clause d'isolation conditionnelle") ;;
esac

# Pieges Prisma, 'use server', backfill, SQL
# lib/billing et lib/email sont inclus : ces fichiers cotoient des Server Actions
# et tombent sur le meme piege 'use server'. Ajoute apres SP-562, ou la logique
# d'engagement a d'abord ete ecrite dans un fichier 'use server' sans qu'aucun
# rappel ne se declenche.
case "$relatif" in
    *actions/*|*/actions/*|src/scripts/*|scripts/*|*.sql|*service.ts|*/lib/billing/*|*/lib/email/*)
        regles+=("prisma-pieges.md : 'use server' n'exporte que de l'async, mesurer avant tout DELETE") ;;
esac

# Contenu public
case "$relatif" in
    *"(sectors)"*|*"(guides)"*|*sitemap.ts|public/llms*|*landing*|*Landing*|*Footer*|*footer*)
        regles+=("seo-content.md : registre data-driven, aucun concurrent nomme, llms.txt et sitemap a mettre a jour") ;;
esac

# Tests
case "$relatif" in
    *.test.ts|*.test.tsx|*.spec.ts|e2e/*|playwright*.config.ts)
        regles+=("tests.md : pas de test cosmetique, test negatif obligatoire en zone critique, verifier la whitelist CI") ;;
esac

[ ${#regles[@]} -eq 0 ] && exit 0

{
    echo "REGLES applicables au fichier modifie ($relatif) :"
    for r in "${regles[@]}"; do
        echo "  - .claude/rules/$r"
    done
    echo
    echo "Lire la regle si elle ne l'a pas deja ete dans cette session, avant de"
    echo "considerer la modification comme terminee."
} >&2

exit 0
