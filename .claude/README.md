# Configuration Claude Code du projet

Ce dossier configure l'assistant de développement utilisé sur SmartPlanning. Il
est versionné volontairement : ces fichiers documentent les conventions du projet
au même titre que le code, et une convention qui vit sur une seule machine finit
par diverger.

## Ce que contient ce dossier

```
.claude/
├── settings.json        permissions et déclaration des hooks (versionné)
├── settings.local.json  spécificités machine (ignoré par git)
├── rules/               règles détaillées, chargées selon les chemins touchés
├── scripts/             les six hooks
├── agents/              agents spécialisés du projet
└── skills/              sprint (cycle de travail) et revue-pre-pr (balayage
                         avant PR)
```

## Le principe : charger le contexte à la demande

Un fichier d'instructions unique est lu **intégralement à chaque session**, y
compris quand le travail ne concerne qu'un dixième de son contenu. Sur un projet
qui accumule des conventions, ce fichier grossit jusqu'à coûter plus qu'il ne
rapporte.

Le découpage retenu sépare deux natures d'information :

- **`CLAUDE.md`**, à la racine, porte les principes et une table d'aiguillage.
  Court, toujours chargé.
- **`.claude/rules/`** porte le détail par domaine. Quatre fichiers, environ 360
  lignes, chargés seulement quand le travail touche le domaine concerné.

Modifier une page publique ne charge donc pas les règles d'isolation
multi-tenant, et l'inverse est vrai.

| Règle              | Domaine                                                    |
| ------------------ | ---------------------------------------------------------- |
| `multi-tenant.md`  | isolation `companyId`, RBAC, sélection de destinataires    |
| `prisma-pieges.md` | `'use server'`, backfills en production, SQL, Nginx        |
| `seo-content.md`   | pages secteur, guides, sitemap, contenu citable par les IA |
| `tests.md`         | conventions Vitest et Playwright, tests négatifs           |

## Le risque de ce découpage, et le hook qui le ferme

Sortir le détail du fichier toujours chargé crée un trou : une session peut
modifier une zone sensible sans avoir lu la règle correspondante.

`hook-rappel-regles.sh` ferme ce trou. Après chaque écriture, il regarde le
chemin du fichier et signale la règle applicable. Il reste silencieux sur les
chemins sans enjeu, un hook qui parle à chaque écriture devient un bruit qu'on
apprend à ignorer.

## Les six hooks

| Déclencheur    | Script                       | Rôle                                        |
| -------------- | ---------------------------- | ------------------------------------------- |
| `SessionStart` | `hook-etat-session.sh`       | pose l'état de départ dans le contexte      |
| `PreToolUse`   | `hook-block-secret-files.sh` | bloque la **lecture** des secrets           |
| `PostToolUse`  | `hook-rappel-regles.sh`      | rappelle la règle du domaine touché         |
| `PostToolUse`  | `hook-verif-mecanique.sh`    | **vérifie** whitelist E2E et `'use server'` |
| `Stop`         | `hook-warn-unpushed.sh`      | signale le travail non poussé               |
| `Stop`         | `hook-tracabilite.sh`        | signale le journal et les tickets à clore   |

`SessionStart` a une propriété qu'aucun autre hook ne partage : son stdout est
injecté comme contexte visible par l'assistant. `CLAUDE.md` demandait de lire la
dernière entrée de `docs/journal/` en début de session sans qu'aucun mécanisme
ne l'applique ; le hook le fait, et pose au passage la branche, l'état du
working tree et les derniers commits. Ce qui coûtait trois ou quatre appels
d'outils, ou partait d'un état périmé quand ils étaient sautés, est acquis avant
le premier message. Il reste tenu à un écran : un hook de démarrage verbeux paie
du contexte à chaque session, y compris les courtes qui n'en font rien.

`hook-verif-mecanique.sh` diffère de `hook-rappel-regles.sh` sur un point de
nature. Le second **rappelle** une règle à lire, ce qui convient à une
convention demandant du jugement. Les deux pièges du premier ne demandent aucun
jugement, ils se constatent : un rappel les traiterait moins bien, parce qu'un
rappel répété à chaque écriture se lit comme du bruit, alors qu'un constat ne
parle que lorsque le défaut est présent. Tous deux étaient documentés trois fois
dans `rules/` et se sont quand même produits. Ils partagent un profil :
invisibles à `type-check`, à `lint` et aux tests. Un spec hors du `testMatch`
laisse la CI verte en testant moins qu'on croit, et un export non-async dans un
fichier `'use server'` donne un 503 en production sans jamais casser le build.

Le contrôle `'use server'` a été mesuré contre les 29 fichiers concernés du
dépôt : aucun faux positif, et il rougit bien sur un cas fautif construit.

`hook-block-secret-files.sh` porte une nuance qu'une règle de permission ne sait
pas exprimer :
l'**écriture** dans un `.env` est autorisée, la **lecture** est bloquée. Ajouter
une variable ou générer un secret avec `openssl` n'exige pas de lire l'existant,
alors qu'une valeur lue entrerait dans l'historique de session sur disque. Clés
privées et certificats sont bloqués dans les deux sens : une clé se génère, elle
ne s'édite pas.

`hook-tracabilite.sh` répond au même raisonnement que le hook de règles : une consigne
écrite mais non vérifiée s'érode en silence, parce que chaque oubli ressemble à
un cas isolé. Le journal précédent en est la démonstration, il a cessé d'être
tenu au 12 mai 2026 et personne ne l'a vu pendant trois mois. Le hook ne
consulte pas l'API Jira volontairement : il faudrait un jeton en `.env`, donc un
secret de plus sur un dépôt public, lu par le hook qui bloque justement la
lecture des `.env`. Extraire les clés `SP-XXX` des commits du jour couvre le cas
réel, oublier de commenter un ticket sur lequel on vient de travailler.

C'est ce hook qui porte la protection, pas les règles `deny` de `settings.json`,
qui restent en seconde ligne. Un hook sortant en code 2 bloque l'appel **avant**
l'évaluation des permissions, et il peut normaliser le chemin avant de le
comparer. Les motifs du hook sont insensibles à la casse : macOS monte par défaut
un système de fichiers insensible à la casse, où `.ENV` et `.env` désignent le
même fichier, et un motif sensible à la casse s'y contourne en changeant une
lettre.

## Pourquoi ces règles-là

Elles ne sont pas théoriques. Chaque entrée correspond à un défaut qui a coûté du
temps ou provoqué un incident.

La plus importante vient d'une fuite de données entre clients survenue en août 2026. Dans la sélection des managers à notifier d'une demande de congé :

```ts
managedTeams: teamId ? { some: { id: teamId } } : undefined
```

Quand l'employé n'a pas d'équipe, `teamId` vaut `null`, donc la clause vaut
`undefined`. Prisma traite `undefined` comme « critère absent », pas comme « ne
matche rien » : la requête devenait « tous les employés actifs », sans filtre
d'entreprise. Chaque manager de la base, toutes entreprises confondues, recevait
le nom de l'employé et ses dates d'absence.

Deux enseignements sont inscrits dans `multi-tenant.md` : une clause d'isolation
n'est jamais conditionnelle, et le `findMany` qui choisit **qui reçoit** une
notification est un point d'isolation au même titre qu'une lecture de données.

Le nettoyage qui a suivi a produit une seconde règle, dans `prisma-pieges.md` :
mesurer avant de supprimer. Les `SELECT` de contrôle ont montré qu'aucune ligne
n'avait fuité en base. Un `DELETE` lancé directement aurait « réussi » sur zéro
ligne et laissé croire à un nettoyage effectif.

## Agents

Cinq agents spécialisés, calibrés sur cette stack précise, Next.js 15,
NextAuth v5, PostgreSQL 16, Redis 7 et multi-tenant : `test-writer`,
`security-auditor`, `nextjs-architect`, `docker-devops` et
`public-content-reviewer`.

Le dernier relit une page publique **rendue**, pas lue. Il porte la leçon de la
refonte d'août 2026 : douze zones oubliées, toutes trouvées à l'écran et aucune
par la lecture des fichiers modifiés.

Ils vivent dans le projet plutôt qu'au niveau utilisateur, précisément parce
qu'ils sont calibrés : proposés sur un projet mono-tenant sans Redis, ils
donneraient de mauvais conseils avec assurance.

## Skills

`sprint` porte le cycle complet : lire le ticket **et ses commentaires**, un
commentaire récent rectifiant souvent une description non réécrite, charger les
règles du domaine, coder, vérifier avec la preuve à l'appui, puis clore la
traçabilité sur les canaux applicables (dépôt, journal, Jira, mémoire).

`revue-pre-pr` s'intercale entre la vérification et le push, et ne remplace ni
l'une ni l'autre. Les commandes y sont déjà vertes : il balaie ce qu'elles ne
voient pas. Sur ce projet, les défauts coûteux ont tous franchi `type-check` et
`npm run test` sans broncher, parce qu'ils partagent un profil, du code valide
et simplement faux. `text-blue-600` est une classe Tailwind légitime, hors
palette. Une page sans `.public-scope` s'affiche correctement chez son auteur et
vire au sombre chez un utilisateur ayant choisi ce thème.

## Ce qui reste hors du dépôt

`settings.local.json` porte les permissions propres à une machine. Aucun secret
n'y figure : l'accès au serveur passe par un alias SSH avec clé publique, jamais
par un mot de passe écrit dans un fichier de configuration.
