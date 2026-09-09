# 9 septembre 2026, la mesure a démenti l'hypothèse

| Champ | Valeur |
|---|---|
| Ticket | SP-592, cinquième des six tickets issus de l'audit |
| Documents modifiés | `vitest.config.ts`, `src/lib/__tests__/auth.config.authorized.test.ts` |
| Contrôles | type-check vert, lint sans erreur, 3327 tests verts sur 202 fichiers, couverture 52,38 % |
| Jira | SP-592 commenté |
| Mémoire | fiche sur les dossiers exclus mieux couverts que le reste |

## Ce qui a été fait

Le ticket partait d'une hypothèse : la configuration excluait `src/lib/`,
`src/app/`, `src/hooks/` et `src/lib/validations/` de la mesure, avec un seuil à
20 %, donc le chiffre de couverture était faussement rassurant et masquait du
code critique peu testé.

La mesure a démenti la seconde moitié. En incluant ces dossiers, la couverture
globale **monte**, de 43,4 % à 45,2 %. Ils sont mieux couverts que la moyenne
du projet :

```
src/lib/actions    67,7 %      permissions.ts       100 %
src/lib/services   76,2 %      impersonation.ts     100 %
src/lib/stripe     95,9 %      subscription-guard   34 tests
src/lib/csv        98,9 %      src/app (pages)     29,3 %
```

Ce qui tirait le chiffre vers le bas, ce sont les composants de page,
légitimement couverts par les E2E. Le défaut réel n'était pas « le code risqué
n'est pas testé » mais « la mesure ne porte pas là où se trouve le risque ». Le
travail n'était donc pas d'écrire des dizaines de tests, mais de corriger le
périmètre et de poser des seuils vrais.

## Les écarts

**Un trou réel, que seule la mesure pouvait révéler.** `auth.config.ts`
plafonnait à 55,4 % en lignes et 67,3 % en branches. Les lignes non couvertes
sont les deux gardes d'impersonation du middleware, étapes 7 et 8 : le
détournement d'un `SYSTEM_ADMIN` hors de `/app/admin` pendant une impersonation,
et le court-circuit du guard d'abonnement (SP-456). Deux branches
d'autorisation, que la règle du projet impose de tester.

Elles n'étaient atteintes par aucun test. Les cas que j'avais écrits en SP-589
passaient un `cookies.get` retournant toujours `undefined` : le corps du `if`
restait mort, sans que rien ne le signale. Six tests ajoutés, dont le cookie
corrompu et le cookie JSON valide sans `originalAdminId`. `auth.config.ts` passe
à 71,4 % en lignes et 84,4 % en branches.

**Le périmètre plutôt que l'exclusion en bloc.** `src/app/` n'est pas réintégré
entièrement : les fichiers `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
et les composants de section restent exclus. Un composant de page rendu sans
logique est exactement le test cosmétique supprimé en mars 2026.
`src/app/api/**` reste mesuré, les routes portant de la logique.

**Le chiffre final est plus haut qu'au départ.** 52,38 % contre 43,4 %, sur un
périmètre pourtant plus pertinent. Retirer les pages présentationnelles pèse
plus que d'ajouter le code critique, précisément parce que celui-ci est bien
testé.

**Une restauration de fichier qui n'a pas eu lieu.** Une commande de mesure
interrompue (code 144) a laissé `vitest.config.ts` modifié, la ligne de
restauration n'ayant jamais été atteinte. Vérifié et corrigé avant de continuer.
Le réflexe utile : après une commande interrompue, contrôler l'état du fichier
plutôt que supposer que le nettoyage a eu lieu.

## Prochaine étape

SP-593, le dernier des six : vérifier les promesses de conformité RGPD sur le
site rendu, puis les rendre démontrables. C'est le seul point de la série que je
n'ai pas constaté moi-même, il provient de l'analyse externe et la première
étape est de l'infirmer ou de le confirmer.

Après quoi la branche entière est prête à être poussée. Rien ne l'est encore.
