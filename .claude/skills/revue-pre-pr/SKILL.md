---
name: revue-pre-pr
description: Balayer un travail terminé avant d'ouvrir la PR, sur les défauts que type-check, lint et les tests ne voient pas. Utiliser quand le code est écrit et vérifié, avant de pousser, ou quand Christophe demande une relecture avant PR.
---

# Revue avant PR

S'utilise **après** l'étape de vérification du skill `sprint`, jamais à sa
place. Les commandes y sont déjà passées au vert : ce balayage porte sur ce
qu'elles ne voient pas.

## Pourquoi ce skill existe

Sur ce projet, les défauts coûteux ont tous franchi `type-check` et
`npm run test` sans broncher. Ce n'est pas un hasard, ils partagent un profil :
du code valide, simplement faux.

`text-blue-600` est une classe Tailwind parfaitement légitime, hors palette.
Un export non-async dans un fichier `'use server'` compile et donne un 503 en
production. Un spec absent du `testMatch` laisse la CI verte en testant moins.
Une page sans `.public-scope` s'affiche correctement chez toi et vire au sombre
chez un utilisateur ayant choisi ce thème.

Chaque point ci-dessous vient d'un incident réel, pas d'une bonne pratique
générique.

## 1. Établir le périmètre réel

```bash
git diff origin/main...HEAD --stat
git diff origin/main...HEAD --name-only
```

Le périmètre est la liste des fichiers **modifiés**, pas la liste des fichiers
que le ticket annonçait. Les deux divergent presque toujours.

## 2. Rédaction, sur tout le diff

Le tiret cadratin et demi-cadratin est interdit dans le contenu produit. Il
n'est pas rattrapé rétroactivement, mais il ne doit pas en entrer de nouveau :

```bash
git diff origin/main...HEAD -U0 | grep -n '^+' | grep -P '[\x{2014}\x{2013}]'
```

Sur macOS, `grep -P` peut manquer. Repli :

```bash
git diff origin/main...HEAD -U0 | grep '^+' | grep -e '—' -e '–'
```

Une occurrence dans du contenu **visible par un utilisateur** se corrige
toujours, l'impact est produit. Vérifier aussi les accents français complets :
un `é` devenu `e` dans une chaîne d'interface est une régression visible.

## 3. Si le diff touche une page publique

Charger `.claude/rules/seo-content.md` si ce n'est pas déjà fait dans la
session, puis vérifier :

- **`.public-scope`** sur le conteneur racine, ou `PublicPageShell` qui le
  porte. Sans lui, la page suit le thème de l'application
- **Aucune variante `dark:`**, les pages publiques n'ont qu'un mode clair
- **Tokens `public-*` uniquement.** Chercher les classes Tailwind brutes
  introduites par le diff :
  ```bash
  git diff origin/main...HEAD -U0 | grep '^+' | grep -oE '\b(text|bg|border)-(blue|slate|gray|zinc|neutral|red|green|indigo)-[0-9]{2,3}\b' | sort -u
  ```
  Le garde-fou de tests ne voit pas ce défaut : ces classes sont valides,
  simplement hors palette
- **Texte blanc sur aplat bleu franc.** Seul le blanc pur y passe le seuil AA,
  ni `content-on-dark` ni `content-on-vivid`
- **Constantes partagées** : toucher `(landing)/components/styles.ts` impose de
  suivre ses usages réels, elles servent plus de pages que leur commentaire ne
  le dit. Deux s'y sont démodées en silence
- **`llms.txt` et `llms-full.txt`** à jour, et `PAGE_LAST_MODIFIED` de
  `sitemap.ts` portant une date réelle
- **Header et footer** : une nouvelle page publique s'ajoute aux deux
- **Accessibilité mesurée**, jamais calculée à la main :
  ```bash
  npx playwright test e2e/specs/landing/
  ```
  Ces specs ne sont pas dans la whitelist CI, donc elles ne tourneront pas
  toutes seules

**Parcourir les pages rendues au navigateur**, pas seulement la liste des
fichiers modifiés. Les douze zones oubliées de la refonte d'août 2026 ont
toutes été vues à l'écran, aucune par la lecture du code.

## 4. Si le diff touche une Server Action, une route API ou Prisma

Charger `.claude/rules/multi-tenant.md`, puis :

- **Chaque ternaire dans un `where`.** Une clause qui peut valoir `undefined`
  élargit silencieusement le périmètre de la requête :
  ```bash
  git diff origin/main...HEAD -U0 | grep '^+' | grep -nE '\?.*:\s*undefined'
  ```
- **Le `findMany` qui choisit les destinataires** d'un email ou d'une
  notification est un point d'isolation, au même titre qu'une lecture
- **Test négatif présent** : prouver qu'un utilisateur de l'entreprise A
  n'obtient rien sur une ressource de B. Un test nominal ne prouve rien
- **Invalidation du cache** sur toute action mutative :
  `invalidateDashboardCache(companyId)` plus les `revalidatePath` des deux
  routes par rôle, `/app/dashboard` seul n'en couvre aucune

En cas de doute sur un test d'isolation, le prouver par mutation : casser
volontairement le code, vérifier que le test rougit, restaurer.

## 5. Tests et CI

- **Whitelist E2E** : tout spec ajouté, renommé ou supprimé impose de relire le
  `testMatch` de `playwright.ci.config.ts`. Vérifier aussi qu'aucune entrée
  existante ne pointe vers un fichier disparu, une entrée morte ne fait échouer
  aucune configuration
- **Aucun test cosmétique** introduit : rendu pur, passage de props, attributs
  SVG. Le projet en a supprimé environ 197
- **Compteurs mesurés**, jamais cités de mémoire

## 6. Le compte rendu

Énoncer, point par point, ce qui a été vérifié et **avec quelle commande**. Un
point non vérifié se dit tel quel plutôt que de se supposer vert.

Si un contrôle échoue, le rapporter avec sa sortie. Contourner un test qui
rougit reporte le défaut sur la production, où il coûte incomparablement plus
cher.

## 7. Pousser

```bash
git push -u origin <branche>
gh pr create --draft   # même en draft
```

Un push sans PR ne déclenche aucun workflow sur ce projet. Le CD attend un CI
entièrement vert, E2E comprises. Attendre le retour de la CI avant de conclure,
et interroger le **run** plutôt que les checks : un check vert sur un run annulé
par un push suivant ne valide rien.

```bash
gh run list --branch <branche> --limit 3
gh run view <id>
```
