---
name: sprint
description: Conduire un travail sur SmartPlanning de bout en bout, ticket SP-XXX ou exploration libre, en chargeant les règles applicables et en clôturant la traçabilité. Utiliser dès que le travail touche le code, le schéma, le contenu public ou un document du projet, que Christophe cite une clé SP-XXX ou non.
---

# Conduire un travail sur SmartPlanning

S'applique à **tout** travail sur le projet, pas seulement aux tickets. Une
exploration technique, une correction de documentation ou un correctif suivent le
même cycle. La seule différence est la présence ou l'absence d'un ticket Jira au
départ.

## 1. Identifier le cadre

**Avec une clé de ticket** (`SP-542`, ou « le ticket sur les abonnements») : lire
le ticket via le MCP Atlassian.

YOU MUST lire les **commentaires**, pas seulement la description. Ils ne
reviennent pas par défaut, il faut demander explicitement le champ `comment` :

```
getJiraIssue  fields: ["summary","status","description","comment"]
```

Un commentaire récent rectifie souvent une description qui n'a pas été réécrite.
**Le plus récent l'emporte.** Signaler l'écart à Christophe plutôt que de le
résoudre en silence.

**Sans clé de ticket** : identifier à quel ticket ou sprint le travail se
rattache, et le dire. Si rien ne correspond, proposer de créer le ticket avant de
coder.

## 2. Charger les règles applicables

Avant d'écrire du code, lire la ou les règles correspondant aux chemins qui vont
être touchés. La table d'aiguillage est dans `CLAUDE.md`.

| Le travail touche | Lire |
|---|---|
| Server Action, API, Prisma, auth, notifications | `.claude/rules/multi-tenant.md` |
| `'use server'`, backfill, SQL, Nginx, cache | `.claude/rules/prisma-pieges.md` |
| Pages secteur, guides, landing, sitemap, `llms.txt` | `.claude/rules/seo-content.md` |
| Tests | `.claude/rules/tests.md` |

Ne pas reconstruire une convention de mémoire quand la règle existe. Le hook
`PostToolUse` rappelle la règle applicable après chaque écriture : si un rappel
apparaît pour une règle non lue, la lire avant de conclure.

## 3. Vérifier l'état de départ

```bash
git status          # working tree propre attendu
git branch --show-current
```

Ne jamais travailler directement sur `main`. Créer une branche au nom du sujet :
`fix/sujet-court`, `feat/sujet-court`, `docs/sujet-court`.

## 4. Coder

Convention TypeScript strict, validation Zod aux frontières, pas de `any`.

**Consulter Context7** pour toute API Next.js 15, React 19, Prisma ou Stripe :
ces versions dépassent ma connaissance. Signaler « Via Context7 » quand c'est
fait.

Sur une zone d'isolation multi-tenant, écrire le test négatif **avant** de
considérer le code terminé : prouver qu'un utilisateur de l'entreprise A
n'obtient rien sur une ressource de B.

## 5. Vérifier

```bash
npm run type-check
npm run test
npm run test:e2e:ci   # si l'interface bouge
```

**Montrer la preuve** : sortie de commande à l'appui. Ne jamais affirmer que ça
marche sans l'avoir exécuté. Si un test échoue, le dire avec sa sortie plutôt que
de le contourner.

Après tout ajout, renommage ou suppression de spec Playwright, vérifier le
`testMatch` de `playwright.ci.config.ts` : un spec absent de cette liste
disparaît silencieusement de la CI.

## 6. Commiter

Commits conventionnels : `feat:`, `fix:`, `docs:`, `test:`, `chore:`.

JAMAIS de `Co-Authored-By: Claude`. Jamais de tiret cadratin dans le message.

## 7. Clore la traçabilité

YOU MUST clore sur les canaux applicables, et **dire explicitement** ce qui a été
mis à jour :

1. **Dépôt** : commité. Le push et la PR sont groupés en fin de sprint, choix
   assumé pour économiser les minutes GitHub Actions. En fin de sprint : pousser,
   ouvrir la PR même en draft, attendre la CI verte, merger
2. **Journal** : une entrée `docs/journal/AAAA-MM-JJ-sujet.md` par session de
   travail significative. Format et règles dans `docs/journal/README.md`. Elle
   porte ce que git ne dit pas : pourquoi, ce qui a été mesuré, ce qui reste
   ouvert
3. **Jira** : état réel de chaque critère, commit de référence, ce qui reste
4. **Confluence** : doc liée si la feature en a une
5. **Mémoire** : toute découverte non dérivable du code ni de l'historique git

Un travail non tracé sera refait ou contredit.

## Rappels qui coûtent cher

- Le CD ne se déclenche que si le CI passe entièrement, E2E comprises
- Un push sans PR ne déclenche aucun workflow : ouvrir une PR même en draft
- Un backfill en production ne passe jamais par `src/scripts/*.ts` : traduire en
  SQL, mesurer par un `SELECT` portant la clause exacte, puis exécuter en
  transaction. Mesurer avant de supprimer
