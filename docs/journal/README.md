# Journal de développement

Une entrée par session de travail, un fichier par entrée, nommé
`AAAA-MM-JJ-sujet-en-kebab-case.md`.

## Pourquoi ce format

Le journal a d'abord vécu dans un fichier unique, `development-log.md`, rempli
par ajouts successifs. Il a atteint 1316 lignes, accumulé sept sections en
double, puis cessé d'être tenu à jour au 12 mai 2026 : les trois mois suivants,
soit une centaine de commits, n'y figurent pas.

La cause est structurelle. Un fichier unique se relit mal, se met à jour à
contrecœur, et chaque ajout se fait au même endroit. Un fichier par session
supprime ces trois frictions. L'ancien journal est conservé tel quel dans
`archive/`, il reste la source pour tout ce qui précède le 12 mai 2026.

## À quoi il sert

Git dit **ce qui** a changé. Le journal dit **pourquoi**, ce qui a été mesuré, ce
qui a été écarté et ce qui reste ouvert. C'est l'information qu'un `git log` ne
porte pas et qu'on reconstitue mal six mois plus tard.

Lire l'entrée la plus récente en début de session donne l'état réel du projet
plus vite que Jira.

## Format d'une entrée

Un tableau d'en-tête, puis le récit. Le tableau rend l'entrée scannable sans la
lire en entier.

```markdown
# 7 août 2026, titre qui dit ce qui a été fait

| Champ | Valeur |
|---|---|
| Ticket | SP-XXX, ou l'exploration à laquelle le travail se rattache |
| Documents produits | fichiers créés |
| Documents modifiés | fichiers modifiés |
| Contrôles | type-check, tests, E2E : résultat réel |
| Jira | tickets créés, commentés, transitionnés |
| Mémoire | fiches créées ou réécrites |

## Ce qui a été fait

Le récit, avec les chiffres mesurés plutôt que des appréciations.

## Les écarts

Ce qui a dérivé du plan, et l'arbitrage retenu.

## Prochaine étape

Ce qui reste ouvert, pour la session suivante.
```

## Règles

- **Chiffres mesurés, jamais de mémoire.** « 3066 tests verts » se vérifie avec
  `npm run test`, ne se cite pas de tête
- **Un journal qui présente comme « à faire » une tâche déjà faite est pire
  qu'un journal absent.** Corriger l'entrée plutôt que d'en empiler une nouvelle
- Pas de tiret cadratin, accents français complets
