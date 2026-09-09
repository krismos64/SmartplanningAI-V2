# 9 septembre 2026, le pipeline qui annonçait un succès sur une production morte

| Champ | Valeur |
|---|---|
| Ticket | SP-588, premier des six tickets ouverts après un audit externe |
| Documents produits | `scripts/ops/test-cd-rollback.sh` |
| Documents modifiés | `.github/workflows/cd.yml` |
| Contrôles | type-check vert, lint sans erreur, 3281 tests verts sur 197 fichiers, test de rollback vert sur 4 scénarios |
| Jira | SP-588 à SP-593 créés, SP-342, SP-458 et SP-459 clos pour abandon |
| Mémoire | fiche à écrire sur le healthcheck non bloquant |

## Ce qui a été fait

La session part d'une analyse externe du dépôt, apportée par Christophe. J'ai
vérifié ses affirmations testables une par une plutôt que de les reprendre :
la quasi-totalité se confirme littéralement, y compris le nombre de 18 alertes
npm en production et les 3281 tests. Trois points restaient invérifiables faute
d'accès (compteurs E2E, correspondance entre le commit audité et le déployé,
formulations du site public), et je les ai signalés comme tels.

Le défaut le plus grave se lisait à `cd.yml:304-309`. Après 30 healthchecks en
échec, le script écrivait « Déploiement terminé (avec warnings) », le job
continuait, et l'étape suivante écrivait « Déploiement réussi » dans le résumé
GitHub. Un conteneur qui ne démarrait jamais devenait la version de production,
annoncée comme un succès.

Trois corrections, toutes sur le même fichier :

Le healthcheck sort désormais en code 1. Avant de sortir, il restaure l'image
qui tournait avant le remplacement, capturée par `docker inspect` sur le
conteneur running plutôt que lue dans le `.env`, puis revérifie qu'elle répond.
Le résumé de succès passe en `if: success()`, et un résumé d'échec le complète.

Le déploiement vise `sha-<commit>` et non plus `latest`, pour les migrations
comme pour le conteneur applicatif. Le compose lisait déjà
`${IMAGE_TAG:-latest}` : le mécanisme existait, la variable n'était simplement
jamais renseignée. Le tag passe par variable d'environnement plutôt que par
interpolation directe dans le script SSH, forme recommandée contre l'injection
dans les workflows.

Une clause `concurrency: cd-production` sérialise les déploiements.
`cancel-in-progress` reste à `false` volontairement : un déploiement en cours a
déjà migré la base, l'interrompre laisserait la production dans un état
indéterminé.

## Les écarts

**Le prune supprimait la cible du rollback.** `docker image prune -f` retirait
l'image de la version précédente dès qu'elle n'était plus référencée, ce qui
vidait de son sens le rollback que je venais d'écrire. Passé à
`--filter until=168h`, une semaine d'images conservées.

**Le job `migrate` tirait `latest` lui aussi**, ligne 206, ce que le ticket ne
mentionnait pas. Corrigé au passage, sans quoi les migrations pouvaient
s'appliquer depuis une image différente de celle déployée.

**Le rollback ne défait pas les migrations, et ne le peut pas.** Le job
`migrate` s'exécute avant le déploiement et Prisma ne revient pas en arrière.
Restaurer le code laisse donc le schéma en avant. Sans conséquence pour une
migration additive, cassant pour une migration destructive. J'ai documenté la
limite dans le fichier et dans le résumé d'échec plutôt que de laisser croire à
un retour arrière complet. La parade est le découpage expand/contract, qui
n'est aujourd'hui imposé par rien.

**Le test se fait sans VPS.** Prouver ce comportement en conditions réelles
demanderait de casser la production volontairement. `test-cd-rollback.sh`
extrait le corps du heredoc depuis le workflow lui-même, donc le code
réellement déployé, et le rejoue avec `docker`, `curl` et `sleep` simulés.
Quatre scénarios : healthcheck OK, échec avec rollback réussi, échec avec
rollback en échec, premier déploiement sans version précédente.

Le scénario 2 vérifie le tag exact reçu par `docker compose`, pas seulement
qu'un rollback a eu lieu : la différence entre « le rollback a tourné » et « le
rollback a restauré la bonne version ».

Vérifié par mutation : en réintroduisant le défaut dans le workflow, le test
rougit sur 4 assertions, dont le code de sortie qui repasse à 0. Restauré,
il redevient vert.

## Prochaine étape

SP-589, le middleware qui valide une session sur sa seule existence
(`!!auth` dans `auth.config.ts`) et les images distantes ouvertes à tout
domaine. Deux temps volontairement séparés : d'abord `!!auth?.user?.id` et la
liste stricte des domaines, sans risque, puis les montées de version de Next.js
et d'Auth.js avec la CI complète pour filet.

Restent ouverts SP-590 (limite de taille à l'import), SP-591 (aucun événement
du tunnel de conversion émis, le levier commercial), SP-592 (la couverture
exclut auth et Server Actions) et SP-593 (promesses RGPD à vérifier sur le site
rendu).

Le push et la PR sont groupés en fin de sprint, selon la règle du projet. Rien
n'est poussé à cette heure.

Point à reprendre : la description de l'epic SP-342, close pour abandon, décrit
en réalité SP-329 à SP-334 (recherche Spotlight, incidents, exports CSV,
onboarding wizard) et non le chatbot que son titre annonce. L'epic a été
recyclé sans que son corps soit réécrit, et une partie de ce qu'il décrit a été
livrée.
